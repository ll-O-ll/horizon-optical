"use server"

import { nhostGraphqlClient } from "@/lib/nhost"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_1234567890abcdef")

export interface ClientResource {
  id: string
  client_email: string
  title: string
  description: string | null
  type: "recording" | "pointer" | "note"
  url: string | null
  content: string | null
  category: string | null
  order_index: number
  is_pinned: boolean
  created_at: string
  updated_at: string
}

// Get all unique client emails (from bookings)
export async function getClientEmails(): Promise<{ success: boolean; emails: string[] }> {
  const query = `
    query GetUniqueClientEmails {
      bookings(distinct_on: client_email, order_by: {client_email: asc}) {
        client_email
        client_name
      }
    }
  `

  try {
    const data: any = await nhostGraphqlClient.request(query)
    const emails = data.bookings.map((b: any) => b.client_email).filter((e: string) => e?.includes("@"))
    return { success: true, emails }
  } catch (error) {
    console.error("Error fetching client emails:", error)
    return { success: false, emails: [] }
  }
}

// Get all unique client emails with names
export async function getClientList(): Promise<{ success: boolean; clients: { email: string; name: string }[] }> {
  const query = `
    query GetClientList {
      bookings(distinct_on: client_email, order_by: {client_email: asc}) {
        client_email
        client_name
      }
    }
  `

  try {
    const data: any = await nhostGraphqlClient.request(query)
    const clients = data.bookings
      .filter((b: any) => b.client_email?.includes("@"))
      .map((b: any) => ({ email: b.client_email, name: b.client_name }))
    return { success: true, clients }
  } catch (error) {
    console.error("Error fetching client list:", error)
    return { success: false, clients: [] }
  }
}

// Get resources for a specific client
export async function getResourcesForClient(email: string): Promise<{ success: boolean; resources: ClientResource[] }> {
  const query = `
    query GetClientResources($email: String!) {
      client_resources(
        where: { client_email: { _eq: $email } },
        order_by: [{ is_pinned: desc }, { order_index: asc }, { created_at: desc }]
      ) {
        id
        client_email
        title
        description
        type
        url
        content
        category
        order_index
        is_pinned
        created_at
        updated_at
      }
    }
  `

  try {
    const data: any = await nhostGraphqlClient.request(query, { email })
    return { success: true, resources: data.client_resources }
  } catch (error) {
    console.error("Error fetching client resources:", error)
    return { success: false, resources: [] }
  }
}

// Create a new resource
export async function createResource(data: {
  clientEmail: string
  title: string
  description?: string
  type: "recording" | "pointer" | "note"
  url?: string
  content?: string
  category?: string
  isPinned?: boolean
}): Promise<{ success: boolean; id?: string; error?: any }> {
  // Get the current max order_index for this client
  const orderQuery = `
    query GetMaxOrder($email: String!) {
      client_resources_aggregate(where: { client_email: { _eq: $email } }) {
        aggregate {
          max {
            order_index
          }
        }
      }
    }
  `

  const mutation = `
    mutation CreateResource($object: client_resources_insert_input!) {
      insert_client_resources_one(object: $object) {
        id
      }
    }
  `

  try {
    const orderData: any = await nhostGraphqlClient.request(orderQuery, { email: data.clientEmail })
    const maxOrder = orderData.client_resources_aggregate?.aggregate?.max?.order_index ?? -1

    const object = {
      client_email: data.clientEmail,
      title: data.title,
      description: data.description || null,
      type: data.type,
      url: data.url || null,
      content: data.content || null,
      category: data.category || null,
      order_index: maxOrder + 1,
      is_pinned: data.isPinned || false,
    }

    const result: any = await nhostGraphqlClient.request(mutation, { object })
    return { success: true, id: result.insert_client_resources_one.id }
  } catch (error) {
    console.error("Error creating resource:", error)
    return { success: false, error }
  }
}

// Send a notification email to a client when new resources are ready
export async function sendResourceNotification(
  clientEmail: string,
  resources: { title: string; type: "recording" | "pointer" | "note"; url?: string | null; content?: string | null }[]
): Promise<{ success: boolean; error?: string }> {
  // Fetch the client's name from bookings
  const nameQuery = `
    query GetClientName($email: String!) {
      bookings(where: { client_email: { _eq: $email } }, limit: 1, order_by: { created_at: desc }) {
        client_name
      }
    }
  `

  let clientName = "there"
  try {
    const nameData: any = await nhostGraphqlClient.request(nameQuery, { email: clientEmail })
    clientName = nameData.bookings?.[0]?.client_name?.split(" ")?.[0] || "there"
  } catch {
    // Proceed with generic greeting if name lookup fails
  }

  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://horizonoptical.ca"}/portal`

  const resourcesHtml = resources.map(resource => {
    const typeLabel = resource.type === "recording" ? "Video Consultation" : resource.type === "pointer" ? "Bespoke Care Tip" : "Vision Prescription"
    const typeEmoji = resource.type === "recording" ? "🎥" : resource.type === "pointer" ? "💡" : "👓"
    
    let detailsHtml = ""
    if (resource.type === "recording" && resource.url) {
      detailsHtml = `<a href="${resource.url}" style="display: inline-block; margin-top: 8px; color: #1c75bc; text-decoration: underline; font-size: 14px;">Watch Video &rarr;</a>`
    } else if ((resource.type === "pointer" || resource.type === "note") && resource.content) {
      detailsHtml = `<p style="margin: 8px 0 0; font-size: 14px; color: #4b5563; line-height: 1.5;">${resource.content}</p>`
    }

    return `
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin-bottom: 12px; font-family:sans-serif;">
        <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af;">${typeEmoji} ${typeLabel}</p>
        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${resource.title}</p>
        ${detailsHtml}
      </div>
    `
  }).join("")

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1c2834;">
      <div style="background: #fdfbf7; padding: 32px 40px; border-radius: 12px 12px 0 0; border: 1px solid #e6e2d8; border-bottom: none;">
        <p style="color: #1c75bc; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Horizon Optical Boutique</p>
        <h1 style="color: #1c2834; margin: 0; font-size: 24px; font-weight: 700; font-family: serif;">New Vision Resources Available</h1>
      </div>
      <div style="background: #fdfbf7; padding: 32px 40px; border-radius: 0 0 12px 12px; border: 1px solid #e6e2d8; border-top: none;">
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hi ${clientName},</p>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #5a6b7d;">
          Our boutique team has just updated your patient portal with new vision details:
        </p>
        <div style="margin-bottom: 28px;">
          ${resourcesHtml}
        </div>
        <a href="${portalUrl}" style="display: inline-block; background: #1c75bc; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 30px; font-size: 15px; font-weight: 600; margin-bottom: 28px;">View Patient Portal →</a>
        <hr style="border: none; border-top: 1px solid #e6e2d8; margin: 24px 0;" />
        <p style="font-size: 13px; color: #9ca3af; margin: 0;">You're receiving this because you're a patient of Horizon Optical. Log in anytime at <a href="${portalUrl}" style="color: #1c75bc;">${portalUrl}</a>.</p>
      </div>
    </div>
  `

  const subject = resources.length === 1
    ? `Horizon Optical update: ${resources[0].title}`
    : `New patient portal files ready (${resources.length} items)`

  try {
    await resend.emails.send({
      from: "Horizon Optical <noreply@horizonoptical.ca>",
      to: clientEmail,
      subject,
      html: emailHtml,
    })
    return { success: true }
  } catch (error: any) {
    console.error("[sendResourceNotification] Resend error:", error)
    return { success: false, error: error?.message || "Unknown error" }
  }
}

// Update a resource
export async function updateResource(id: string, data: {
  title?: string
  description?: string
  type?: "recording" | "pointer" | "note"
  url?: string
  content?: string
  category?: string
  isPinned?: boolean
}): Promise<{ success: boolean; error?: any }> {
  const mutation = `
    mutation UpdateResource($id: uuid!, $set: client_resources_set_input!) {
      update_client_resources_by_pk(pk_columns: { id: $id }, _set: $set) {
        id
      }
    }
  `

  try {
    const set: any = { updated_at: new Date().toISOString() }
    if (data.title !== undefined) set.title = data.title
    if (data.description !== undefined) set.description = data.description || null
    if (data.type !== undefined) set.type = data.type
    if (data.url !== undefined) set.url = data.url || null
    if (data.content !== undefined) set.content = data.content || null
    if (data.category !== undefined) set.category = data.category || null
    if (data.isPinned !== undefined) set.is_pinned = data.isPinned

    await nhostGraphqlClient.request(mutation, { id, set })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error updating resource:", error)
    return { success: false, error }
  }
}

// Delete a resource
export async function deleteResource(id: string): Promise<{ success: boolean; error?: any }> {
  const mutation = `
    mutation DeleteResource($id: uuid!) {
      delete_client_resources_by_pk(id: $id) {
        id
      }
    }
  `

  try {
    await nhostGraphqlClient.request(mutation, { id })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting resource:", error)
    return { success: false, error }
  }
}

// Reorder resources
export async function reorderResources(updates: { id: string; order_index: number }[]): Promise<{ success: boolean; error?: any }> {
  // Use individual updates since Hasura doesn't support bulk update easily
  const mutation = `
    mutation UpdateOrder($id: uuid!, $order_index: Int!) {
      update_client_resources_by_pk(pk_columns: { id: $id }, _set: { order_index: $order_index }) {
        id
      }
    }
  `

  try {
    for (const update of updates) {
      await nhostGraphqlClient.request(mutation, update)
    }
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error reordering resources:", error)
    return { success: false, error }
  }
}

// Toggle pin status
export async function toggleResourcePin(id: string, isPinned: boolean): Promise<{ success: boolean; error?: any }> {
  return updateResource(id, { isPinned })
}
