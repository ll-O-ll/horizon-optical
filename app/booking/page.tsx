"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Check, Loader2, Send, Phone, MapPin, Mail } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function ContactPage() {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !phone || !message) {
            setError("Please fill in all fields.")
            return
        }
        setError("")
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
            {/* Background decorative elements */}
            <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-4xl w-full grid md:grid-cols-12 gap-8 items-stretch relative z-10">
                {/* Left Side: Contact Info & Value Prop */}
                <div className="md:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-secondary/20 border border-border/60 rounded-3xl backdrop-blur-md">
                    <div className="space-y-6">
                        <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors text-muted-foreground">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-foreground">Get In Touch</h1>
                            <p className="text-muted-foreground mt-2 text-sm font-light leading-relaxed">
                                Have a question about our curated luxury frames or want to schedule an appointment? Send us a message and our team will contact you shortly.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 my-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block font-light">Call Boutique</span>
                                <a href="tel:9054500044" className="text-sm font-medium hover:text-primary transition-colors">905-450-0044</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block font-light">Email Address</span>
                                <a href="mailto:info@horizonoptical.ca" className="text-sm font-medium hover:text-primary transition-colors">info@horizonoptical.ca</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block font-light">Boutique Location</span>
                                <span className="text-sm font-medium">7985 Financial Dr. Unit 2A, Brampton</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/60 pt-6">
                        <p className="text-xs text-muted-foreground font-light leading-relaxed">
                            Booking requests are reviewed daily. We'll follow up via phone to finalize your appointment details.
                        </p>
                    </div>
                </div>

                {/* Right Side: Form Card */}
                <div className="md:col-span-7">
                    <Card className="border border-border/85 bg-card/50 backdrop-blur-md shadow-xl rounded-3xl h-full flex flex-col justify-between overflow-hidden">
                        <AnimatePresence mode="wait">
                            {!isSubmitted ? (
                                <motion.form
                                    key="contact-form"
                                    onSubmit={handleSubmit}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6"
                                >
                                    <div>
                                        <CardTitle className="font-serif text-2xl font-bold">Contact Us</CardTitle>
                                        <CardDescription className="font-light mt-1">Please enter your contact details and message below.</CardDescription>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                                            <Input
                                                id="name"
                                                required
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="Your name"
                                                className="rounded-lg border-border/70 focus-visible:ring-primary"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                required
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                placeholder="Your phone number"
                                                className="rounded-lg border-border/70 focus-visible:ring-primary"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="message">Message / Vision Needs <span className="text-destructive">*</span></Label>
                                            <Textarea
                                                id="message"
                                                required
                                                rows={5}
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                                placeholder="Tell us about the services you need, preference for eye exams or styling, and your preferred day/time to visit..."
                                                className="rounded-lg border-border/70 focus-visible:ring-primary resize-none"
                                            />
                                        </div>

                                        {error && (
                                            <p className="text-xs text-destructive font-medium mt-1">
                                                {error}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full py-6 mt-6 shadow-lg shadow-primary/10 transition-all"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Sending Request...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send className="h-4 w-4" /> Send Message
                                            </span>
                                        )}
                                    </Button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success-card"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-8 text-center space-y-6 flex-1 flex flex-col justify-center items-center py-20"
                                >
                                    <div className="w-16 h-16 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center border border-green-200 dark:border-green-900 shadow-sm animate-bounce">
                                        <Check className="h-8 w-8 text-green-600 dark:text-green-400" strokeWidth={3} />
                                    </div>
                                    <div className="space-y-2 max-w-sm">
                                        <h2 className="font-serif text-2xl font-bold text-foreground">Message Sent!</h2>
                                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                                            Thank you for reaching out, <strong className="font-medium text-foreground">{name}</strong>. Your message was submitted successfully.
                                        </p>
                                        <p className="text-xs text-muted-foreground font-light pt-2 leading-relaxed">
                                            A boutique team member will contact you at <strong className="font-medium text-foreground">{phone}</strong> shortly to answer your inquiry or finalize your appointment time.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setIsSubmitted(false)
                                            setName("")
                                            setPhone("")
                                            setMessage("")
                                        }}
                                        variant="outline"
                                        className="rounded-full border-primary/20 text-xs px-6"
                                    >
                                        Send Another Message
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                </div>
            </div>
        </div>
    )
}
