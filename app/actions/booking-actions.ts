"use server"

import { Resend } from "resend"
import { format } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { BookingEvent, insertBookings } from "@/lib/nhost"
import { generateReceipt } from "@/lib/generate-receipt"

const TIMEZONE = "America/New_York"
const resend = new Resend(process.env.RESEND_API_KEY || "re_1234567890abcdef")

export interface SlotData {
    startTime: string
    endTime: string
}

export interface BookingData {
    firstName: string
    lastName: string
    email: string
    phone: string
    notes: string
    receiptType: string
    sessionType: string
    serviceType: string
    sessionLocation: string
    requiresTravel: boolean
    address: string
    paymentMethod: string
    slots: SlotData[]
}

/**
 * Generate a single ICS file with one VEVENT per session.
 * All major calendar apps (Google, Outlook, Apple) support multi-event ICS.
 */
function generateMultiEventICS(events: {
    summary: string
    description: string
    location: string
    startTime: string
    endTime: string
}[]): string {
    const toICSDate = (iso: string) =>
        new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const esc = (s: string) => s.replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;")
    const now = toICSDate(new Date().toISOString())

    const vevents = events.map((ev, i) => {
        const uid = `booking-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}@yasirgangat`
        return [
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${now}`,
            `DTSTART:${toICSDate(ev.startTime)}`,
            `DTEND:${toICSDate(ev.endTime)}`,
            `SUMMARY:${esc(ev.summary)}`,
            `DESCRIPTION:${esc(ev.description)}`,
            `LOCATION:${esc(ev.location)}`,
            "STATUS:CONFIRMED",
            "SEQUENCE:0",
            "BEGIN:VALARM",
            "TRIGGER:-PT24H",
            "ACTION:DISPLAY",
            "DESCRIPTION:Reminder: Session tomorrow",
            "END:VALARM",
            "BEGIN:VALARM",
            "TRIGGER:-PT1H",
            "ACTION:DISPLAY",
            "DESCRIPTION:Reminder: Session in 1 hour",
            "END:VALARM",
            "END:VEVENT",
        ].join("\r\n")
    })

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Yasir Gangat Coaching//Booking//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        ...vevents,
        "END:VCALENDAR",
    ].join("\r\n")
}

export async function handleBookingSubmit(data: BookingData) {
    const {
        firstName,
        lastName,
        email,
        phone,
        notes,
        receiptType,
        sessionType,
        serviceType,
        sessionLocation,
        requiresTravel,
        address,
        paymentMethod,
        slots,
    } = data

    const isPaidByCard = paymentMethod === "credit_card"
    const isPayAtClinic = paymentMethod === "pay_at_clinic"

    const fullName = `${firstName} ${lastName}`.trim() || "Client"
    
    // Map optical service labels
    const labelsMap: Record<string, string> = {
        exam: "Comprehensive Eye Exam",
        styling: "Bespoke Frame Styling",
        lens: "Contact Lens Fitting",
        adjustment: "Glasses Adjustment"
    }
    
    const sessionLabel = labelsMap[sessionType] ?? sessionType
    const serviceLabel = labelsMap[serviceType] ?? serviceType
    const totalSessions = slots.length

    const locationLabelText = "Horizon Optical Boutique — 7985 Financial Dr. Unit 2A, Brampton"
    const locationLabelHtml = `Horizon Optical Boutique — <a href="https://maps.google.com/?q=7985+Financial+Dr+Unit+2A+Brampton" target="_blank">7985 Financial Dr. Unit 2A, Brampton</a>`

    // ── Build one ICS with all sessions ───────────────────────────────────────
    const icsContent = generateMultiEventICS(
        slots.map((slot, i) => ({
            summary: `${sessionLabel} — ${fullName}`,
            description: [
                `Service: ${serviceLabel}`,
                `Location: ${locationLabelText}`,
                `Phone: ${phone}`,
                notes ? `Comments: ${notes}` : "",
            ].filter(Boolean).join("\n"),
            location: locationLabelText,
            startTime: slot.startTime,
            endTime: slot.endTime,
        }))
    )

    const icsAttachment = {
        filename: "horizon-optical-booking.ics",
        content: Buffer.from(icsContent, "utf-8"),
        contentType: "text/calendar",
    }

    // ── Session list rows (shared between admin + client emails) ──────────────
    const sessionRows = slots.map((slot, i) => {
        const ft = formatInTimeZone(new Date(slot.startTime), TIMEZONE, "EEEE, MMMM d 'at' h:mm a") + " ET"
        return `<tr>
            <td style="padding:6px 12px;font-weight:600;color:#1c75bc;white-space:nowrap;">Appointment</td>
            <td style="padding:6px 12px;">${ft}</td>
        </tr>`
    }).join("")

    const sessionTable = `
        <table style="border-collapse:collapse;width:100%;margin:12px 0;background:#fdfbf7;border-radius:8px;overflow:hidden;border:1px solid #e6e2d8;">
            <thead><tr style="background:#f4f1ea;">
                <th style="padding:8px 12px;text-align:left;font-size:0.8em;color:#1c75bc;text-transform:uppercase;letter-spacing:.05em;">Type</th>
                <th style="padding:8px 12px;text-align:left;font-size:0.8em;color:#1c75bc;text-transform:uppercase;letter-spacing:.05em;">Date & Time (ET)</th>
            </tr></thead>
            <tbody>${sessionRows}</tbody>
        </table>`

    // ── Admin email ────────────────────────────────────────────────────────────
    let paymentStatusLabel = "Free Consultation"
    if (isPaidByCard) paymentStatusLabel = "✅ Pre-paid Online via Credit Card"
    if (isPayAtClinic) paymentStatusLabel = "⏳ Will Pay at Clinic / Direct Billing"

    const adminHtml = `
        <h2 style="margin-bottom:4px;color:#1c75bc;font-family:sans-serif;">New Appointment Request</h2>
        <p style="color:#6b7280;margin-top:0;font-family:sans-serif;">Horizon Optical Scheduling System</p>
        <div style="font-family:sans-serif;background:#fdfbf7;padding:16px;border-radius:8px;border:1px solid #e6e2d8;">
            <p><strong>Appointment Type:</strong> ${serviceLabel}</p>
            <p><strong>Patient Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Billing Status:</strong> ${paymentStatusLabel}</p>
            <hr style="border:0;border-top:1px solid #e6e2d8;margin:16px 0;"/>
            <h3>Scheduled Time</h3>
            ${sessionTable}
            <p><strong>Location:</strong> ${locationLabelHtml}</p>
            <p><strong>Vision Comments:</strong><br/>${notes || "None"}</p>
        </div>
    `

    // ── Client email ───────────────────────────────────────────────────────────
    const clientHeading = "Appointment Confirmed! ✅"
    
    let paymentSection = ""
    if (isPaidByCard) {
        paymentSection = `<div style="border-left:4px solid #1c75bc;padding-left:10px;margin-top:20px;font-family:sans-serif;">
            <p style="color:#1c75bc;font-weight:bold;margin:0 0 4px;">✅ Online Payment Confirmed</p>
            <p style="margin:0;color:#5a6b7d;">Your credit card payment has been successfully processed online.</p>
        </div>`
    } else if (isPayAtClinic) {
        paymentSection = `<div style="border-left:4px solid #233c50;padding-left:10px;margin-top:20px;font-family:sans-serif;">
            <p style="color:#233c50;font-weight:bold;margin:0 0 4px;">⏳ Pay at Boutique / Direct Billing</p>
            <p style="margin:0;color:#5a6b7d;">You can pay in-store on the day of your appointment (Debit/Visa/Mastercard) or request direct billing through your private insurance provider.</p>
        </div>`
    }

    const clientHtml = `
        <div style="font-family:sans-serif;max-width:600px;color:#1c2834;">
            <h2 style="color:#1c75bc;margin-bottom:4px;">${clientHeading}</h2>
            <p style="color:#5a6b7d;margin-top:0;">Thank you for choosing Horizon Optical.</p>
            
            <p>Hi ${firstName || "there"},</p>
            <p>We are looking forward to welcoming you to our boutique. Here are your scheduled appointment details:</p>
            ${sessionTable}
            
            <p><strong>📍 Location:</strong> ${locationLabelHtml}</p>
            
            <p><strong>📎 Calendar Invite Attached</strong><br/>
            Open the attached <em>.ics</em> file to automatically save this appointment to your Google Calendar, Outlook, or Apple Calendar.</p>

            ${paymentSection}
            
            <div style="background:#f4f1ea;padding:12px 16px;border-radius:8px;margin-top:24px;border:1px solid #e6e2d8;font-size:0.9em;color:#5a6b7d;">
                <p style="margin:0;font-weight:bold;color:#1c2834;">📅 Preparing for Your Visit:</p>
                <ul style="margin:6px 0 0;padding-left:20px;">
                    <li>Please bring your current eyeglasses or contact lens cases if you have them.</li>
                    <li>If you requested direct billing, bring your insurance member ID card.</li>
                    <li>Arrive 5 minutes before your scheduled slot.</li>
                </ul>
            </div>

            <hr style="margin:30px 0;border:0;border-top:1px solid #e6e2d8;"/>
            <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance at <a href="tel:9054500044">905-450-0044</a> (Landline) or <a href="tel:9056016342">905-601-6342</a> (Mobile).</p>
            <p>Warm regards,<br/><strong>Horizon Optical Boutique Team</strong></p>
        </div>
    `

    // ── Send core confirmation emails ───────────────────────────────────────────
    const clientSubject = `Appointment Confirmed ✅ — ${sessionLabel}`
    const attachments = [icsAttachment]

    const coreTasks = [
        resend.emails.send({
            from: "Horizon Optical <noreply@horizonoptical.ca>",
            to: "info@horizonoptical.ca",
            subject: `🔔 New Appointment: ${fullName} — ${sessionLabel}`,
            html: adminHtml,
            attachments: attachments,
        }),
        ...(email?.includes("@") ? [
            resend.emails.send({
                from: "Horizon Optical <noreply@horizonoptical.ca>",
                to: email,
                subject: clientSubject,
                html: clientHtml,
                attachments: attachments,
            })
        ] : []),
    ]

    const coreResults = await Promise.allSettled(coreTasks)

    const failures = coreResults.filter(r => r.status === "rejected")
    if (failures.length > 0) {
        console.error(`${failures.length}/${coreResults.length} emails failed:`, failures)
        return { success: false, errors: failures.map(f => (f as PromiseRejectedResult).reason?.message ?? "Unknown") }
    }

    console.log(`Core booking emails sent: ${coreResults.length} total`)

    // ── Resend API Rate Limit Prevention (2 req / sec) ─────────────────────────
    await new Promise(resolve => setTimeout(resolve, 1000))

    // ── Schedule Reminders ─────────────────────────────────────────────────────
    const reminderTasks: { slotIndex: number; conf: any }[] = []
    const nowMs = Date.now()
    if (email?.includes("@")) {
        slots.forEach((slot, i) => {
            const startMs = new Date(slot.startTime).getTime()
            const ft = formatInTimeZone(new Date(slot.startTime), TIMEZONE, "EEEE, MMMM d 'at' h:mm a") + " ET"

            const reminderHtml = `
                <div style="font-family:sans-serif;max-width:600px;color:#1c2834;">
                    <h2 style="color:#1c75bc;">Appointment Reminder</h2>
                    <p>Hi ${firstName || "there"},</p>
                    <p>This is a friendly reminder that you have an upcoming <strong>${sessionLabel}</strong> consultation scheduled at our boutique.</p>
                    <p><strong>When:</strong> ${ft}</p>
                    <p><strong>Location:</strong> ${locationLabelHtml}</p>
                    
                    <div style="background:#f4f1ea;padding:12px 16px;border-radius:8px;margin-top:20px;border:1px solid #e6e2d8;font-size:0.9em;color:#5a6b7d;">
                        <p style="margin:0;font-weight:bold;color:#1c2834;">📍 Address Reminder:</p>
                        <p style="margin:4px 0 0;">Horizon Optical Boutique, 7985 Financial Dr. Unit 2A, Brampton. Tel: 905-450-0044.</p>
                    </div>
                    
                    <hr style="margin:30px 0;border:0;border-top:1px solid #e6e2d8;"/>
                    <p>We look forward to seeing you!<br/><strong>Horizon Optical Team</strong></p>
                </div>
            `

            // 24 hours before
            const ms24h = startMs - 24 * 60 * 60 * 1000
            if (ms24h > nowMs) {
                reminderTasks.push({
                    slotIndex: i,
                    conf: {
                        from: "Horizon Optical <noreply@horizonoptical.ca>",
                        to: email,
                        subject: `Reminder: Upcoming Appointment Tomorrow`,
                        html: reminderHtml,
                        scheduledAt: new Date(ms24h).toISOString(),
                    }
                })
            }

            // 2 hours before
            const ms2h = startMs - 2 * 60 * 60 * 1000
            if (ms2h > nowMs) {
                reminderTasks.push({
                    slotIndex: i,
                    conf: {
                        from: "Horizon Optical <noreply@horizonoptical.ca>",
                        to: email,
                        subject: `Reminder: Appointment in 2 Hours`,
                        html: reminderHtml,
                        scheduledAt: new Date(ms2h).toISOString(),
                    }
                })
            }
        })
    }

    // Schedule reminders sequentially to respect 2 req / sec limit
    const slotReminderIds: string[][] = slots.map(() => [])

    for (const task of reminderTasks) {
        try {
            const res = await resend.emails.send(task.conf)
            const emailId = res?.data?.id
            if (emailId) {
                slotReminderIds[task.slotIndex].push(emailId)
                console.log(`Scheduled reminder ${emailId} for ${task.conf.to} at ${task.conf.scheduledAt}`)
            }
        } catch (error) {
            console.error(`Failed to schedule reminder for ${task.conf.to}:`, error)
        }
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`Scheduled reminders for ${slots.length} slots.`)

    // ── Save bookings to Nhost ─────────────────────────────────────────────────
    const nhostBookings: BookingEvent[] = slots.map((slot, i) => ({
        client_name: fullName,
        client_email: email,
        start_time: new Date(slot.startTime).toISOString(),
        end_time: new Date(slot.endTime).toISOString(),
        service_type: serviceType,
        session_type: sessionType,
        payment_method: paymentMethod,
        payment_status: isPaidByCard ? "paid" : "pending",
        reminder_ids: slotReminderIds[i],
    }))

    const nhostResult = await insertBookings(nhostBookings)
    if (!nhostResult.success) {
        console.error("Failed to save bookings to Nhost:", nhostResult.error)
    } else {
        console.log(`Successfully saved ${totalSessions} booking(s) to Nhost`)
    }

    return { success: true }
}
