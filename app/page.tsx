"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, Star, Quote, Eye, Sparkles, ShieldCheck, MapPin, Phone, Mail, Clock, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
}

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                <Link href="#philosophy" className="text-sm font-medium transition-colors tracking-wide text-muted-foreground hover:text-primary">
                  Philosophy
                </Link>
                <Link href="#services" className="text-sm font-medium transition-colors tracking-wide text-muted-foreground hover:text-primary">
                  Services
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
        </div>

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
                  href="#philosophy"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Philosophy
                </Link>
                <Link
                  href="#services"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Services
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden px-4">
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
              ) }
            ].map((brand, index) => (
              <div key={index} className="flex h-16 items-center justify-center rounded-xl bg-card border border-border/40 p-3 transition-all duration-300 hover:border-primary/40 hover:shadow-sm hover:shadow-accent/5 hover:scale-105 select-none text-foreground/75 hover:text-foreground">
                {brand.element}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-32 bg-secondary/30 px-4 border-y border-border">
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

      {/* Services Section */}
      <section id="services" className="py-24 px-4 bg-background">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="mb-20 text-center">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">Clinical & Design Services</h2>
            <div className="flex justify-center mt-4"><div className="h-0.5 w-12 bg-primary rounded"></div></div>
            <p className="mt-4 text-lg text-muted-foreground font-light">Experience comprehensive care and tailored styles under one roof.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Eye Exam */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="p-8 border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col shadow-sm">
                <div className="mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-2">Comprehensive Eye Exam</h3>
                  <div className="text-3xl font-bold text-primary">$125</div>
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

            {/* Frame Styling */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="p-8 border-primary bg-card shadow-lg shadow-accent/5 relative h-full flex flex-col">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-medium tracking-wide">
                  RECOMMENDED
                </div>
                <div className="mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-2">Bespoke Frame Styling</h3>
                  <div className="text-3xl font-bold text-primary">Complimentary</div>
                  <p className="mt-4 text-muted-foreground">1-on-1 styling consultation with our certified optical stylists. Find frames that perfectly complement your face shape and aesthetic.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Personalized style & shape consultation</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Access to limited edition boutique designers</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Included with any frame purchase</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                  <Link href="/booking?type=styling">Schedule Session</Link>
                </Button>
              </Card>
            </motion.div>

            {/* Contact Lens */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="p-8 border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col shadow-sm">
                <div className="mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-2">Contact Lens Fitting</h3>
                  <div className="text-3xl font-bold text-primary">$90</div>
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
                  <Link href="/booking?type=lens">Book Assessment</Link>
                </Button>
              </Card>
            </motion.div>

            {/* Adjustments */}
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
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
      <section className="py-24 px-4 bg-background">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">Client Stories</h2>
            <div className="flex justify-center mt-4"><div className="h-0.5 w-12 bg-primary rounded"></div></div>
            <p className="mt-4 text-lg text-muted-foreground font-light">What our patients and fashion clients say.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "The frame styling consultation was a absolute revelation. I found custom tortoiseshell frames that perfectly frame my features. I've received so many compliments!",
                author: "Eleanor Vance",
                role: "Creative Director"
              },
              {
                quote: "Dr. Chen did the most comprehensive eye exam I've ever experienced. He explained the ocular scan details clearly and adjusted my script perfectly. High-tech and caring.",
                author: "Marcus Sterling",
                role: "Software Architect"
              },
              {
                quote: "They adjusted and cleaned my grandfather's vintage titanium glasses for free, and with so much respect. Their store layout is stunningly beautiful. Highly recommend.",
                author: "Sofia Al-Jamil",
                role: "Local Business Owner"
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

      {/* Info / Contact Section */}
      <section className="py-20 px-4 bg-secondary/10 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg font-bold">Location</h4>
              <p className="text-muted-foreground text-sm font-light">
                7985 Financial Dr. Unit 2A<br />
                Brampton, ON
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg font-bold">Store Hours</h4>
              <p className="text-muted-foreground text-sm font-light">
                Mon - Fri: 10:30 AM - 7:00 PM<br />
                Saturday: 10:00 AM - 5:00 PM<br />
                Sunday: Closed
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg font-bold">Contact</h4>
              <p className="text-muted-foreground text-sm font-light flex flex-col">
                <a href="tel:9054500044" className="hover:text-primary transition-colors">Landline: 905-450-0044</a>
                <a href="tel:9056016342" className="hover:text-primary transition-colors">Mobile: 905-601-6342</a>
                <a href="mailto:info@horizonoptical.ca" className="hover:text-primary transition-colors">info@horizonoptical.ca</a>
              </p>
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
          <div className="flex gap-8">
            <Link href="https://www.instagram.com/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <span className="text-xs">Instagram</span>
            </Link>
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
