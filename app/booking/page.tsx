"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Check, Loader2, Calendar as CalendarIcon, Clock, Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import CheckoutForm from "@/components/CheckoutForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { getAvailableSlots, type TimeSlot } from "@/lib/availability"
import { format } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { handleBookingSubmit } from "@/app/actions/booking-actions"
import { checkAvailability } from "@/app/actions/calendar-actions"

const TIMEZONE = "America/New_York"
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder")
const TOTAL_STEPS = 4

const SERVICES = {
    exam: {
        id: "exam",
        title: "Comprehensive Eye Exam",
        desc: "State-of-the-art diagnostic vision test and health examination.",
        price: 125,
        duration: "60 mins"
    },
    styling: {
        id: "styling",
        title: "Bespoke Frame Styling",
        desc: "1-on-1 style and shape consultation with our certified optician.",
        price: 0,
        duration: "30 mins"
    },
    lens: {
        id: "lens",
        title: "Contact Lens Fitting",
        desc: "Curvature sizing, astigmatism/multifocal fitting, and trial lenses.",
        price: 90,
        duration: "45 mins"
    },
    adjustment: {
        id: "adjustment",
        title: "Glasses Adjustment",
        desc: " Ultrasonic cleaning, nose pad/screw adjustments and alignment.",
        price: 0,
        duration: "15 mins"
    }
}

function BookingContent() {
    const searchParams = useSearchParams()
    const queryType = searchParams.get("type")
    const initialService = queryType === "styling" 
        ? "styling" 
        : queryType === "lens" 
            ? "lens" 
            : queryType === "adjustment" 
                ? "adjustment" 
                : "exam"

    // Step 1: Selected Service
    const [selectedService, setSelectedService] = useState<string>(initialService)

    // Step 2: Client Details
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [notes, setNotes] = useState("")
    const [insuranceProvider, setInsuranceProvider] = useState("")
    const [detailsError, setDetailsError] = useState("")

    // Step 3: Date & Time Schedule
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]) // exactly 1 element
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)

    // Step 4: Billing
    const [receiptType, setReceiptType] = useState("none")
    const [clientSecret, setClientSecret] = useState("")
    const [activePaymentTab, setActivePaymentTab] = useState("clinic") // "clinic" (free checkouts/on-site) or "card"

    // Navigation
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    // Get info of current service
    const currentServiceInfo = SERVICES[selectedService as keyof typeof SERVICES] || SERVICES.exam
    const isFreeService = currentServiceInfo.price === 0

    // Force parameters based on our boutique location
    const sessionLocation = "onsite"
    const requiresTravel = false
    const address = ""

    // Update active service if query changes
    useEffect(() => {
        if (queryType && SERVICES[queryType as keyof typeof SERVICES]) {
            setSelectedService(queryType)
        }
    }, [queryType])

    // Load available slots when date changes
    useEffect(() => {
        if (selectedDate) {
            setIsLoadingSlots(true)
            checkAvailability(selectedDate.toISOString()).then(({ busySlots, rules }) => {
                const slots = getAvailableSlots(selectedDate, busySlots, rules)
                setAvailableSlots(slots)
                setIsLoadingSlots(false)
            }).catch((err) => {
                console.error("Failed to check availability", err)
                const slots = getAvailableSlots(selectedDate, [], [])
                setAvailableSlots(slots)
                setIsLoadingSlots(false)
            })
        }
    }, [selectedDate])

    // Fetch client secret if paid service & going to step 4
    useEffect(() => {
        if (step === 4 && !isFreeService) {
            fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: currentServiceInfo.price, currency: "cad" }),
            })
                .then(res => res.json())
                .then(data => setClientSecret(data.clientSecret))
                .catch(err => console.error("Stripe payment initiation failed:", err))
        }
    }, [step, selectedService, currentServiceInfo.price, isFreeService])

    // Handle session redirect stashing for 3D Secure
    const buildBookingData = (paymentMethod: string) => ({
        firstName,
        lastName,
        email,
        phone,
        notes: insuranceProvider ? `Insurance: ${insuranceProvider} | Notes: ${notes}` : notes,
        receiptType,
        sessionType: selectedService, // maps to exam, styling, lens, adjustment
        serviceType: selectedService,
        sessionLocation,
        requiresTravel,
        address,
        paymentMethod,
        slots: selectedSlots.map(s => ({
            startTime: s.startTime.toISOString(),
            endTime: s.endTime.toISOString(),
        })),
    })

    const stashBookingData = () => {
        try {
            sessionStorage.setItem("pending_booking", JSON.stringify(buildBookingData("credit_card")))
        } catch (err) {
            console.error("Failed to stash booking data:", err)
        }
    }

    // Stripe redirect handler — submit stashed booking data after 3DS redirect
    useEffect(() => {
        const secret = new URLSearchParams(window.location.search).get("payment_intent_client_secret")
        if (secret) {
            stripePromise.then(async stripe => {
                if (!stripe) return
                const { paymentIntent } = await stripe.retrievePaymentIntent(secret)
                if (paymentIntent?.status === "succeeded") {
                    const stashed = sessionStorage.getItem("pending_booking")
                    if (stashed) {
                        sessionStorage.removeItem("pending_booking")
                        try {
                            await handleBookingSubmit(JSON.parse(stashed))
                        } catch (err) {
                            console.error("Failed to submit stashed booking after redirect:", err)
                        }
                    }
                    setStep(5) // show success card
                }
            })
        }
    }, [])

    const handleDetailsNext = () => {
        if (!firstName || !lastName || !email) {
            setDetailsError("Please fill in all required fields.")
            return
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setDetailsError("Please enter a valid email address.")
            return
        }
        setDetailsError("")
        setStep(3)
    }

    const confirmSlot = (slot: TimeSlot) => {
        setSelectedSlots([slot]) // single session only
    }

    const removeSlot = () => {
        setSelectedSlots([])
    }

    const handleCompleteBooking = async () => {
        if (selectedSlots.length !== 1) return
        setIsLoading(true)
        try {
            const bookingMethod = isFreeService 
                ? "free" 
                : (activePaymentTab === "card" ? "credit_card" : "pay_at_clinic")

            await handleBookingSubmit(buildBookingData(bookingMethod))
        } catch (err) {
            console.error("Booking submission error:", err)
        } finally {
            setIsLoading(false)
            setStep(5) // success step
        }
    }

    const getProgress = () => (step / TOTAL_STEPS) * 100

    const disabledDays = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date < today
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:py-12 selection:bg-primary selection:text-primary-foreground font-sans">
            <div className="max-w-3xl mx-auto">
                <Button asChild variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary transition-colors text-muted-foreground">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>

                <div className="mb-8">
                    <h1 className="text-4xl font-serif font-bold text-foreground tracking-wide">Schedule Your Consultation</h1>
                    {step <= TOTAL_STEPS && (
                        <>
                            <p className="text-muted-foreground mt-2 font-light">Step {step} of {TOTAL_STEPS}</p>
                            <div className="h-1 w-full bg-muted mt-4 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${getProgress()}%` }} />
                            </div>
                        </>
                    )}
                </div>

                <div className="grid gap-6">
                    <AnimatePresence mode="wait">

                        {/* ── STEP 1: Select Service ── */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <Card className="border-border bg-card shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="font-serif text-2xl font-bold">Select Appointment Type</CardTitle>
                                        <CardDescription className="font-light">What kind of clinical or fashion styling appointment would you like to book?</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RadioGroup value={selectedService} onValueChange={val => { setSelectedService(val); setSelectedSlots([]) }} className="grid gap-4">
                                            {Object.values(SERVICES).map(service => (
                                                <div key={service.id} className={`flex items-start space-x-4 border p-5 rounded-xl cursor-pointer transition-all duration-200 ${selectedService === service.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}>
                                                    <RadioGroupItem value={service.id} id={service.id} className="mt-1" />
                                                    <div className="flex-1">
                                                        <Label htmlFor={service.id} className="text-base font-semibold cursor-pointer text-foreground">{service.title}</Label>
                                                        <p className="text-sm text-muted-foreground mt-1 font-light leading-relaxed">{service.desc}</p>
                                                        <span className="inline-block mt-2 text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">{service.duration}</span>
                                                    </div>
                                                    <div className="text-right font-bold text-lg text-primary">
                                                        {service.price === 0 ? "Free" : `$${service.price}`}
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            onClick={() => setStep(2)}
                                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-full h-11"
                                        >
                                            Continue
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Client Details ── */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <Card className="border-border bg-card shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="font-serif text-2xl font-bold">Your Details</CardTitle>
                                        <CardDescription className="font-light">We'll use this information to send your appointment invite, direct billing updates, and reminder updates.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                                                <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="rounded-lg" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                                                <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="rounded-lg" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="rounded-lg" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(416) 555-0100" className="rounded-lg" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="insurance">Health Insurance Provider (Optional)</Label>
                                            <Input id="insurance" value={insuranceProvider} onChange={e => setInsuranceProvider(e.target.value)} placeholder="e.g. Sun Life, Canada Life (for direct billing)" className="rounded-lg" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="notes">Additional Comments or Vision Concerns</Label>
                                            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="List any symptoms, current glasses problems, or specific style requests..." className="min-h-[100px] rounded-lg" />
                                        </div>
                                        {detailsError && <p className="text-sm text-destructive flex items-center gap-1.5 font-medium"><AlertCircle className="h-4 w-4" />{detailsError}</p>}
                                    </CardContent>
                                    <CardFooter className="flex justify-between gap-4">
                                        <Button variant="outline" onClick={() => setStep(1)} className="rounded-full px-6 border-primary/20">Back</Button>
                                        <Button onClick={handleDetailsNext} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-full h-11">Continue</Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )}

                        {/* ── STEP 3: Schedule Date & Time ── */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <Card className="border-border bg-card shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="font-serif text-2xl font-bold">Choose Date & Time</CardTitle>
                                        <CardDescription className="font-light">Select an available clinic booking slot (Eastern Time).</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {selectedSlots.length > 0 && (
                                            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-5 py-4">
                                                <div>
                                                    <span className="text-xs text-primary font-bold uppercase tracking-wider block mb-1">Your Selected Appointment</span>
                                                    <span className="text-base font-semibold text-foreground flex items-center gap-2">
                                                        <CalendarIcon className="h-4 w-4 text-primary" />
                                                        {formatInTimeZone(selectedSlots[0].startTime, TIMEZONE, "EEEE, MMMM d 'at' h:mm a")} ET
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    onClick={removeSlot}
                                                    className="text-muted-foreground hover:text-destructive hover:bg-transparent transition-colors font-medium text-sm"
                                                >
                                                    Reschedule
                                                </Button>
                                            </div>
                                        )}

                                        {selectedSlots.length === 0 && (
                                            <>
                                                <div className="flex justify-center border rounded-2xl p-4 bg-background/50">
                                                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={disabledDays} initialFocus />
                                                </div>

                                                {selectedDate && (
                                                    <div>
                                                        <p className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-primary" /> Available slots for {format(selectedDate, "EEEE, MMMM d")}
                                                        </p>
                                                        {isLoadingSlots ? (
                                                            <div className="py-8 flex justify-center items-center">
                                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                            </div>
                                                        ) : availableSlots.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground text-center py-6 border rounded-xl bg-muted/20 font-light">
                                                                No clinic appointments available for this date. Please select another day.
                                                            </p>
                                                        ) : (
                                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                                {availableSlots.map((slot, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => confirmSlot(slot)}
                                                                        className="py-2.5 px-3 rounded-lg text-sm font-medium border border-border hover:border-primary hover:bg-primary/5 transition-all text-center"
                                                                    >
                                                                        {slot.formattedTime}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {!selectedDate && (
                                                    <p className="text-sm text-muted-foreground text-center py-4 font-light">← Please select a date on the calendar above</p>
                                                )}
                                            </>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-between gap-4 border-t border-border pt-6">
                                        <Button variant="outline" onClick={() => setStep(2)} className="rounded-full px-6 border-primary/20">Back</Button>
                                        <Button
                                            onClick={() => setStep(4)}
                                            disabled={selectedSlots.length !== 1}
                                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-full h-11 disabled:opacity-50"
                                        >
                                            Continue to Confirmation
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )}

                        {/* ── STEP 4: Confirmation & Billing ── */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <Card className="border-border bg-card shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="font-serif text-2xl font-bold">Appointment Confirmation</CardTitle>
                                        <CardDescription className="font-light">Review details and secure your booking request.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Booking summary */}
                                        <div className="bg-secondary/40 p-5 rounded-xl border border-border space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg text-foreground">{currentServiceInfo.title}</h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5 font-light">{currentServiceInfo.duration} consultation</p>
                                                    {selectedSlots[0] && (
                                                        <div className="text-sm text-muted-foreground font-semibold flex items-center gap-1.5 mt-3 text-primary">
                                                            <CalendarIcon className="h-4 w-4" />
                                                            {formatInTimeZone(selectedSlots[0].startTime, TIMEZONE, "EEEE, MMMM d 'at' h:mm a")} ET
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-bold text-xl text-primary">
                                                    {isFreeService ? "Free" : `$${currentServiceInfo.price}`}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Insurance Option */}
                                        {!isFreeService && (
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-foreground">Do you require an official insurance invoice?</Label>
                                                <RadioGroup value={receiptType} onValueChange={setReceiptType} className="flex gap-3">
                                                    <div className={`flex items-center gap-2 border px-4 py-3 rounded-lg cursor-pointer transition-colors flex-1 ${receiptType === "none" ? "border-primary bg-primary/5" : "border-border"}`}>
                                                        <RadioGroupItem value="none" id="receipt-no" />
                                                        <label htmlFor="receipt-no" className="text-sm cursor-pointer font-medium">No Invoice Needed</label>
                                                    </div>
                                                    <div className={`flex items-center gap-2 border px-4 py-3 rounded-lg cursor-pointer transition-colors flex-1 ${receiptType === "yes" ? "border-primary bg-primary/5" : "border-border"}`}>
                                                        <RadioGroupItem value="yes" id="receipt-yes" />
                                                        <label htmlFor="receipt-yes" className="text-sm cursor-pointer font-medium">Yes, please generate</label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        )}

                                        {/* Free Checkout */}
                                        {isFreeService ? (
                                            <div className="space-y-4 pt-2">
                                                <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 p-4 rounded-xl text-sm leading-relaxed">
                                                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                                    <p className="text-muted-foreground font-light">
                                                        No deposit or credit card details are required for this styling/adjustment visit. Simply click below to confirm your spot in our calendar system.
                                                    </p>
                                                </div>
                                                <Button onClick={handleCompleteBooking} disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-full h-11">
                                                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Completing Booking...</> : "Confirm Appointment"}
                                                </Button>
                                            </div>
                                        ) : (
                                            /* Paid Checkout */
                                            <Tabs defaultValue="clinic" value={activePaymentTab} onValueChange={setActivePaymentTab} className="w-full">
                                                <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted p-1">
                                                    <TabsTrigger value="clinic" className="rounded-md">Pay at Clinic</TabsTrigger>
                                                    <TabsTrigger value="card" className="rounded-md">Prepay Online</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="clinic" className="space-y-4 pt-4">
                                                    <div className="border border-primary/20 bg-primary/5 p-4 rounded-xl leading-relaxed text-sm">
                                                        <div className="font-semibold text-foreground mb-1">Pay at Clinic & Direct Billing</div>
                                                        <p className="text-muted-foreground font-light text-xs">
                                                            Pay in-store on the day of your exam (cash, debit, visa, mastercard) or utilize direct insurance billing if your provider covers eye examinations.
                                                        </p>
                                                    </div>
                                                    <Button onClick={handleCompleteBooking} disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-full h-11">
                                                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scheduling...</> : `Book & Pay at Clinic ($${currentServiceInfo.price})`}
                                                    </Button>
                                                </TabsContent>
                                                <TabsContent value="card" className="space-y-4 pt-4">
                                                    {clientSecret ? (
                                                        <Elements options={{ clientSecret, appearance: { theme: "flat" } }} stripe={stripePromise}>
                                                            <CheckoutForm
                                                                amount={currentServiceInfo.price}
                                                                onStashBookingData={stashBookingData}
                                                                onPaymentSuccess={async () => {
                                                                    sessionStorage.removeItem("pending_booking")
                                                                    await handleBookingSubmit(buildBookingData("credit_card"))
                                                                    setStep(5)
                                                                }}
                                                            />
                                                        </Elements>
                                                    ) : (
                                                        <div className="py-8 flex justify-center items-center">
                                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                        </div>
                                                    )}
                                                </TabsContent>
                                            </Tabs>
                                        )}
                                    </CardContent>
                                    <CardFooter className="border-t border-border pt-4">
                                        <Button variant="outline" onClick={() => setStep(3)} className="rounded-full border-primary/20">Back</Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )}

                        {/* ── STEP 5: Success ── */}
                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: "spring" }}>
                                <Card className="border-border bg-card text-center py-12 shadow-md">
                                    <CardContent className="space-y-6">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                            className="mx-auto w-20 h-20 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center mb-6 border border-green-200 dark:border-green-900"
                                        >
                                            <Check className="h-10 w-10 text-green-600 dark:text-green-400" strokeWidth={3} />
                                        </motion.div>
                                        <div>
                                            <h2 className="text-3xl font-serif font-bold text-foreground">Booking Confirmed!</h2>
                                            <p className="text-muted-foreground mt-2 text-base font-light">We have successfully scheduled your consultation{firstName ? `, ${firstName}` : ""}!</p>
                                        </div>
                                        <div className="bg-secondary/40 p-6 rounded-xl max-w-sm mx-auto text-left border border-border space-y-3">
                                            <div className="flex justify-between items-center border-b border-border pb-2">
                                                <span className="text-muted-foreground text-sm font-light">Service Type</span>
                                                <span className="font-semibold text-foreground text-sm">{currentServiceInfo.title}</span>
                                            </div>
                                            <div className="space-y-1.5 text-sm">
                                                {selectedSlots[0] && (
                                                    <div className="text-muted-foreground">
                                                        <span className="font-medium text-foreground block mb-0.5">Appointment Date & Time:</span>
                                                        {formatInTimeZone(selectedSlots[0].startTime, TIMEZONE, "EEEE, MMMM d 'at' h:mm a")} ET
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground pt-2 border-t border-border font-light">
                                                <p className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500" />Confirmation email & invite sent.</p>
                                                <p className="flex items-center gap-2 mt-1"><Check className="h-3.5 w-3.5 text-green-500" />Direct billing details saved.</p>
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <Button asChild className="w-full max-w-xs bg-primary hover:bg-primary/90 rounded-full">
                                                <Link href="/">Back to Home</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Loading form settings...</div>}>
            <BookingContent />
        </Suspense>
    )
}
