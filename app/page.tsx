"use client"

import { useState, useEffect, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, Star, Quote, Eye, Sparkles, ShieldCheck, MapPin, Phone, Mail, Clock, Menu, X, Send, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getShowcaseData } from "@/lib/showcase-actions"

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


function FeedbackForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !email || !comment) return
    setIsSubmitting(true)
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form field values
    setName("")
    setEmail("")
    setRating(5)
    setComment("")
  }

  return (
    <Card className="border-border bg-card p-6 shadow-sm overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form
            key="feedback-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">Direct Feedback</h3>
              <p className="text-muted-foreground text-xs font-light mt-1">
                Your thoughts help our management team maintain high clinical & styling standards.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="feedback-name" className="text-xs font-medium text-foreground">Full Name</label>
              <input
                id="feedback-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="your name"
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="feedback-email" className="text-xs font-medium text-foreground">Email Address</label>
              <input
                id="feedback-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-foreground block">Your Rating</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 -m-1 focus:outline-none transition-transform hover:scale-110"
                    aria-label={`Rate ${star} Stars`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoverRating || rating)
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted-foreground/30"
                      } transition-colors duration-150`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="feedback-comment" className="text-xs font-medium text-foreground">Comments / Experience</label>
              <textarea
                id="feedback-comment"
                required
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your styling or eye doctor visit details..."
                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5 font-semibold text-sm transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Sending Feedback...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Send className="h-4 w-4" /> Send Feedback
                </span>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="py-8 text-center space-y-4"
          >
            <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center border border-green-200 dark:border-green-900">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400 animate-bounce" strokeWidth={3} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-foreground">Thank You!</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed font-light">
                Your direct feedback has been submitted successfully and will be shared with the Horizon Optical management team.
              </p>
            </div>
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="rounded-full border-primary/20 text-xs px-4"
            >
              Send Another Message
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

interface GlassesModel {
  name: string;
  code: string;
  image: string;
  shape: string;
  material: string;
  fit: string;
}

const DEFAULT_BRAND_MODELS: Record<string, {
  bio: string;
  models: GlassesModel[];
}> = {
  "Ray-Ban": {
    bio: "Unrivaled heritage, legendary designs. Ray-Ban has been the global leader in luxury eyewear since 1937, merging vintage coolness with timeless utility.",
    models: [
      { name: "New Wayfarer", code: "RX5184", image: "/images/glasses-wayfarer.png", shape: "Square", material: "Premium Acetate", fit: "Oval, Round faces" },
      { name: "Clubmaster Classic", code: "RX5154", image: "/images/glasses-clubmaster.png", shape: "Browline", material: "Acetate & Metal", fit: "Square, Oval faces" },
      { name: "Aviator Classic", code: "RX6489", image: "/images/glasses-aviator.png", shape: "Aviator", material: "Lightweight Metal", fit: "Heart, Square faces" },
    ]
  },
  "Oakley Meta": {
    bio: "Leading-edge sports science meets luxury performance. Oakley's frames combine patented lightweight O Matter and metal composites to provide grip and protection.",
    models: [
      { name: "Holbrook Active", code: "RX8156", image: "/images/glasses-wayfarer.png", shape: "Square", material: "O Matter Composite", fit: "Round, Oval faces" },
      { name: "Frogskins Retro", code: "RX3444V", image: "/images/glasses-clubmaster.png", shape: "Round-Square", material: "Lightweight Acetate", fit: "Square, Heart faces" }
    ]
  },
  "Kate Spade": {
    bio: "Chic, feminine, and spirited. Kate Spade eyewear features playful colors, modern graphic elements, and signature spade logo details.",
    models: [
      { name: "Lucyann Rectangular", code: "Lucyann", image: "/images/glasses-wayfarer.png", shape: "Rectangular", material: "Polished Acetate", fit: "Round, Heart faces" },
      { name: "Genevieve Cat-Eye", code: "Genevieve", image: "/images/glasses-clubmaster.png", shape: "Cat-Eye", material: "Acetate", fit: "Oval, Square faces" }
    ]
  },
  "Boss": {
    bio: "Sartorial elegance and modern craftsmanship. HUGO BOSS eyewear represents business-class luxury, with clean cuts and premium material blends.",
    models: [
      { name: "Executive Rectangle", code: "Boss 1118", image: "/images/glasses-wayfarer.png", shape: "Rectangular", material: "Pure Titanium", fit: "Round, Oval faces" },
      { name: "Horn-Rim Modern", code: "Boss 1354", image: "/images/glasses-clubmaster.png", shape: "Horn-Rimmed", material: "Bespoke Acetate", fit: "Oval, Square faces" }
    ]
  },
  "Emporio Armani": {
    bio: "Contemporary streetwear meets luxury Italian fashion. Emporio Armani frames are youthful, dynamic, and detailed with the signature eagle insignia.",
    models: [
      { name: "Urban Active", code: "EA3186", image: "/images/glasses-wayfarer.png", shape: "Rectangular", material: "Matte Acetate", fit: "Round, Oval faces" },
      { name: "Italian Silhouette", code: "EA4152", image: "/images/glasses-aviator.png", shape: "Aviator", material: "High-Grade Steel", fit: "Square, Heart faces" }
    ]
  },
  "Versace": {
    bio: "Bold, glamorous, and unapologetically lavish. Versace eyewear is characterized by high-contrast details and gold Medusa iconography.",
    models: [
      { name: "Medusa Butterfly", code: "VE3281", image: "/images/glasses-clubmaster.png", shape: "Butterfly", material: "Thick Acetate", fit: "Round, Heart faces" },
      { name: "Medusa Chic Wire", code: "VE1275", image: "/images/glasses-aviator.png", shape: "Cat-Eye", material: "Gold-Plated Metal", fit: "Oval, Square faces" }
    ]
  },
  "Burberry": {
    bio: "British heritage with a cosmopolitan flair. Burberry eyewear integrates the classic tartan check pattern with modern silhouette engineering.",
    models: [
      { name: "Tartan Checked Square", code: "BE2331", image: "/images/glasses-wayfarer.png", shape: "Square", material: "Acetate", fit: "Round, Oval faces" },
      { name: "Signature Semi-Rimless", code: "BE1353", image: "/images/glasses-aviator.png", shape: "Semi-Rimless", material: "Brushed Steel", fit: "Heart, Square faces" }
    ]
  },
  "Coach": {
    bio: "Authentic American style with NY city attitude. Coach frames combine classic leather-inspired detailing and subtle logo engravings.",
    models: [
      { name: "Signature Canvas Rect", code: "HC6143", image: "/images/glasses-wayfarer.png", shape: "Rectangular", material: "Engraved Acetate", fit: "Round, Heart faces" },
      { name: "Rose Gold Wire", code: "HC5113", image: "/images/glasses-aviator.png", shape: "Round", material: "Rose Gold Metal", fit: "Oval, Square faces" }
    ]
  },
  "PRADA": {
    bio: "Sophisticated Italian luxury and avant-garde designs. Prada frames feature refined geometric shapes, clean lines, and the iconic triangle emblem.",
    models: [
      { name: "Prada Runway Square", code: "PR17WS", image: "/images/glasses-wayfarer.png", shape: "Square", material: "Premium Acetate", fit: "Round, Oval faces" },
      { name: "Linear Carbon Aviator", code: "PR54YS", image: "/images/glasses-aviator.png", shape: "Aviator", material: "Metal & Carbon Fiber", fit: "Square, Heart faces" }
    ]
  },
  "Timberland": {
    bio: "Rugged durability meets environmental responsibility. Timberland frames feature Earthkeepers bio-based materials and outdoor-ready active designs.",
    models: [
      { name: "Active Outdoor Rectangle", code: "TB1642", image: "/images/glasses-wayfarer.png", shape: "Rectangular", material: "Bio-based Acetate", fit: "Round, Oval faces" },
      { name: "Classic Navigator Wire", code: "TB9190", image: "/images/glasses-aviator.png", shape: "Aviator", material: "Recycled Metal", fit: "Square, Heart faces" }
    ]
  }
};

const getBrandData = (brandName: string, catalog: Record<string, any>) => {
  if (catalog && catalog[brandName]) {
    return catalog[brandName];
  }
  if (DEFAULT_BRAND_MODELS[brandName]) {
    return DEFAULT_BRAND_MODELS[brandName];
  }
  return {
    bio: `${brandName} represents premium fashion craftsmanship. Their eyewear collection blends unique house styling elements with state-of-the-art durability.`,
    models: [
      { name: `Signature ${brandName} Square`, code: `${brandName.substring(0, 3).toUpperCase()}-7209`, image: "/images/glasses-wayfarer.png", shape: "Square", material: "Polished Acetate", fit: "Oval, Round faces" },
      { name: `Bespoke ${brandName} Round`, code: `${brandName.substring(0, 3).toUpperCase()}-4188`, image: "/images/glasses-clubmaster.png", shape: "Round", material: "Metal & Acetate", fit: "Square, Heart faces" }
    ]
  };
};

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [currentHoursText, setCurrentHoursText] = useState("Closed Today")
  const [showcaseCatalog, setShowcaseCatalog] = useState<Record<string, any>>({})

  useEffect(() => {
    const loadShowcase = async () => {
      const res = await getShowcaseData()
      if (res.success) {
        setShowcaseCatalog(res.data)
      }
    }
    loadShowcase()
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        document.body.style.overflow = "hidden"
      }
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedBrand])

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
      } catch (e) {
        const day = new Date().getDay()
        const hrs = new Date().getHours()
        const mins = new Date().getMinutes()
        const timeFloat = hrs + mins / 60
        if (day === 0) {
          setCurrentHoursText("Closed Today")
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
            {/* Left side: Location & Hours */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-muted-foreground text-center md:text-left">
              <a
                href="#find-us"
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
            {/* Right side: Contact Phones */}
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
                <Link href="/about" className="text-sm font-medium transition-colors tracking-wide text-muted-foreground hover:text-primary">
                  About Us
                </Link>
                <Link href="#services" className="text-sm font-medium transition-colors tracking-wide text-muted-foreground hover:text-primary">
                  Services
                </Link>
                <Link href="#find-us" className="text-sm font-medium transition-colors tracking-wide text-muted-foreground hover:text-primary">
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
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="#services"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="#find-us"
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
      <section className="relative pt-56 pb-20 lg:pt-52 lg:pb-32 overflow-hidden px-4">
        {/* Abstract design elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide mb-6">
                <Sparkles className="h-3.5 w-3.5" /> Curated Luxury Eyewear & Care
              </div>
              <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl text-foreground">
                Vision with <br /><span className="text-primary font-sans font-light">Perspective</span>.
              </h1>
              <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-lg font-light">
                Discover the perfect harmony of state-of-the-art clinical optometry and bespoke frame styling. We handcraft prescription lenses and tailor premium frame silhouettes to elevate your unique identity.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-12 px-8 shadow-lg shadow-primary/10">
                  <Link href="/booking">
                    Schedule Exam
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="rounded-full text-muted-foreground hover:text-primary hover:bg-transparent text-lg h-12 px-8">
                  <Link href="#services">
                    View Services
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative flex justify-center"
            >
              <div className="relative aspect-square w-full max-w-[500px]">
                <Image
                  src="/images/hero-glasses.png"
                  alt="Premium Eyewear Concept"
                  width={500}
                  height={500}
                  className="relative z-10 rounded-3xl object-cover shadow-2xl shadow-accent/10 border border-border"
                  priority
                />
                <div className="absolute -bottom-6 -right-6 w-full h-full border border-primary/20 rounded-3xl -z-10 hidden xl:block"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 border-t border-border bg-secondary/10 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="mb-12 text-center">
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">Curated Selection</span>
            <h2 className="font-serif text-3xl font-bold sm:text-4xl mt-2 text-foreground">Featured Designers</h2>
            <div className="flex justify-center mt-3"><div className="h-0.5 w-12 bg-primary rounded"></div></div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {[
              { name: "Emporio Armani", element: <span className="font-sans font-light tracking-[0.25em] uppercase text-xs">EMPORIO ARMANI</span> },
              { name: "Kate Spade", element: (
                <div className="flex flex-col items-center gap-1.5">
                  <svg className="h-3 w-3 fill-foreground/70" viewBox="0 0 24 24">
                    <path d="M12 2C9.5 6.5 4 10.2 4 13.5C4 16.5 6.5 19 9.5 19C10.8 19 11.5 18.5 12 18C12.5 18.5 13.2 19 14.5 19C17.5 19 20 16.5 20 13.5C20 10.2 14.5 6.5 12 2ZM12 18C11.5 18 10 22 10 22H14C14 22 12.5 18 12 18Z" />
                  </svg>
                  <span className="font-serif tracking-[0.2em] lowercase text-[10px]">kate spade</span>
                </div>
              ) },
              { name: "Tory Burch", element: <span className="font-serif font-bold tracking-[0.2em] uppercase text-xs">TORY BURCH</span> },
              { name: "Ray-Ban", element: <span className="font-sans font-black italic tracking-tighter text-lg text-primary">Ray·Ban</span> },
              { name: "Vogue", element: <span className="font-serif font-bold italic tracking-[0.12em] uppercase text-base">VOGUE</span> },
              { name: "Coach", element: <span className="font-serif font-extrabold tracking-[0.25em] uppercase text-xs">COACH</span> },
              { name: "Michael Kors", element: <span className="font-sans font-bold tracking-[0.18em] uppercase text-[10px]">MICHAEL KORS</span> },
              { name: "Guess", element: <span className="font-serif font-black tracking-[0.3em] uppercase text-[10px]">GUESS</span> },
              { name: "Tommy Hilfiger", element: (
                <div className="flex items-center gap-1.5">
                  <svg className="h-2.5 w-4 border border-border" viewBox="0 0 20 12">
                    <rect width="20" height="12" fill="#0f1d3a"/>
                    <rect y="3" width="20" height="6" fill="#ffffff"/>
                    <rect x="10" y="3" width="10" height="6" fill="#da1a1a"/>
                  </svg>
                  <span className="font-sans font-bold tracking-[0.12em] uppercase text-[9px]">TOMMY HILFIGER</span>
                </div>
              ) },
              { name: "Polo Ralph Lauren", element: (
                <div className="flex flex-col items-center">
                  <span className="font-serif font-bold tracking-[0.15em] uppercase text-[10px]">POLO</span>
                  <span className="font-serif tracking-[0.1em] uppercase text-[8px] text-muted-foreground">RALPH LAUREN</span>
                </div>
              ) },
              { name: "Hugo", element: <span className="font-sans font-medium tracking-[0.25em] uppercase text-xs">HUGO</span> },
              { name: "Boss", element: <span className="font-sans font-black tracking-[0.12em] uppercase text-sm">BOSS</span> },
              { name: "Versace", element: <span className="font-serif font-normal tracking-[0.3em] uppercase text-[10px]">VERSACE</span> },
              { name: "Burberry", element: <span className="font-serif font-bold tracking-[0.2em] uppercase text-[10px]">BURBERRY</span> },
              { name: "Marc Jacobs", element: <span className="font-sans font-bold tracking-[0.2em] uppercase text-[10px]">MARC JACOBS</span> },
              { name: "DKNY", element: <span className="font-sans font-extrabold tracking-[0.05em] uppercase text-sm">DKNY</span> },
              { name: "Oakley Meta", element: (
                <div className="flex items-center gap-1">
                  <span className="font-sans font-black italic tracking-tighter uppercase text-sm">OAKLEY</span>
                  <span className="font-sans font-light tracking-[0.05em] uppercase text-[8px] bg-primary/10 text-primary px-1 py-0.5 rounded-sm">META</span>
                </div>
              ) },
              { name: "PRADA", element: <span className="font-serif font-normal tracking-[0.35em] uppercase text-xs">PRADA</span> },
              { name: "Timberland", element: <span className="font-sans font-extrabold tracking-[0.15em] uppercase text-xs">Timberland</span> }
            ].map((brand, index) => (
              <div
                key={index}
                onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                className={`flex h-16 items-center justify-center rounded-xl bg-card border p-3 transition-all duration-300 hover:scale-105 select-none cursor-pointer ${
                  selectedBrand === brand.name
                    ? "border-primary ring-1 ring-primary/20 shadow-md shadow-accent/5 bg-primary/5 text-primary"
                    : "border-border/40 text-foreground/75 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {brand.element}
              </div>
            ))}
          </div>

          {/* Brand Models Details Panel */}
          <AnimatePresence mode="wait">
            {selectedBrand && (() => {
              const brandData = getBrandData(selectedBrand, showcaseCatalog);
              const brandObj = [
                { name: "Emporio Armani", element: <span className="font-sans font-light tracking-[0.25em] uppercase text-xs">EMPORIO ARMANI</span> },
                { name: "Kate Spade", element: (
                  <div className="flex flex-col items-center gap-1.5 scale-75">
                    <svg className="h-3 w-3 fill-foreground/70" viewBox="0 0 24 24">
                      <path d="M12 2C9.5 6.5 4 10.2 4 13.5C4 16.5 6.5 19 9.5 19C10.8 19 11.5 18.5 12 18C12.5 18.5 13.2 19 14.5 19C17.5 19 20 16.5 20 13.5C20 10.2 14.5 6.5 12 2ZM12 18C11.5 18 10 22 10 22H14C14 22 12.5 18 12 18Z" />
                    </svg>
                    <span className="font-serif tracking-[0.2em] lowercase text-[10px]">kate spade</span>
                  </div>
                ) },
                { name: "Tory Burch", element: <span className="font-serif font-bold tracking-[0.2em] uppercase text-xs">TORY BURCH</span> },
                { name: "Ray-Ban", element: <span className="font-sans font-black italic tracking-tighter text-lg text-primary">Ray·Ban</span> },
                { name: "Vogue", element: <span className="font-serif font-bold italic tracking-[0.12em] uppercase text-base">VOGUE</span> },
                { name: "Coach", element: <span className="font-serif font-extrabold tracking-[0.25em] uppercase text-xs">COACH</span> },
                { name: "Michael Kors", element: <span className="font-sans font-bold tracking-[0.18em] uppercase text-[10px]">MICHAEL KORS</span> },
                { name: "Guess", element: <span className="font-serif font-black tracking-[0.3em] uppercase text-[10px]">GUESS</span> },
                { name: "Tommy Hilfiger", element: (
                  <div className="flex items-center gap-1.5 scale-75">
                    <svg className="h-2.5 w-4 border border-border" viewBox="0 0 20 12">
                      <rect width="20" height="12" fill="#0f1d3a"/>
                      <rect y="3" width="20" height="6" fill="#ffffff"/>
                      <rect x="10" y="3" width="10" height="6" fill="#da1a1a"/>
                    </svg>
                    <span className="font-sans font-bold tracking-[0.12em] uppercase text-[9px]">TOMMY HILFIGER</span>
                  </div>
                ) },
                { name: "Polo Ralph Lauren", element: (
                  <div className="flex flex-col items-center scale-75">
                    <span className="font-serif font-bold tracking-[0.15em] uppercase text-[10px]">POLO</span>
                    <span className="font-serif tracking-[0.1em] uppercase text-[8px] text-muted-foreground">RALPH LAUREN</span>
                  </div>
                ) },
                { name: "Hugo", element: <span className="font-sans font-medium tracking-[0.25em] uppercase text-xs">HUGO</span> },
                { name: "Boss", element: <span className="font-sans font-black tracking-[0.12em] uppercase text-sm">BOSS</span> },
                { name: "Versace", element: <span className="font-serif font-normal tracking-[0.3em] uppercase text-[10px]">VERSACE</span> },
                { name: "Burberry", element: <span className="font-serif font-bold tracking-[0.2em] uppercase text-[10px]">BURBERRY</span> },
                { name: "Marc Jacobs", element: <span className="font-sans font-bold tracking-[0.2em] uppercase text-[10px]">MARC JACOBS</span> },
                { name: "DKNY", element: <span className="font-sans font-extrabold tracking-[0.05em] uppercase text-sm">DKNY</span> },
                { name: "Oakley Meta", element: (
                  <div className="flex items-center gap-1 scale-75">
                    <span className="font-sans font-black italic tracking-tighter uppercase text-sm">OAKLEY</span>
                    <span className="font-sans font-light tracking-[0.05em] uppercase text-[8px] bg-primary/10 text-primary px-1 py-0.5 rounded-sm">META</span>
                  </div>
                ) },
                { name: "PRADA", element: <span className="font-serif font-normal tracking-[0.35em] uppercase text-xs">PRADA</span> },
                { name: "Timberland", element: <span className="font-sans font-extrabold tracking-[0.15em] uppercase text-xs">Timberland</span> }
              ].find(b => b.name === selectedBrand);

              return (
                <motion.div
                  key={selectedBrand}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setSelectedBrand(null)
                    }
                  }}
                  className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto md:relative md:inset-auto md:z-auto md:bg-transparent md:backdrop-blur-none md:p-0 md:mt-12 md:overflow-visible md:block md:pointer-events-none"
                >
                  <Card className="relative border border-primary/20 bg-card p-6 sm:p-8 shadow-2xl shadow-accent/5 w-full max-w-5xl max-h-[85vh] overflow-y-auto md:max-h-none md:overflow-visible md:shadow-lg md:rounded-3xl pointer-events-auto rounded-2xl">
                    <button
                      onClick={() => setSelectedBrand(null)}
                      className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
                      aria-label="Close details"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/60 pb-6 mb-8">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold tracking-wider text-primary uppercase">Designer Showcase</span>
                        <div className="flex items-center gap-3">
                          <h3 className="font-serif text-2xl font-bold text-foreground">{selectedBrand}</h3>
                          <div className="flex items-center justify-center border border-border/40 rounded-lg bg-secondary/15 px-3 py-1 scale-90">
                            {brandObj?.element}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl font-light">
                          {brandData.bio}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedBrand(null)}
                        className="text-xs text-muted-foreground hover:text-foreground shrink-0 border border-border/40 rounded-full px-4 h-8"
                      >
                        Close Showcase
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {brandData.models.map((model, idx) => (
                        <Card key={idx} className="border border-border/40 bg-background/50 hover:border-primary/30 p-5 rounded-xl transition-all duration-300 hover:shadow-md flex flex-col group h-full">
                          {/* Image Box */}
                          <div className="relative aspect-video w-full rounded-lg bg-white overflow-hidden border border-border/10 mb-4 flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform duration-300">
                            <Image
                              src={model.image}
                              alt={`${selectedBrand} ${model.name}`}
                              width={220}
                              height={110}
                              className="object-contain max-h-[100px]"
                            />
                            {/* Overlay Logo */}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-background/85 border border-border/30 rounded-md py-0.5 px-2 text-[9px] text-muted-foreground scale-90 select-none shadow-sm backdrop-blur-sm">
                              <span className="font-semibold text-foreground/80">{selectedBrand}</span>
                              <span className="text-border">|</span>
                              <span className="scale-75 origin-left inline-flex items-center">{brandObj?.element}</span>
                            </div>
                          </div>

                          {/* Model Specs */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-primary tracking-wide uppercase block">Model ID: {model.code}</span>
                              <h4 className="font-serif text-lg font-bold text-foreground mt-0.5 leading-tight">{model.name}</h4>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/30 pt-3">
                              <div>
                                <span className="text-muted-foreground font-light block">Shape</span>
                                <span className="font-medium text-foreground">{model.shape}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground font-light block">Material</span>
                                <span className="font-medium text-foreground">{model.material}</span>
                              </div>
                              <div className="col-span-2 mt-1">
                                <span className="text-muted-foreground font-light block">Ideal Fit</span>
                                <span className="font-medium text-foreground">{model.fit}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </section>



      {/* Services Section */}
      <section id="services" className="pt-24 pb-12 px-4 bg-background">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="mb-20 text-center">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">Clinical & Care Services</h2>
            <div className="flex justify-center mt-4"><div className="h-0.5 w-12 bg-primary rounded"></div></div>
            <p className="mt-4 text-lg text-muted-foreground font-light">Experience comprehensive vision care and frame adjustments under one roof.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Eye Exam */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="p-8 border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col shadow-sm">
                <div className="mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-2">Comprehensive Eye Exam</h3>
                  <div className="text-3xl font-bold text-primary">$105</div>
                  <p className="mt-4 text-muted-foreground">Detailed evaluation of visual acuity, refractive status, and ocular health using premium clinical technologies.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>60-minute comprehensive clinical testing</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Glaucoma and macular health checks</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Digital prescription optimization</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground">
                  <Link href="/booking?type=exam">Book Exam</Link>
                </Button>
              </Card>
            </motion.div>

            {/* Contact Lens */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="p-8 border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col shadow-sm">
                <div className="mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-2">CL Fitting</h3>
                  <div className="text-3xl font-bold text-primary">$30</div>
                  <p className="mt-4 text-muted-foreground">Sizing, design selection, and trial application for soft, astigmatism, or multifocal contact lenses.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Detailed corneal curvature measurement</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Trial lenses included</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Insertion & removal guidance for beginners</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground">
                  <Link href="/booking?type=lens">Book Fitting</Link>
                </Button>
              </Card>
            </motion.div>

            {/* Adjustments */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="p-8 border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col shadow-sm">
                <div className="mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-2">Glasses Adjustment</h3>
                  <div className="text-3xl font-bold text-primary">Free</div>
                  <p className="mt-4 text-muted-foreground">Drop-in frame alignment, loose screw replacement, nose-pad changes, and ultrasonic cleanings.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Complimentary for all visitors</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Nose pad & screw replacements</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Ultrasonic frame deep-clean</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground">
                  <Link href="/booking?type=adjustment">Book Free Slot</Link>
                </Button>
              </Card>
            </motion.div>
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>Direct billing available for major health insurance providers</p>
          </div>
        </div>
      </section>



      {/* Customer Reviews Section */}
      <section className="pt-12 pb-24 px-4 bg-background">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">Client Stories</h2>
            <div className="flex justify-center mt-4"><div className="h-0.5 w-12 bg-primary rounded"></div></div>
            <p className="mt-4 text-lg text-muted-foreground font-light">What our patients and fashion clients say.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Great service and knowledgeable team. Vivek took his time selecting various styles and I didn't feel rushed at all. Found a great style and very happy with my prescription sunglasses. Highly recommend this optical shop!",
                author: "Cindy Cabral",
                role: "Google Local Guide"
              },
              {
                quote: "Horizon Optical is such a gem! The owner, Kamlesh, is incredibly knowledgeable and helpful—I found so many frames that I loved here. If you're in Brampton, I highly recommend you check them out :)",
                author: "Claire Sit",
                role: "Google Reviewer"
              },
              {
                quote: "Great service. Just got my Meta Oakley's from them. Insured. Vision Ready. Let's go 🚀✨⚡️",
                author: "Ahmed Rosanally",
                role: "Google Reviewer"
              }
            ].map((review, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <Card className="p-8 border-border bg-card shadow-sm h-full flex flex-col">
                  <Quote className="h-8 w-8 text-primary/20 mb-6" />
                  <p className="text-muted-foreground italic mb-6 flex-1 font-light leading-relaxed">
                    "{review.quote}"
                  </p>
                  <div className="flex items-center gap-3 border-t border-border pt-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {review.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-sm text-foreground">{review.author}</div>
                      <div className="text-xs text-muted-foreground">{review.role}</div>
                    </div>
                    <div className="flex gap-0.5 ml-auto text-amber-500">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star key={starIdx} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Find Us / Give Us Feedback Section */}
      <section id="find-us" className="py-24 px-4 bg-secondary/10 border-t border-border scroll-mt-28">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">Visit & Review</span>
            <h2 className="font-serif text-3xl font-bold sm:text-4xl mt-2 text-foreground">How to Find Us & Give Feedback</h2>
            <div className="flex justify-center mt-3"><div className="h-0.5 w-12 bg-primary rounded"></div></div>
            <p className="mt-4 text-base text-muted-foreground font-light max-w-xl mx-auto">
              We are located in Brampton's premier financial plaza. Drop by in-person, or let us know how your latest visit went.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: How to Find Us (Map & Details) - Span 7 */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-border bg-card p-6 shadow-sm overflow-hidden">
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">Our Location</h3>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">Boutique Address</span>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      <strong>Horizon Optical Boutique</strong><br />
                      7985 Financial Dr. Unit 2A<br />
                      Brampton, ON L6Y 5P5
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">Arrival Tips</span>
                    <p className="text-muted-foreground text-sm leading-relaxed font-light">
                      Located in the plaza at Financial Dr & Steeles Ave W. Ample <strong className="font-semibold">free plaza parking</strong> is available right outside our front door.
                    </p>
                  </div>
                </div>

                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border shadow-inner">
                  <iframe
                    src="https://maps.google.com/maps?q=7985%20Financial%20Dr.%20Unit%202A,%20Brampton,%20ON&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    title="Horizon Optical Boutique Location Map"
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <a
                      href="https://maps.app.goo.gl/Z3o2tpjHcz6iS1W1A"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <MapPin className="mr-2 h-4 w-4" /> Get Directions
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground">
                    <a href="tel:9054500044" className="inline-flex items-center">
                      <Phone className="mr-2 h-4 w-4" /> Call Boutique
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:text-emerald-400 dark:hover:text-black">
                    <a
                      href="https://wa.me/16479496342"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <WhatsAppIcon className="mr-2 h-4 w-4 text-emerald-500 fill-current shrink-0" /> WhatsApp Us
                    </a>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column: Give Us Feedback & Google Reviews - Span 5 */}
            <div className="lg:col-span-5 space-y-6">
              {/* Google Reviews rating summary card */}
              <Card className="border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Google Review Score</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xl font-bold text-primary">5.0</span>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">(100+ reviews)</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mt-4 font-light">
                  We are incredibly proud to maintain a 5-star rating on Google. Read what other clients say or share your own review to help us continue refining our boutique experience.
                </p>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full rounded-full border-amber-500/30 text-amber-600 hover:bg-amber-500 hover:text-white dark:text-amber-400 dark:hover:text-black">
                    <a
                      href="https://maps.app.goo.gl/Z3o2tpjHcz6iS1W1A"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center"
                    >
                      Write a Google Review
                    </a>
                  </Button>
                </div>
              </Card>

              {/* Direct Feedback Form */}
              <FeedbackForm />
            </div>
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
