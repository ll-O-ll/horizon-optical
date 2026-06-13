"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/app/actions/auth-actions"
import { Lock, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="relative h-9 w-24 sm:h-10 sm:w-28">
                <Image
                  src="/images/horizon-optical-inside-logo-clean.png"
                  alt="Horizon Optical Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to site
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Staff Portal</h1>
            <p className="mt-2 text-muted-foreground font-light">
              Dashboard access for Horizon Optical staff.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border shadow-xl shadow-black/10">
              <form onSubmit={handleSubmit}>
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Dashboard Login</CardTitle>
                  </div>
                  <CardDescription>
                    Enter your admin password to access the panel.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Administrator Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                      autoFocus
                      className={error ? "border-destructive" : ""}
                    />
                    {error && (
                      <p className="text-sm text-destructive mt-1">{error}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full gap-2 mt-4" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
                    ) : (
                      <>Access Dashboard <ArrowRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
