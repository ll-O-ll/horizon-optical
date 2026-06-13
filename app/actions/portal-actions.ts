"use server"

import { nhostGraphqlClient } from "@/lib/nhost"
import { cookies } from "next/headers"
import { Resend } from "resend"
import bcrypt from "bcryptjs"

const resend = new Resend(process.env.RESEND_API_KEY)

// Attempt portal login with email and a static password
export async function loginToPortal(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify password against portal_users
    const userQuery = `
      query GetPortalUser($email: String!) {
        portal_users_by_pk(email: $email) {
          password_hash
        }
      }
    `
    const userData: any = await nhostGraphqlClient.request(userQuery, { email })
    
    if (!userData.portal_users_by_pk) {
      return { success: false, error: "Please sign up for an account first." }
    }

    const isValid = await bcrypt.compare(password, userData.portal_users_by_pk.password_hash)
    if (!isValid) {
      return { success: false, error: "Invalid password." }
    }

    // Set portal session cookie (7 days)
    const cookieStore = await cookies()
    cookieStore.set("portal_session", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Error logging in to portal:", error)
    return { success: false, error: "Login failed. Please try again." }
  }
}


// Get the current portal session (from cookie)
export async function getPortalSession(): Promise<{ authenticated: boolean; email?: string; clientName?: string }> {
  const cookieStore = await cookies()
  const session = cookieStore.get("portal_session")

  if (!session?.value) {
    return { authenticated: false }
  }

  const email = session.value

  // Get client name
  const query = `
    query GetClientName($email: String!) {
      bookings(where: { client_email: { _eq: $email } }, limit: 1, order_by: { created_at: desc }) {
        client_name
      }
      program_trials(where: { client_email: { _eq: $email } }, limit: 1, order_by: { created_at: desc }) {
        client_name
      }
    }
  `

  try {
    const data: any = await nhostGraphqlClient.request(query, { email })
    const clientName = data.bookings?.[0]?.client_name || data.program_trials?.[0]?.client_name || "Client"
    return { authenticated: true, email, clientName }
  } catch {
    return { authenticated: true, email, clientName: "Client" }
  }
}

// Logout from portal
export async function logoutPortal(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("portal_session")
}

// Sign up for portal
export async function signUpPortal(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already exists
    const userQuery = `
      query GetPortalUser($email: String!) {
        portal_users_by_pk(email: $email) {
          email
        }
      }
    `
    const userData: any = await nhostGraphqlClient.request(userQuery, { email })
    if (userData.portal_users_by_pk) {
      return { success: false, error: "An account already exists for this email. Please log in." }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Create user
    const insertQuery = `
      mutation CreatePortalUser($email: String!, $password_hash: String!) {
        insert_portal_users_one(object: { email: $email, password_hash: $password_hash }) {
          email
        }
      }
    `
    await nhostGraphqlClient.request(insertQuery, { email, password_hash })

    // Set portal session cookie (7 days)
    const cookieStore = await cookies()
    cookieStore.set("portal_session", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Error signing up for portal:", error)
    return { success: false, error: "Sign up failed. Please try again." }
  }
}
