"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Video,
  BookOpen,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Pin,
  PinOff,
  ExternalLink,
  Users,
  ChevronUp,
  ChevronDown,
  Link2,
  Bell,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  getClientList,
  getResourcesForClient,
  deleteResource,
  toggleResourcePin,
  reorderResources,
  sendResourceNotification,
  type ClientResource,
} from "@/app/actions/resource-actions"
import { AddResourceDialog } from "./add-resource-dialog"
import { EditResourceDialog } from "./edit-resource-dialog"

export function ManageResourcesTab() {
  const [clients, setClients] = useState<{ email: string; name: string }[]>([])
  const [selectedEmail, setSelectedEmail] = useState<string>("")
  const [resources, setResources] = useState<ClientResource[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [editingResource, setEditingResource] = useState<ClientResource | null>(null)

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      const res = await getClientList()
      if (res.success) {
        setClients(res.clients)
      }
    }
    fetchClients()
  }, [])

  // Fetch resources when client changes
  useEffect(() => {
    if (selectedEmail) {
      fetchResources()
    } else {
      setResources([])
    }
  }, [selectedEmail])

  const fetchResources = async () => {
    if (!selectedEmail) return
    setIsLoading(true)
    const res = await getResourcesForClient(selectedEmail)
    if (res.success) {
      setResources(res.resources)
    } else {
      toast.error("Failed to load resources")
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource? This cannot be undone.")) return
    const toastId = toast.loading("Deleting...")
    const res = await deleteResource(id)
    if (res.success) {
      toast.success("Resource deleted", { id: toastId })
      fetchResources()
    } else {
      toast.error("Failed to delete", { id: toastId })
    }
  }

  const handleTogglePin = async (id: string, currentlyPinned: boolean) => {
    const toastId = toast.loading(currentlyPinned ? "Unpinning..." : "Pinning...")
    const res = await toggleResourcePin(id, !currentlyPinned)
    if (res.success) {
      toast.success(currentlyPinned ? "Unpinned" : "Pinned to top", { id: toastId })
      fetchResources()
    } else {
      toast.error("Failed to update", { id: toastId })
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const newResources = [...resources]
    const [item] = newResources.splice(index, 1)
    newResources.splice(index - 1, 0, item)

    const updates = newResources.map((r, i) => ({ id: r.id, order_index: i }))
    setResources(newResources)
    await reorderResources(updates)
  }

  const handleMoveDown = async (index: number) => {
    if (index === resources.length - 1) return
    const newResources = [...resources]
    const [item] = newResources.splice(index, 1)
    newResources.splice(index + 1, 0, item)

    const updates = newResources.map((r, i) => ({ id: r.id, order_index: i }))
    setResources(newResources)
    await reorderResources(updates)
  }

  const handleCopyPortalLink = () => {
    const portalUrl = `${window.location.origin}/portal`
    navigator.clipboard.writeText(portalUrl)
    toast.success("Portal link copied to clipboard")
  }

  const handleNotifyClient = async () => {
    if (!selectedEmail || resources.length === 0) return
    setIsSendingNotification(true)
    const toastId = toast.loading("Sending notification...")
    
    // Group all resources added around the same time as the most recent one (within 24h of the latest resource)
    const sorted = [...resources].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const latestDate = new Date(sorted[0].created_at).getTime()
    const recent = sorted.filter(r => (latestDate - new Date(r.created_at).getTime()) < 24 * 60 * 60 * 1000)

    const payload = recent.map(r => ({ 
      title: r.title, 
      type: r.type as "recording" | "pointer" | "note",
      url: r.url,
      content: r.content
    }))

    const res = await sendResourceNotification(selectedEmail, payload)
    if (res.success) {
      toast.success("Client notified by email", { id: toastId })
    } else {
      toast.error("Failed to send notification", { id: toastId })
    }
    setIsSendingNotification(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "recording": return <Video className="h-4 w-4 text-blue-500" />
      case "pointer": return <BookOpen className="h-4 w-4 text-amber-500" />
      case "note": return <FileText className="h-4 w-4 text-emerald-500" />
      default: return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "recording":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            Video Guide
          </Badge>
        )
      case "pointer":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            Care Guideline
          </Badge>
        )
      case "note":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
            Clinical Note
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold">
            {type}
          </Badge>
        )
    }
  }

  const getYouTubeThumbnail = (videoUrl: string) => {
    const match = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
  }

  const selectedClient = clients.find(c => c.email === selectedEmail)

  // Group resources by category
  const grouped = resources.reduce<Record<string, ClientResource[]>>((acc, r) => {
    const cat = r.category || "General Materials"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Client Selector + Actions */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-serif">
                <Users className="h-5 w-5 text-primary" />
                Patient Resources
              </CardTitle>
              <CardDescription className="mt-1">
                Distribute and organize instructional video guides, hygiene recommendations, and clinical notes for patient portals.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
              {selectedEmail && resources.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full border-border/80 h-9 font-medium shadow-sm flex-1 md:flex-none justify-center"
                  onClick={handleNotifyClient}
                  disabled={isSendingNotification}
                  title="Send email notification to client about their latest resource"
                >
                  {isSendingNotification ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  Notify Patient
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2 rounded-full border-border/80 h-9 font-medium shadow-sm flex-1 md:flex-none justify-center" onClick={handleCopyPortalLink}>
                <Link2 className="h-4 w-4" />
                Portal Link
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full sm:max-w-xs">
              <Label htmlFor="client-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Select Clinic Patient</Label>
              <Select value={selectedEmail} onValueChange={setSelectedEmail}>
                <SelectTrigger id="client-select" className="h-10 rounded-lg">
                  <SelectValue placeholder="Search/select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.email} value={client.email}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedEmail && (
              <div className="pt-6 sm:pt-0">
                <AddResourceDialog
                  clientEmail={selectedEmail}
                  onResourceAdded={fetchResources}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      {!selectedEmail ? (
        <div className="min-h-[300px] flex items-center justify-center border border-dashed rounded-xl bg-muted/5 border-border/80">
          <div className="text-center p-6">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-1">No Patient Selected</h4>
            <p className="text-sm text-muted-foreground max-w-sm">Choose a patient from the list above to curate their prescription notes, training videos, and care instructions.</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="min-h-[250px] flex items-center justify-center bg-card rounded-xl border border-border/60 shadow-sm">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Loading patient guides...</p>
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="min-h-[300px] flex items-center justify-center border border-dashed rounded-xl bg-muted/5 border-border/80">
          <div className="text-center p-6">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-1">No Materials Created</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">No clinical files or guides have been shared with {selectedClient?.name || selectedEmail} yet.</p>
            <AddResourceDialog
              clientEmail={selectedEmail}
              onResourceAdded={fetchResources}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats count panel */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 shadow-sm border border-border/60 bg-gradient-to-br from-blue-500/5 to-transparent relative overflow-hidden">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Video className="h-4 w-4" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Video Guides</span>
              </div>
              <div className="text-2xl font-extrabold text-foreground">{resources.filter(r => r.type === "recording").length}</div>
            </Card>
            <Card className="p-4 shadow-sm border border-border/60 bg-gradient-to-br from-amber-500/5 to-transparent relative overflow-hidden">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Guidelines</span>
              </div>
              <div className="text-2xl font-extrabold text-foreground">{resources.filter(r => r.type === "pointer").length}</div>
            </Card>
            <Card className="p-4 shadow-sm border border-border/60 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Prescriptions</span>
              </div>
              <div className="text-2xl font-extrabold text-foreground">{resources.filter(r => r.type === "note").length}</div>
            </Card>
          </div>

          {/* Resource Cards by category */}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest pl-2.5 border-l-2 border-primary/50 py-0.5">
                {category}
              </h3>
              <div className="space-y-3">
                {items.map((resource, index) => {
                  const globalIndex = resources.indexOf(resource)
                  const thumbnail = resource.type === "recording" && resource.url
                    ? getYouTubeThumbnail(resource.url)
                    : null

                  return (
                    <Card
                      key={resource.id}
                      className={`p-4 transition-all hover:border-primary/20 ${resource.is_pinned ? "border-primary/30 bg-primary/[0.02] shadow-inner" : "border-border/60 bg-card shadow-sm"}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Thumbnail or Type Icon Box */}
                        {thumbnail ? (
                          <div className="hidden sm:block w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border shadow-sm">
                            <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="hidden sm:flex w-12 h-12 rounded-xl bg-muted/60 items-center justify-center flex-shrink-0 border border-border/40">
                            {getTypeIcon(resource.type)}
                          </div>
                        )}

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {resource.is_pinned && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-1.5 py-0 rounded flex items-center gap-1 text-[9px] font-bold">
                                <Pin className="h-2.5 w-2.5 fill-primary" />
                                Pinned
                              </Badge>
                            )}
                            <span className="font-semibold text-sm text-foreground tracking-tight truncate">{resource.title}</span>
                            {getTypeBadge(resource.type)}
                          </div>
                          {resource.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{resource.description}</p>
                          )}
                          {resource.type === "recording" && resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1.5 mt-1 font-medium bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Open Video Link
                            </a>
                          )}
                          {(resource.type === "pointer" || resource.type === "note") && resource.content && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 bg-muted/20 p-2 rounded-lg border border-border/30 whitespace-pre-wrap">{resource.content}</p>
                          )}
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full" onClick={() => handleMoveUp(globalIndex)} disabled={globalIndex === 0}>
                            <ChevronUp className="h-4 w-4 text-muted-foreground/80" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full" onClick={() => handleMoveDown(globalIndex)} disabled={globalIndex === resources.length - 1}>
                            <ChevronDown className="h-4 w-4 text-muted-foreground/80" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => setEditingResource(resource)} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                Edit Guide
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePin(resource.id, resource.is_pinned)} className="cursor-pointer">
                                {resource.is_pinned ? (
                                  <><PinOff className="mr-2 h-4 w-4 text-muted-foreground" /> Unpin</>
                                ) : (
                                  <><Pin className="mr-2 h-4 w-4 text-primary fill-primary" /> Pin to Top</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(resource.id)} className="text-destructive cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <EditResourceDialog
        resource={editingResource}
        open={!!editingResource}
        onOpenChange={(open) => !open && setEditingResource(null)}
        onResourceUpdated={fetchResources}
      />
    </div>
  )
}
