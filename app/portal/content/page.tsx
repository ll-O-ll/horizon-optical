"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Video,
  Target,
  FileText,
  Pin,
  ExternalLink,
  LogOut,
  ChevronDown,
  Play,
  Sparkles,
  Dumbbell,
  Shield,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getPortalSession, logoutPortal } from "@/app/actions/portal-actions"
import { getResourcesForClient, type ClientResource } from "@/app/actions/resource-actions"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function PortalContentPage() {
  const router = useRouter()
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [resources, setResources] = useState<ClientResource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadData = async () => {
      const session = await getPortalSession()
      if (!session.authenticated || !session.email) {
        router.push("/portal")
        return
      }

      setClientName(session.clientName || "")
      setClientEmail(session.email)

      const res = await getResourcesForClient(session.email)
      if (res.success) {
        setResources(res.resources)

        // Auto-open all categories
        const cats: Record<string, boolean> = {}
        res.resources.forEach((r) => {
          const cat = r.category || "General"
          cats[cat] = true
        })
        setOpenCategories(cats)
      }
      setIsLoading(false)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    await logoutPortal()
    router.push("/portal")
  }

  // Helpers
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "recording": return <Video className="h-4 w-4" />
      case "pointer": return <Target className="h-4 w-4" />
      case "note": return <FileText className="h-4 w-4" />
      default: return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "recording": return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" }
      case "pointer": return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" }
      case "note": return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" }
      default: return { bg: "", text: "", border: "" }
    }
  }

  // Split pinned vs regular
  const pinnedResources = resources.filter((r) => r.is_pinned)
  const regularResources = resources.filter((r) => !r.is_pinned)

  // Group regular by category
  const grouped = regularResources.reduce<Record<string, ClientResource[]>>((acc, r) => {
    const cat = r.category || "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    )
  }

  // Resource card renderer
  const ResourceCard = ({ resource, index }: { resource: ClientResource; index: number }) => {
    const colors = getTypeColor(resource.type)
    const [showEmbed, setShowEmbed] = useState(false)
    const embedUrl = resource.type === "recording" && resource.url ? getYouTubeEmbedUrl(resource.url) : null
    const thumbnail = resource.type === "recording" && resource.url ? getYouTubeThumbnail(resource.url) : null

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <Card className={`overflow-hidden border-border hover:border-primary/30 transition-all duration-300 ${resource.is_pinned ? "ring-1 ring-primary/30" : ""}`}>
          {/* Video Embed or Thumbnail */}
          {resource.type === "recording" && embedUrl && (
            <div className="relative">
              {showEmbed ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src={`${embedUrl}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={resource.title}
                  />
                </div>
              ) : thumbnail ? (
                <button
                  onClick={() => setShowEmbed(true)}
                  className="relative w-full aspect-video bg-black group cursor-pointer"
                >
                  <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 text-white ml-1" />
                    </div>
                  </div>
                </button>
              ) : null}
            </div>
          )}

          <CardContent className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {resource.is_pinned && <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                  <h3 className="font-semibold text-foreground truncate">{resource.title}</h3>
                </div>
                {resource.description && (
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                )}
              </div>
              <Badge variant="secondary" className={`flex-shrink-0 gap-1 ${colors.bg} ${colors.text}`}>
                {getTypeIcon(resource.type)}
                <span className="capitalize text-xs">
                  {resource.type === "note" ? "Prescription" : resource.type === "pointer" ? "Care Advice" : "Video"}
                </span>
              </Badge>
            </div>

            {/* Content for pointers/notes */}
            {(resource.type === "pointer" || resource.type === "note") && resource.content && (
              <div className={`rounded-lg p-4 ${colors.bg} border ${colors.border}`}>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{resource.content}</p>
              </div>
            )}

            {/* Link for non-YouTube recordings */}
            {resource.type === "recording" && resource.url && !embedUrl && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-1"
              >
                <ExternalLink className="h-4 w-4" />
                Open Recording
              </a>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">{clientEmail}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Header */}
        <motion.div {...fadeInUp} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-light">Welcome back,</p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">{clientName}</h1>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 max-w-lg font-light text-sm">
            Your personalized vision records, optometry reports, and tailored frames advice are detailed below.
          </p>
        </motion.div>

        {/* Stats Bar */}
        {resources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 text-sm"
          >
            <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4 text-center">
              <Video className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{resources.filter((r) => r.type === "recording").length}</div>
              <div className="text-xs text-muted-foreground font-light">Video Consults</div>
            </div>
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4 text-center">
              <Target className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{resources.filter((r) => r.type === "pointer").length}</div>
              <div className="text-xs text-muted-foreground font-light">Care Tips</div>
            </div>
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4 text-center">
              <FileText className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{resources.filter((r) => r.type === "note").length}</div>
              <div className="text-xs text-muted-foreground font-light">Prescriptions</div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {resources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="min-h-[400px] flex items-center justify-center font-sans"
          >
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-primary/40" />
              </div>
              <h2 className="text-xl font-serif font-bold mb-2">No Records Available</h2>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                We haven't uploaded any eye doctor prescriptions or custom frame orders for your account yet. They will appear here after your first consultation.
              </p>
              <Button asChild variant="outline" className="mt-6 rounded-full border-primary/20 hover:bg-primary hover:text-white">
                <Link href="/booking">Book Consultation</Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Pinned Resources */}
        {pinnedResources.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Pin className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Pinned
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {pinnedResources.map((resource, index) => (
                <ResourceCard key={resource.id} resource={resource} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Categorized Resources */}
        {Object.entries(grouped).map(([category, items], catIndex) => (
          <div key={category} className="mb-8">
            <Collapsible open={openCategories[category]} onOpenChange={() => toggleCategory(category)}>
              <CollapsibleTrigger className="flex items-center justify-between w-full group mb-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                  {category}
                  <span className="ml-2 text-xs text-muted-foreground/50">({items.length})</span>
                </h2>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openCategories[category] ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((resource, index) => (
                    <ResourceCard key={resource.id} resource={resource} index={index} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground font-light">
            © {new Date().getFullYear()} Horizon Optical Boutique
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <Link href="/booking" className="text-xs text-primary hover:underline">Book Appointment</Link>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
