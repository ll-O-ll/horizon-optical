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
  Target,
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
  Copy,
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
      case "recording": return <Video className="h-4 w-4 text-blue-400" />
      case "pointer": return <Target className="h-4 w-4 text-amber-400" />
      case "note": return <FileText className="h-4 w-4 text-emerald-400" />
      default: return null
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "recording": return "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
      case "pointer": return "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
      case "note": return "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
      default: return ""
    }
  }

  const getYouTubeThumbnail = (videoUrl: string) => {
    const match = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
  }

  const selectedClient = clients.find(c => c.email === selectedEmail)

  // Group resources by category
  const grouped = resources.reduce<Record<string, ClientResource[]>>((acc, r) => {
    const cat = r.category || "Uncategorized"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Client Selector + Actions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Client Resources
              </CardTitle>
              <CardDescription className="mt-1">
                Manage recordings, pointers, and notes for each client.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {selectedEmail && resources.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleNotifyClient}
                  disabled={isSendingNotification}
                  title="Send email notification to client about their latest resource"
                >
                  {isSendingNotification ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  Notify Client
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyPortalLink}>
                <Link2 className="h-4 w-4" />
                Copy Portal Link
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full sm:max-w-xs">
              <Select value={selectedEmail} onValueChange={setSelectedEmail}>
                <SelectTrigger id="client-select">
                  <SelectValue placeholder="Select a client..." />
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
              <AddResourceDialog
                clientEmail={selectedEmail}
                onResourceAdded={fetchResources}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      {!selectedEmail ? (
        <div className="min-h-[300px] flex items-center justify-center border rounded-lg bg-card/50 border-dashed">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Select a client to manage their resources</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="min-h-[300px] flex items-center justify-center border rounded-lg bg-card/50 border-dashed">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground mb-1">No resources yet for {selectedClient?.name || selectedEmail}</p>
            <p className="text-sm text-muted-foreground/60">Click "Add Resource" to get started</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Video className="h-4 w-4" />
                <span className="text-xs font-medium">Recordings</span>
              </div>
              <div className="text-2xl font-bold">{resources.filter(r => r.type === "recording").length}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs font-medium">Pointers</span>
              </div>
              <div className="text-2xl font-bold">{resources.filter(r => r.type === "pointer").length}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">Notes</span>
              </div>
              <div className="text-2xl font-bold">{resources.filter(r => r.type === "note").length}</div>
            </Card>
          </div>

          {/* Resource Cards */}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((resource, index) => {
                  const globalIndex = resources.indexOf(resource)
                  const thumbnail = resource.type === "recording" && resource.url
                    ? getYouTubeThumbnail(resource.url)
                    : null

                  return (
                    <Card
                      key={resource.id}
                      className={`p-4 transition-all hover:border-primary/30 ${resource.is_pinned ? "border-primary/40 bg-primary/5" : ""}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Thumbnail or Type Icon */}
                        {thumbnail ? (
                          <div className="hidden sm:block w-24 h-16 rounded-md overflow-hidden flex-shrink-0 border border-border">
                            <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="hidden sm:flex w-10 h-10 rounded-lg bg-muted items-center justify-center flex-shrink-0">
                            {getTypeIcon(resource.type)}
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {resource.is_pinned && (
                              <Pin className="h-3 w-3 text-primary flex-shrink-0" />
                            )}
                            <span className="font-semibold text-sm truncate">{resource.title}</span>
                            <Badge variant="secondary" className={`text-xs ${getTypeBadgeColor(resource.type)}`}>
                              {resource.type}
                            </Badge>
                          </div>
                          {resource.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{resource.description}</p>
                          )}
                          {resource.type === "recording" && resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Open link
                            </a>
                          )}
                          {(resource.type === "pointer" || resource.type === "note") && resource.content && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{resource.content}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveUp(globalIndex)} disabled={globalIndex === 0}>
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveDown(globalIndex)} disabled={globalIndex === resources.length - 1}>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingResource(resource)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePin(resource.id, resource.is_pinned)}>
                                {resource.is_pinned ? (
                                  <><PinOff className="mr-2 h-4 w-4" /> Unpin</>
                                ) : (
                                  <><Pin className="mr-2 h-4 w-4" /> Pin to Top</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(resource.id)} className="text-destructive">
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
