"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {

    const password = formData.get("password") as string

    // Clean up environment variable in case it has quotes or trailing spaces from Vercel
    const adminPassword = process.env.ADMIN_PASSWORD?.replace(/^["']|["']$/g, '').trim()
    const inputPassword = password?.trim()

    if (!inputPassword || inputPassword !== adminPassword) {
        return { error: "Invalid password" }
    }

    // Set the cookie (1 week expiration)
    const cookieStore = await cookies()
    cookieStore.set("admin_auth", inputPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    })

    redirect("/dashboard")
}
