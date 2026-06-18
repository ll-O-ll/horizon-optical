"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Menu, X, Check, Heart, Sparkles, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const TIMEZONE = "America/New_York"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <img
    src="/images/whatsapp.png"
    alt="WhatsApp Icon"
    className={className}
  />
)

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [currentHoursText, setCurrentHoursText] = useState("Closed Today")

  useEffect(() => {
    const checkStoreStatus = () => {
      try {
        const date = new Date()
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "America/New_York",
          hour: "numeric",
          minute: "numeric",
          hour12: false,
          weekday: "short"
        })
        const parts = formatter.formatToParts(date)
        const getVal = (type: string) => parts.find(p => p.type === type)?.value || ""
        const weekday = getVal("weekday")
        const hour = parseInt(getVal("hour"), 10)
        const minute = parseInt(getVal("minute"), 10)

        const timeFloat = hour + minute / 60

        let open = false
        let text = "Closed Today"

        if (weekday === "Sun") {
          text = "Sun: 12:00 PM - 5:00 PM"
          if (timeFloat >= 12 && timeFloat < 17) {
            open = true
          }
        } else if (weekday === "Sat") {
          text = "Sat: 10:00 AM - 5:00 PM"
          if (timeFloat >= 10 && timeFloat < 17) {
            open = true
          }
        } else {
          text = "Mon - Fri: 10:30 AM - 7:00 PM"
          if (timeFloat >= 10.5 && timeFloat < 19) {
            open = true
          }
        }

        setIsOpen(open)
        setCurrentHoursText(text)
      } catch (err) {
        console.error("Failed to parse store hours timezone:", err)
        const day = new Date().getDay()
        const hrs = new Date().getHours()
        const mins = new Date().getMinutes()
        const timeFloat = hrs + mins / 60
        if (day === 0) {
          setCurrentHoursText("Sun: 12:00 PM - 5:00 PM")
          if (timeFloat >= 12 && timeFloat < 17) setIsOpen(true)
        } else if (day === 6) {
          setCurrentHoursText("Sat: 10:00 AM - 5:00 PM")
          if (timeFloat >= 10 && timeFloat < 17) setIsOpen(true)
        } else {
          setCurrentHoursText("Mon - Fri: 10:30 AM - 7:00 PM")
          if (timeFloat >= 10.5 && timeFloat < 19) setIsOpen(true)
        }
      }
    }

    checkStoreStatus()
    const interval = setInterval(checkStoreStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
      {/* Header Container */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        {/* Top Info Bar */}
        <div className="bg-secondary/40 border-b border-border/40 py-2 text-xs">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-muted-foreground text-center md:text-left">
              <a
                href="/#find-us"
                className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>7985 Financial Dr. Unit 2A, Brampton</span>
              </a>
              <span className="hidden sm:inline text-border">|</span>
              <div className="flex items-center gap-1.5 justify-center">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  <span className={`${isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"} font-semibold`}>
                    {isOpen ? "Open Now" : "Closed"}
                  </span>
                  <span>({currentHoursText})</span>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-muted-foreground font-light flex-wrap">
              <a href="tel:9054500044" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Phone className="h-3 w-3 text-primary" />
                <span>Landline: 905-450-0044</span>
              </a>
              <span className="text-border">|</span>
              <a href="tel:9056016342" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Phone className="h-3 w-3 text-primary" />
                <span>Mobile: 905-601-6342</span>
              </a>
              <span className="text-border">|</span>
              <a
                href="https://wa.me/19056016342"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-emerald-500 transition-colors text-emerald-600 dark:text-emerald-400 font-medium"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>WhatsApp: +1 905 601 6342</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-28 sm:h-12 sm:w-36">
                <Image
                  src="/images/horizon-optical-inside-logo-clean.png"
                  alt="Horizon Optical Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-8">
                <Link href="/about" className="text-sm font-medium transition-colors tracking-wide text-primary">
                  About Us
                </Link>
                <Link href="/#services" className="text-sm font-medium transition-colors tracking-wide text-muted-foreground hover:text-primary">
                  Services
                </Link>
                <Link href="/#find-us" className="text-sm font-medium transition-colors tracking-wide text-muted-foreground hover:text-primary">
                  Find Us
                </Link>
                <Link href="/portal" className="text-sm font-medium transition-colors tracking-wide text-muted-foreground hover:text-primary">
                  Client Portal
                </Link>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium rounded-full px-5 sm:px-6 transition-all duration-300">
                  <Link href="/booking">
                    Contact Us
                  </Link>
                </Button>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden border-t border-border bg-background overflow-hidden"
            >
              <div className="space-y-2 px-4 py-6">
                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-primary transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="/#services"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="/#find-us"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Find Us
                </Link>
                <Link
                  href="/portal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Client Portal
                </Link>
                <div className="pt-4 border-t border-border/60">
                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5">
                    <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                      Contact Us
                    </Link>
                  </Button>
                </div>
                
                <div className="pt-6 border-t border-border/60 mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">Hours: </span>
                      <span>{currentHoursText}</span>
                      <span className="inline-flex items-center gap-1.5 ml-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        <span className={`${isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"} font-bold text-xs`}>
                          {isOpen ? "Open Now" : "Closed"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">Location: </span>
                      <span>7985 Financial Dr. Unit 2A, Brampton</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-48 pb-20 lg:pt-56 lg:pb-24 overflow-hidden px-4 bg-secondary/10 border-b border-border">
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="mx-auto max-w-7xl text-center relative z-10">
          <motion.div {...fadeInUp}>
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">About Us</span>
            <h1 className="font-serif text-5xl font-bold sm:text-6xl mt-4 text-foreground">
              Our Story & Philosophy
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
              Horizon Optical is a boutique vision clinic dedicated to providing Brampton with the perfect harmony of clinical optometry and luxury eyewear styling.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-4 bg-background border-b border-border">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div {...fadeInUp} className="space-y-8">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl text-foreground">The Philosophy</h2>
            <div className="flex justify-center"><div className="h-0.5 w-16 bg-primary rounded"></div></div>
            <p className="text-xl text-muted-foreground leading-relaxed font-light">
              We believe glasses are more than just utility. They are a prominent expression of your character and style. By marrying <span className="text-primary font-medium">precision optometry</span> with luxury curated eyewear designers, we provide a sight assessment and aesthetic fitting that ensures you see—and are seen—with absolute clarity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Core Pillars Section */}
      <section className="py-24 px-4 bg-secondary/15">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">Our Values</span>
            <h2 className="font-serif text-3xl font-bold sm:text-4xl mt-2 text-foreground">Core Pillars of Care</h2>
            <div className="flex justify-center mt-3"><div className="h-0.5 w-12 bg-primary rounded"></div></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 border-border bg-card shadow-sm hover:border-primary/40 transition-colors flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">Aesthetic Integrity</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                We select designer frame shapes, silhouettes, and premium materials that complement individual features and celebrate personal style.
              </p>
            </Card>

            <Card className="p-8 border-border bg-card shadow-sm hover:border-primary/40 transition-colors flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">Precision Clinical Optometry</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                Utilizing state-of-the-art diagnostic vision technology, our optometrists ensure absolute measurement accuracy and comprehensive eye health assessments.
              </p>
            </Card>

            <Card className="p-8 border-border bg-card shadow-sm hover:border-primary/40 transition-colors flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">Community First Care</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">
                As a family-oriented boutique in Brampton, we prioritize direct billing support, personalized guidance, and lifetime adjustment services for all patient visits.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Book CTA Section */}
      <section className="py-20 px-4 bg-background border-t border-border text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="font-serif text-3xl font-bold text-foreground">Ready to Experience Horizon?</h2>
          <p className="text-muted-foreground font-light leading-relaxed">
            Schedule an eye examination or stop by our Brampton boutique for frame alignments.
          </p>
          <div className="pt-4">
            <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-12 px-8">
              <Link href="/booking">
                Get In Touch
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border bg-background/50 backdrop-blur-sm px-4 font-sans">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12">
          {/* Column 1: Brand Info (Span 4) */}
          <div className="md:col-span-4 space-y-4 text-center md:text-left">
            <div className="font-serif text-2xl font-bold text-primary tracking-wide">
              HORIZON <span className="text-foreground font-sans font-light">OPTICAL</span>
            </div>
            <p className="text-sm text-muted-foreground font-light max-w-sm leading-relaxed mx-auto md:mx-0">
              Curated luxury eyewear and precision clinical optometry. Handcrafted lenses and personalized styling services in Brampton.
            </p>
            <div className="flex flex-col items-center md:items-start gap-2.5 pt-2">
              <a href="https://www.instagram.com/horizonoptical" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <img src="/images/instagram.png" alt="Instagram Logo" className="h-4 w-4 shrink-0" />
                <span className="text-xs">@horizonoptical</span>
              </a>
              <a href="https://wa.me/19056016342" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-500 transition-colors">
                <WhatsAppIcon className="h-4 w-4 shrink-0" />
                <span className="text-xs">WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (Span 3) */}
          <div className="md:col-span-3 space-y-4 text-center md:text-left">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">Explore</h3>
            <ul className="space-y-2.5 text-sm font-light text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-primary transition-colors">Services</Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-primary transition-colors">Get In Touch</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Store Hours Calendar (Span 5) */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-primary text-center md:text-left">Clinic Hours</h3>
            <div className="bg-secondary/20 border border-border/45 rounded-2xl p-4.5 space-y-2 backdrop-blur-sm shadow-sm max-w-md mx-auto md:mx-0">
              {[
                { days: "Monday - Friday", hours: "10:30 AM - 7:00 PM", isToday: new Date().getDay() >= 1 && new Date().getDay() <= 5 },
                { days: "Saturday", hours: "10:00 AM - 5:00 PM", isToday: new Date().getDay() === 6 },
                { days: "Sunday", hours: "12:00 PM - 5:00 PM", isToday: new Date().getDay() === 0 },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center gap-4 text-xs px-3.5 py-2 rounded-xl transition-all duration-200 ${
                    item.isToday
                      ? "bg-primary/10 border border-primary/20 text-primary font-semibold shadow-sm"
                      : "text-muted-foreground border border-transparent hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.isToday && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                    <span>{item.days}</span>
                  </div>
                  <span className={item.isToday ? "text-primary font-bold" : "font-light"}>{item.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright block */}
        <div className="mx-auto max-w-7xl border-t border-border/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Horizon Optical Boutique. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link href="/booking" className="hover:text-primary transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
