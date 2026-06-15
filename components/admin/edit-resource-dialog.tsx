"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Video, BookOpen, FileText } from "lucide-react"
import { updateResource, type ClientResource } from "@/app/actions/resource-actions"
import { toast } from "sonner"

interface EditResourceDialogProps {
  resource: ClientResource | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onResourceUpdated: () => void
}

export function EditResourceDialog({ resource, open, onOpenChange, onResourceUpdated }: EditResourceDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<"recording" | "pointer" | "note">("pointer")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [isPinned, setIsPinned] = useState(false)

  useEffect(() => {
    if (resource) {
      setType(resource.type)
      setTitle(resource.title)
      setDescription(resource.description || "")
      setUrl(resource.url || "")
      setContent(resource.content || "")
      setCategory(resource.category || "")
      setIsPinned(resource.is_pinned)
    }
  }, [resource])

  const handleSubmit = async () => {
    if (!resource) return

    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    if (type === "recording" && !url.trim()) {
      toast.error("Video URL is required")
      return
    }

    if ((type === "pointer" || type === "note") && !content.trim()) {
      toast.error("Content is required")
      return
    }

    setIsLoading(true)
    const result = await updateResource(resource.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      url: url.trim() || undefined,
      content: content.trim() || undefined,
      category: category.trim() || undefined,
      isPinned,
    })

    if (result.success) {
      toast.success("Resource updated")
      onOpenChange(false)
      onResourceUpdated()
    } else {
      toast.error("Failed to update resource")
    }
    setIsLoading(false)
  }

  const getTypeIcon = (t: string) => {
    switch (t) {
      case "recording": return <Video className="h-4 w-4" />
      case "pointer": return <BookOpen className="h-4 w-4" />
      case "note": return <FileText className="h-4 w-4" />
      default: return null
    }
  }

  const getTypeLabel = (t: string) => {
    switch (t) {
      case "recording": return "Video Guide"
      case "pointer": return "Care Guideline"
      case "note": return "Clinical Note"
      default: return t
    }
  }

  const getYouTubeThumbnail = (videoUrl: string) => {
    const match = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
  }

  const thumbnail = type === "recording" && url ? getYouTubeThumbnail(url) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-foreground">Edit Patient Resource</DialogTitle>
          <DialogDescription>
            Update this guide, prescription note, or reference material for your patient.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resource Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["recording", "pointer", "note"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    type === t
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {getTypeIcon(t)}
                  <span>{getTypeLabel(t)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-resource-title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</Label>
            <Input
              id="edit-resource-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg h-9 bg-background/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-resource-desc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description <span className="text-muted-foreground/60 font-normal lowercase">(optional)</span></Label>
            <Input
              id="edit-resource-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg h-9 bg-background/50"
            />
          </div>

          {/* URL — for recordings */}
          {type === "recording" && (
            <div className="space-y-2">
              <Label htmlFor="edit-resource-url" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Video URL</Label>
              <Input
                id="edit-resource-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="rounded-lg h-9 bg-background/50"
              />
              {thumbnail && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border shadow-sm">
                  <img src={thumbnail} alt="Video thumbnail preview" className="w-full h-auto" />
                </div>
              )}
            </div>
          )}

          {/* Content — for pointers/notes */}
          {(type === "pointer" || type === "note") && (
            <div className="space-y-2">
              <Label htmlFor="edit-resource-content" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content Details</Label>
              <Textarea
                id="edit-resource-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={type === "note" ? 5 : 3}
                className="rounded-lg bg-background/50"
              />
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-resource-category" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category <span className="text-muted-foreground/60 font-normal lowercase">(optional)</span></Label>
            <Input
              id="edit-resource-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg h-9 bg-background/50"
            />
          </div>

          {/* Pinned */}
          <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/20">
            <div>
              <Label htmlFor="edit-resource-pinned" className="text-xs font-bold text-foreground">Pin to top</Label>
              <p className="text-[10px] text-muted-foreground">Pinned items appear first at the top of the patient's portal</p>
            </div>
            <Switch
              id="edit-resource-pinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="rounded-full h-9 px-4">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="rounded-full h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/95">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
