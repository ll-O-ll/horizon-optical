"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { loginToPortal, signUpPortal } from "@/app/actions/portal-actions"
import { createTrialCheckoutSession } from "@/app/actions/stripe-trial-actions"
import { Shield, KeyRound, ArrowRight, Loader2, UserPlus, CreditCard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PortalPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true) // Default to login tab
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setIsLoading(false)
        return
      }
      const result = await loginToPortal(email.trim().toLowerCase(), password.trim())
      if (result.success) {
        router.push("/portal/content")
      } else {
        setError(result.error || "Login failed")
        setIsLoading(false)
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setIsLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        setIsLoading(false)
        return
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.")
        setIsLoading(false)
        return
      }

      const result = await signUpPortal(email.trim().toLowerCase(), password.trim())
      if (result.success) {
        router.push("/portal/content")
      } else {
        setError(result.error || "Sign up failed")
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary selection:text-primary-foreground font-sans">
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

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 text-primary">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              {isLogin ? "Patient Portal" : "Create Patient Account"}
            </h1>
            <p className="mt-2 text-muted-foreground font-light text-sm">
              {isLogin 
                ? "Access your eye exam prescriptions, frame orders, and active appointments."
                : "Register to keep track of your eye doctor history and boutique orders."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border shadow-xl shadow-accent/5">
              <form onSubmit={handleSubmit}>
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {isLogin ? <KeyRound className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
                    <CardTitle className="text-lg">{isLogin ? "Portal Login" : "Register Account"}</CardTitle>
                  </div>
                  <CardDescription className="font-light text-xs">
                    {isLogin ? "Enter your credentials below to log in." : "Sign up in 30 seconds. No credit card required."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!isLogin}
                        autoFocus={!isLogin}
                        className="rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus={isLogin}
                      className={`rounded-lg ${error && error.toLowerCase().includes("email") ? "border-destructive" : ""}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{isLogin ? "Password" : "Create Password"}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`rounded-lg ${error && error.toLowerCase().includes("password") ? "border-destructive" : ""}`}
                    />
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={!isLogin}
                        className={`rounded-lg ${error && error.toLowerCase().includes("password") ? "border-destructive" : ""}`}
                      />
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-destructive mt-1 font-medium">{error}</p>
                  )}

                  <Button type="submit" className="w-full gap-2 mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11 font-medium" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {isLogin ? "Authenticating..." : "Creating Account..."}</>
                    ) : (
                      <>
                        {isLogin ? "Access Portal" : "Create Account"} 
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </motion.div>

          <div className="text-center mt-6">
            <button 
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-light"
            >
              {isLogin 
                ? "Don't have an account? Register an account here" 
                : "Already have an account? Log in here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
