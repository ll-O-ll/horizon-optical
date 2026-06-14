"use server"

import { nhostGraphqlClient } from "@/lib/nhost"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"
// No additional imports needed for fetch (available globally in Node 18+)
import { formatInTimeZone } from "date-fns-tz"

const TIMEZONE = "America/New_York"
const resend = new Resend(process.env.RESEND_API_KEY || "re_1234567890abcdef")

/**
 * Send an SMS via Textbelt.
 * Uses the API key stored in TEXTBELT_API_KEY environment variable.
 */
async function sendTextbeltSms(to: string, message: string): Promise<void> {
  try {
    const response = await fetch("https://textbelt.com/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: to,
        message,
        key: process.env.TEXTBELT_API_KEY,
      }),
    })
    const data = await response.json()
    if (!response.ok || data.success !== true) {
      console.error(`Textbelt SMS failed for ${to}:`, data)
    } else {
      console.log(`Textbelt SMS sent to ${to}`)
    }
  } catch (err) {
    console.error(`Error sending Textbelt SMS to ${to}:`, err)
  }
}

export async function getDashboardBookings() {
  const query = `
    query GetDashboardBookings {
      bookings(order_by: {start_time: desc}) {
        id
        client_name
        client_email
        start_time
        end_time
        service_type
        session_type
        status
        payment_status
        payment_method
        created_at
      }
    }
  `

  try {
    const data: any = await nhostGraphqlClient.request(query)
    return { success: true, bookings: data.bookings }
  } catch (error) {
    console.error("Error fetching admin bookings:", error)
    return { success: false, bookings: [], error }
  }
}

export async function updateBookingStatus(id: string, newStatus: string) {
  const mutation = `
    mutation UpdateBookingStatus($id: uuid!, $status: String!) {
      update_bookings_by_pk(pk_columns: {id: $id}, _set: {status: $status}) {
        id
        status
        client_name
        client_email
        start_time
        reminder_ids
      }
    }
  `

  try {
    const response: any = await nhostGraphqlClient.request(mutation, { id, status: newStatus })
    const updatedBooking = response.update_bookings_by_pk

    if (newStatus === "cancelled" && updatedBooking && updatedBooking.client_email) {
      // ── Cancel Scheduled Reminders ──
      if (updatedBooking.reminder_ids && Array.isArray(updatedBooking.reminder_ids) && updatedBooking.reminder_ids.length > 0) {
        console.log(`Cancelling ${updatedBooking.reminder_ids.length} reminders for cancelled booking ${id}:`, updatedBooking.reminder_ids)
        for (const remId of updatedBooking.reminder_ids) {
          try {
            const cancelRes = await resend.emails.cancel(remId)
            console.log(`Cancelled reminder ${remId}:`, JSON.stringify(cancelRes))
          } catch (err) {
            console.error(`Failed to cancel reminder ${remId}:`, err)
          }
        }
      } else {
        console.log(`No reminder_ids found for cancelled booking ${id}`)
      }

      const ft = formatInTimeZone(new Date(updatedBooking.start_time), TIMEZONE, "EEEE, MMMM d, yyyy 'at' h:mm a") + " ET"

      const emailHtml = `
        <div style="font-family:sans-serif;max-width:600px;color:#1c2834;">
          <h2 style="color:#1c75bc;">Appointment Cancelled</h2>
          <p>Hi ${updatedBooking.client_name},</p>
          <p>Your appointment scheduled for <strong>${ft}</strong> has been cancelled by the boutique.</p>
          <p>If you have any questions or would like to reschedule, please contact our support team.</p>
          <p>Best regards,<br/><strong>Horizon Optical Boutique</strong></p>
        </div>
      `

      const tasks = [
        resend.emails.send({
          from: "Horizon Optical <noreply@horizonoptical.ca>",
          to: "info@horizonoptical.ca",
          subject: `Cancelled Appointment: ${updatedBooking.client_name}`,
          html: `
              <h2>Appointment Cancelled</h2>
              <p>You have cancelled the booking for <strong>${updatedBooking.client_name}</strong> on ${ft}.</p>
              <p>The patient has been notified.</p>
            `,
        }),
        ...(updatedBooking.client_email.includes("@") ? [
          resend.emails.send({
            from: "Horizon Optical <noreply@horizonoptical.ca>",
            to: updatedBooking.client_email,
            subject: "Appointment Cancelled — Horizon Optical",
            html: emailHtml,
          })
        ] : []),
      ]

      await Promise.allSettled(tasks)
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return { success: false, error }
  }
}

export async function updatePaymentStatus(id: string, newPaymentStatus: string) {
  // First fetch the booking details needed for rescheduling reminders
  const fetchQuery = `
    query GetBookingForReminders($id: uuid!) {
      bookings_by_pk(id: $id) {
        id
        client_name
        client_email
        start_time
        session_type
        reminder_ids
        payment_status
      }
    }
  `

  const updateMutation = `
    mutation UpdatePaymentStatus($id: uuid!, $payment_status: String!, $reminder_ids: jsonb) {
      update_bookings_by_pk(pk_columns: {id: $id}, _set: {payment_status: $payment_status, reminder_ids: $reminder_ids}) {
        id
        payment_status
      }
    }
  `

  try {
    const bookingRes: any = await nhostGraphqlClient.request(fetchQuery, { id })
    const booking = bookingRes.bookings_by_pk

    if (!booking) {
      return { success: false, error: "Booking not found" }
    }

    // If marking as paid, cancel old reminders and schedule new "confirmed" ones
    let newReminderIds: string[] = booking.reminder_ids || []

    if (newPaymentStatus === "paid" && booking.payment_status !== "paid") {
      // 1. Cancel old scheduled reminders
      if (booking.reminder_ids && Array.isArray(booking.reminder_ids) && booking.reminder_ids.length > 0) {
        console.log(`Cancelling ${booking.reminder_ids.length} old reminders for booking ${id} (marking as paid):`, booking.reminder_ids)
        for (const remId of booking.reminder_ids) {
          try {
            const cancelRes = await resend.emails.cancel(remId)
            console.log(`Cancelled reminder ${remId}:`, JSON.stringify(cancelRes))
          } catch (err) {
            console.error(`Failed to cancel reminder ${remId}:`, err)
          }
        }
      } else {
        console.warn(`No reminder_ids to cancel for booking ${id}. DB value:`, booking.reminder_ids)
      }

      // 2. Schedule new reminders with "confirmed" messaging
      const sessionLabel = ({ workout: "Workout", therapy: "Therapy", combo: "Workout / Therapy" } as Record<string, string>)[booking.session_type] ?? booking.session_type
      const ft = formatInTimeZone(new Date(booking.start_time), TIMEZONE, "EEEE, MMMM d 'at' h:mm a") + " ET"

      const confirmedReminderHtml = `
        <div style="font-family:sans-serif;max-width:600px;color:#1c2834;">
            <h2 style="color:#1c75bc;">Appointment Reminder</h2>
            <div style="background:#dcfce7;border:1px solid #bbf7d0;padding:12px 16px;border-radius:8px;margin-bottom:16px;">
                <p style="margin:0;color:#16a34a;font-weight:600;">✅ Your appointment is confirmed</p>
            </div>
            <p>Hi ${booking.client_name},</p>
            <p>This is a reminder for your upcoming <strong>${sessionLabel}</strong> consultation.</p>
            <p><strong>When:</strong> ${ft}</p>
            <p><strong>Location:</strong> <a href="https://maps.google.com/?q=7985+Financial+Dr+Unit+2A+Brampton" target="_blank">7985 Financial Dr. Unit 2A, Brampton</a></p>
            <hr style="margin:30px 0;border:0;border-top:1px solid #e6e2d8;"/>
            <p>We look forward to seeing you!<br/><strong>Horizon Optical Boutique</strong></p>
        </div>
      `

      const reminderTasks: any[] = []
      const nowMs = Date.now()
      if (booking.client_email?.includes("@")) {
        const startMs = new Date(booking.start_time).getTime()

        const scheduleReminder = (hours: number, subject: string) => {
          const ms = startMs - hours * 60 * 60 * 1000
          if (ms > nowMs) {
            reminderTasks.push({
              from: "Horizon Optical <noreply@horizonoptical.ca>",
              to: booking.client_email,
              subject,
              html: confirmedReminderHtml,
              scheduledAt: new Date(ms).toISOString(),
            })
          }
        }

        scheduleReminder(24, "Reminder: Upcoming Appointment Tomorrow ✅")
        scheduleReminder(2, "Reminder: Appointment in 2 Hours ✅")
      }

      newReminderIds = []
      if (reminderTasks.length > 0) {
        for (const taskConf of reminderTasks) {
          try {
            const res = await resend.emails.send(taskConf)
            const emailId = res?.data?.id
            if (emailId) {
              newReminderIds.push(emailId)
              console.log(`Scheduled confirmed reminder ${emailId} for ${taskConf.to} at ${taskConf.scheduledAt}`)
            } else {
              console.error(`Resend returned no ID for confirmed reminder to ${taskConf.to}:`, JSON.stringify(res))
            }
          } catch (error) {
            console.error(`Failed to schedule confirmed reminder for ${taskConf.to}:`, error)
          }
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        console.log(`Scheduled ${newReminderIds.length}/${reminderTasks.length} confirmed reminders for booking ${id}. IDs: ${JSON.stringify(newReminderIds)}`)
      }
      
      // 3. Send immediate confirmation to the user
      try {
        const immediateHtml = `
          <div style="font-family:sans-serif;max-width:600px;color:#1c2834;">
              <h2 style="color:#1c75bc;">Payment Confirmed ✅</h2>
              <p>Hi ${booking.client_name},</p>
              <p>We have successfully verified your payment. Your <strong>${sessionLabel}</strong> consultation is now fully confirmed!</p>
              <p><strong>When:</strong> ${ft}</p>
              <p><strong>Location:</strong> <a href="https://maps.google.com/?q=7985+Financial+Dr+Unit+2A+Brampton" target="_blank">7985 Financial Dr. Unit 2A, Brampton</a></p>
              <hr style="margin:30px 0;border:0;border-top:1px solid #e6e2d8;"/>
              <p>We look forward to welcoming you!<br/><strong>Horizon Optical Boutique</strong></p>
          </div>
        `
        await resend.emails.send({
            from: "Horizon Optical <noreply@horizonoptical.ca>",
            to: booking.client_email,
            subject: "Payment Received — Consultation Confirmed ✅",
            html: immediateHtml
        })
      } catch (err) {
          console.error("Failed to send immediate payment confirmation email:", err);
      }
    }

    await nhostGraphqlClient.request(updateMutation, { id, payment_status: newPaymentStatus, reminder_ids: newReminderIds })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error updating payment status:", error)
    return { success: false, error }
  }
}

export async function createAdminBooking(data: {
  clientName: string
  clientEmail: string
  clientPhone?: string
  startTime: string
  endTime: string
  serviceType: string
  sessionType: string
}) {
  const mutation = `
    mutation CreateAdminBooking($object: bookings_insert_input!) {
      insert_bookings_one(object: $object) {
        id
      }
    }
  `

  try {
    // Past appointment validation removed – admins can set past appointments
    
    // Validation: End time after start time
    if (new Date(data.endTime) <= new Date(data.startTime)) {
      return { success: false, error: "End time must be after start time" }
    }

    // --- Schedule Reminders ---
    const reminderTasks: any[] = []
      const smsTasks: { to: string; message: string }[] = []
    const nowMs = Date.now()
    if (data.clientEmail?.includes("@")) {
      const startMs = new Date(data.startTime).getTime()
      const ft = formatInTimeZone(new Date(data.startTime), TIMEZONE, "EEEE, MMMM d, yyyy 'at' h:mm a") + " ET"
      const sessionLabel = ({ workout: "Workout", therapy: "Therapy", combo: "Workout / Therapy" })[data.sessionType] ?? data.sessionType

      const reminderHtml = `
            <div style="font-family:sans-serif;max-width:600px;color:#1c2834;">
                <h2 style="color:#1c75bc;">Appointment Reminder</h2>
                <div style="background:#dcfce7;border:1px solid #bbf7d0;padding:12px 16px;border-radius:8px;margin-bottom:16px;">
                    <p style="margin:0;color:#16a34a;font-weight:600;">✅ Your appointment is confirmed</p>
                </div>
                <p>Hi ${data.clientName},</p>
                <p>This is a reminder for your upcoming <strong>${sessionLabel}</strong> consultation.</p>
                <p><strong>When:</strong> ${ft}</p>
                <p><strong>Location:</strong> <a href="https://maps.google.com/?q=7985+Financial+Dr+Unit+2A+Brampton" target="_blank">7985 Financial Dr. Unit 2A, Brampton</a></p>
                <hr style="margin:30px 0;border:0;border-top:1px solid #e6e2d8;"/>
                <p>We look forward to welcoming you!<br/><strong>Horizon Optical Boutique</strong></p>
            </div>
        `

      const scheduleReminder = (hours: number, subject: string) => {
        const ms = startMs - hours * 60 * 60 * 1000
        if (ms > nowMs) {
          reminderTasks.push({
            from: "Horizon Optical <noreply@horizonoptical.ca>",
            to: data.clientEmail,
            subject,
            html: reminderHtml,
            scheduledAt: new Date(ms).toISOString(),
          })
          if (data.clientPhone) {
            smsTasks.push({
                to: data.clientPhone,
                message: `Hi ${data.clientName}, this is a reminder for your Horizon Optical appointment (${sessionLabel}) on ${ft}.`
            })
          }
        }
      }

      scheduleReminder(24, "Reminder: Upcoming Appointment Tomorrow ✅")
      scheduleReminder(2, "Reminder: Appointment in 2 Hours ✅")
    }

    const scheduledReminderIds: string[] = []

    if (reminderTasks.length > 0) {
      for (const taskConf of reminderTasks) {
        try {
          const res = await resend.emails.send(taskConf)
          const emailId = res?.data?.id
          if (emailId) {
            scheduledReminderIds.push(emailId)
            console.log(`[createAdminBooking] Scheduled reminder ${emailId} for ${taskConf.to} at ${taskConf.scheduledAt}`)
          } else {
            console.error(`[createAdminBooking] Resend returned no ID for reminder to ${taskConf.to}:`, JSON.stringify(res))
          }
        } catch (error) {
          console.error(`[createAdminBooking] Failed to schedule reminder for ${taskConf.to}:`, error)
        }
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      console.log(`[createAdminBooking] Scheduled ${scheduledReminderIds.length}/${reminderTasks.length} reminders. IDs: ${JSON.stringify(scheduledReminderIds)}`)
    }

    const finalObject = {
      client_name: data.clientName,
      client_email: data.clientEmail,
      client_phone: data.clientPhone ?? null,
      start_time: data.startTime,
      end_time: data.endTime,
      service_type: data.serviceType,
      session_type: data.sessionType,
      status: "confirmed",
      payment_status: "paid",
      reminder_ids: scheduledReminderIds
    }

    await nhostGraphqlClient.request(mutation, { object: finalObject })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Error creating admin booking:", error)
    return { success: false, error: error?.message || "Failed to create booking" }
  }
}

export async function deleteBooking(id: string) {
  const mutation = `
    mutation DeleteBooking($id: uuid!) {
      delete_bookings_by_pk(id: $id) {
        id
      }
    }
  `

  try {
    await nhostGraphqlClient.request(mutation, { id })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting booking:", error)
    return { success: false, error }
  }
}

export async function updateBookingDetails(id: string, data: {
  clientName: string
  clientEmail: string
  clientPhone?: string
  startTime: string
  endTime: string
  serviceType: string
  sessionType: string
}) {
  const mutation = `
    mutation UpdateBookingDetails($id: uuid!, $client_name: String!, $client_email: String!, $client_phone: String, $start_time: timestamptz!, $end_time: timestamptz!, $service_type: String!, $session_type: String!, $reminder_ids: jsonb) {
      update_bookings_by_pk(
        pk_columns: {id: $id}, 
        _set: {
          client_name: $client_name, 
          client_email: $client_email, 
          client_phone: $client_phone,
          start_time: $start_time, 
          end_time: $end_time, 
          service_type: $service_type, 
          session_type: $session_type,
          reminder_ids: $reminder_ids
        }
      ) {
        id
      }
    }
  `

  try {
    // Past appointment validation removed – admins can set past appointments

    // Validation: End time after start time
    if (new Date(data.endTime) <= new Date(data.startTime)) {
      return { success: false, error: "End time must be after start time" }
    }

    // 1. Fetch current booking to get old reminder_ids
    const getQuery = `
      query GetOldReminders($id: uuid!) {
        bookings_by_pk(id: $id) {
          reminder_ids
          payment_status
        }
      }
    `
    const oldRes: any = await nhostGraphqlClient.request(getQuery, { id })
    const oldReminderIds = oldRes.bookings_by_pk?.reminder_ids
    const paymentStatus = oldRes.bookings_by_pk?.payment_status
    const isPaid = paymentStatus === "paid"

    // 2. Cancel old reminders
    if (oldReminderIds && Array.isArray(oldReminderIds) && oldReminderIds.length > 0) {
      console.log(`[updateBookingDetails] Cancelling ${oldReminderIds.length} old reminders:`, oldReminderIds)
      for (const remId of oldReminderIds) {
        try {
          const cancelRes = await resend.emails.cancel(remId)
          console.log(`[updateBookingDetails] Cancelled reminder ${remId}:`, JSON.stringify(cancelRes))
        } catch (err) {
          console.error(`[updateBookingDetails] Failed to cancel old reminder ${remId}:`, err)
        }
      }
    } else {
      console.log(`[updateBookingDetails] No old reminder_ids to cancel for booking ${id}`)
    }

    // --- Send Email Notifications for Update ---
    const sessionLabel = ({ workout: "Workout", therapy: "Therapy", combo: "Workout / Therapy" })[data.sessionType] ?? data.sessionType
    const ft = formatInTimeZone(new Date(data.startTime), TIMEZONE, "EEEE, MMMM d, yyyy 'at' h:mm a") + " ET"

    // Generate new ICS for the updated time
    const toICSDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const now = toICSDate(new Date().toISOString())
    const uid = `booking-${Date.now()}-${Math.random().toString(36).slice(2)}@yasirgangat`

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Horizon Optical//Booking//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${toICSDate(data.startTime)}`,
      `DTEND:${toICSDate(data.endTime)}`,
      `SUMMARY:UPDATED: ${sessionLabel} Consultation — ${data.clientName}`,
      `DESCRIPTION:This appointment time has been updated by the admin.`,
      "STATUS:CONFIRMED",
      "SEQUENCE:1",
      "BEGIN:VALARM",
      "TRIGGER:-PT24H",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder: Appointment tomorrow",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")

    const icsAttachment = {
      filename: "updated-appointment.ics",
      content: Buffer.from(icsContent, "utf-8"),
      contentType: "text/calendar",
    }

    const emailHtml = `
      <div style="font-family:sans-serif;max-width:600px;color:#1c2834;">
        <h2 style="color:#1c75bc;">Appointment Modification Notice</h2>
        <p>Hi ${data.clientName},</p>
        <p>Your appointment details have been updated by the clinic administrator. Please review the new details below:</p>
        <div style="background:#fdfbf7;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #e6e2d8;">
          <p><strong>Consultation:</strong> <span>${sessionLabel}</span></p>
          <p><strong>New Time:</strong> ${ft}</p>
          <p><strong>Location:</strong> <a href="https://maps.google.com/?q=7985+Financial+Dr+Unit+2A+Brampton" target="_blank">7985 Financial Dr. Unit 2A, Brampton</a></p>
        </div>
        <p><strong>📎 Updated Calendar Invite Attached</strong><br/>
        Please open the attached <em>.ics</em> file to register the new time in your calendar. You may need to manually remove the old event from your calendar if it duplicated.</p>
        <p>If you have any questions or this change does not work for you, please let us know.</p>
        <p>Warm regards,<br/><strong>Horizon Optical Boutique Team</strong></p>
      </div>
    `

    const tasks = [
      resend.emails.send({
        from: "Horizon Optical <noreply@horizonoptical.ca>",
        to: "info@horizonoptical.ca",
        subject: `Updated Appointment: ${data.clientName}`,
        html: `
              <h2>Appointment Updated by Admin</h2>
              <p>You have updated the booking for <strong>${data.clientName}</strong>.</p>
              <p><strong>New Time:</strong> ${ft}</p>
              <p><strong>Service:</strong> <span>${data.serviceType} (${sessionLabel})</span></p>
              <p>The patient has been notified.</p>
            `,
        attachments: [icsAttachment],
      }),
      ...(data.clientEmail?.includes("@") ? [
        resend.emails.send({
          from: "Horizon Optical <noreply@horizonoptical.ca>",
          to: data.clientEmail,
          subject: "Appointment Time Updated — Horizon Optical",
          html: emailHtml,
          attachments: [icsAttachment],
        })
      ] : []),
    ]

    const results = await Promise.allSettled(tasks)
    const failures = results.filter(r => r.status === "rejected")
    if (failures.length > 0) {
      console.error("Failed to send update emails:", failures)
    } else {
      console.log("Update emails sent successfully.")
    }

    // ── Resend API Rate Limit Prevention (2 req / sec) ─────────────────────────
    await new Promise(resolve => setTimeout(resolve, 1000))

    // --- Schedule New Reminders ---
    const reminderTasks: any[] = []
    const nowMs = Date.now()
    if (data.clientEmail?.includes("@")) {
      const startMs = new Date(data.startTime).getTime()
      const reminderHtml = `
            <div style="font-family:sans-serif;max-width:600px;color:#1c2834;">
                <h2 style="color:#1c75bc;">Appointment Reminder</h2>
                ${isPaid
                  ? `<div style="background:#dcfce7;border:1px solid #bbf7d0;padding:12px 16px;border-radius:8px;margin-bottom:16px;">
                      <p style="margin:0;color:#16a34a;font-weight:600;">✅ Your appointment is confirmed</p>
                     </div>`
                  : `<div style="background:#fef9c3;border:1px solid #fde68a;padding:12px 16px;border-radius:8px;margin-bottom:16px;">
                      <p style="margin:0;color:#b45309;font-weight:600;">⚠️ Payment pending</p>
                      <p style="margin:4px 0 0;color:#92400e;font-size:0.9em;">Please make payment at the clinic or contact us to confirm your insurance billing.</p>
                     </div>`
                }
                <p>Hi ${data.clientName},</p>
                <p>This is a reminder for your upcoming <strong>${sessionLabel}</strong> consultation.</p>
                <p><strong>When:</strong> ${ft}</p>
                <p><strong>Location:</strong> <a href="https://maps.google.com/?q=7985+Financial+Dr+Unit+2A+Brampton" target="_blank">7985 Financial Dr. Unit 2A, Brampton</a></p>
                <hr style="margin:30px 0;border:0;border-top:1px solid #e6e2d8;"/>
                <p>We look forward to seeing you!<br/><strong>Horizon Optical Team</strong></p>
            </div>
        `

      const scheduleReminder = (hours: number, subject: string) => {
        const ms = startMs - hours * 60 * 60 * 1000
        if (ms > nowMs) {
          reminderTasks.push({
            from: "Horizon Optical <noreply@horizonoptical.ca>",
            to: data.clientEmail,
            subject,
            html: reminderHtml,
            scheduledAt: new Date(ms).toISOString(),
          })
        }
      }

      scheduleReminder(24, isPaid ? "Reminder: Upcoming Session Tomorrow ✅" : "Reminder: Upcoming Session Tomorrow")
      scheduleReminder(2, isPaid ? "Reminder: Session in 2 Hours ✅" : "Reminder: Session in 2 Hours")
    }

    const scheduledReminderIds: string[] = []

    if (reminderTasks.length > 0) {
      for (const taskConf of reminderTasks) {
        try {
          const res = await resend.emails.send(taskConf)
          const emailId = res?.data?.id
          if (emailId) {
            scheduledReminderIds.push(emailId)
            console.log(`[updateBookingDetails] Scheduled reminder ${emailId} for ${taskConf.to} at ${taskConf.scheduledAt}`)
          } else {
            console.error(`[updateBookingDetails] Resend returned no ID for reminder to ${taskConf.to}:`, JSON.stringify(res))
          }
        } catch (error) {
          console.error(`[updateBookingDetails] Failed to schedule reminder for ${taskConf.to}:`, error)
        }
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      console.log(`[updateBookingDetails] Scheduled ${scheduledReminderIds.length}/${reminderTasks.length} reminders. IDs: ${JSON.stringify(scheduledReminderIds)}`)
    }

    // 3. Update the booking with new details AND new reminder_ids
    await nhostGraphqlClient.request(mutation, {
      id,
      client_name: data.clientName,
      client_email: data.clientEmail,
      start_time: data.startTime,
      end_time: data.endTime,
      service_type: data.serviceType,
      session_type: data.sessionType,
      reminder_ids: scheduledReminderIds
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error updating booking details:", error)
    return { success: false, error }
  }
}
