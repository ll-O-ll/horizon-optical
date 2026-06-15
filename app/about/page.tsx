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
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.202-1.362a9.92 9.92 0 0 0 4.808 1.239h.005c5.507 0 9.99-4.478 9.99-9.985 0-2.667-1.038-5.176-2.924-7.062A9.917 9.917 0 0 0 12.012 2m0 2.136c2.1 0 4.074.818 5.56 2.302a7.828 7.828 0 0 1 2.3 5.548c0 4.335-3.528 7.86-7.863 7.86a7.809 7.809 0 0 1-4.005-1.1l-.288-.171-2.977.78.794-2.899-.187-.298A7.82 7.82 0 0 1 4.14 11.98c0-4.333 3.528-7.844 7.872-7.844m-3.504 3.093c-.193 0-.323.013-.448.156-.126.142-.486.475-.486 1.157 0 .683.498 1.343.568 1.438.07.095.96 1.543 2.38 2.102.337.133.601.213.805.277.34.102.648.087.892.052.272-.039.837-.341.954-.67.117-.329.117-.61.082-.67-.035-.06-.126-.095-.266-.164-.14-.07-.837-.412-.966-.458-.13-.047-.223-.07-.323.078-.1.149-.387.487-.475.584-.087.097-.175.11-.315.04a3.987 3.987 0 0 1-1.17-.72 4.385 4.385 0 0 1-.81-.998c-.08-.139-.009-.214.06-.283.064-.063.14-.162.21-.242.071-.081.094-.139.14-.233.047-.095.024-.177-.012-.249-.035-.07-.323-.78-.448-1.077-.122-.29-.244-.25-.333-.255" />
  </svg>
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
          text = "Closed Today"
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
        setCurrentHoursText("Mon - Fri: 10:30 AM - 7:00 PM")
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
                href="https://wa.me/16479496342"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-emerald-500 transition-colors text-emerald-600 dark:text-emerald-400 font-medium"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>WhatsApp: +1 647 949 6342</span>
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
                    Book Appointment
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
                      Book Appointment
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
                Schedule Exam
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background px-4">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="font-serif text-lg font-bold text-primary tracking-wide">
              HORIZON <span className="text-foreground font-sans font-light">OPTICAL</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">© {new Date().getFullYear()} Horizon Optical Boutique. All Rights Reserved.</p>
          </div>
          <div className="flex gap-8 items-center flex-wrap">
            <Link href="https://www.instagram.com/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <span className="text-xs">Instagram</span>
            </Link>
            <a
              href="https://wa.me/16479496342"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-500 transition-colors"
            >
              <WhatsAppIcon className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-xs">WhatsApp Chat</span>
            </a>
            <Link href="mailto:info@horizonoptical.ca" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Get in Touch</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
