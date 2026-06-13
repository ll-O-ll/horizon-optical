"use client"

import { useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Video, Target, FileText } from "lucide-react"
import { createResource } from "@/app/actions/resource-actions"
import { toast } from "sonner"

interface AddResourceDialogProps {
  clientEmail: string
  onResourceAdded: () => void
}

export function AddResourceDialog({ clientEmail, onResourceAdded }: AddResourceDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState<"recording" | "pointer" | "note">("pointer")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [isPinned, setIsPinned] = useState(false)

  const resetForm = () => {
    setType("pointer")
    setTitle("")
    setDescription("")
    setUrl("")
    setContent("")
    setCategory("")
    setIsPinned(false)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    if (type === "recording" && !url.trim()) {
      toast.error("URL is required for recordings")
      return
    }

    if ((type === "pointer" || type === "note") && !content.trim()) {
      toast.error("Content is required for pointers and notes")
      return
    }

    setIsLoading(true)
    const result = await createResource({
      clientEmail,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      url: url.trim() || undefined,
      content: content.trim() || undefined,
      category: category.trim() || undefined,
      isPinned,
    })

    if (result.success) {
      toast.success("Resource added successfully")
      resetForm()
      setOpen(false)
      onResourceAdded()
    } else {
      toast.error("Failed to add resource")
    }
    setIsLoading(false)
  }

  const getTypeIcon = (t: string) => {
    switch (t) {
      case "recording": return <Video className="h-4 w-4" />
      case "pointer": return <Target className="h-4 w-4" />
      case "note": return <FileText className="h-4 w-4" />
      default: return null
    }
  }

  // Detect YouTube thumbnail
  const getYouTubeThumbnail = (videoUrl: string) => {
    const match = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
  }

  const thumbnail = type === "recording" && url ? getYouTubeThumbnail(url) : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
          <DialogDescription>
            Add a recording, pointer, or note for your client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Type Selector */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["recording", "pointer", "note"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    type === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {getTypeIcon(t)}
                  <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="resource-title">Title</Label>
            <Input
              id="resource-title"
              placeholder={type === "recording" ? "e.g. Hip Flexor Routine" : type === "pointer" ? "e.g. Keep shoulders packed" : "e.g. Session Notes — Apr 9"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="resource-desc">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="resource-desc"
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* URL — for recordings */}
          {type === "recording" && (
            <div className="space-y-2">
              <Label htmlFor="resource-url">Video URL</Label>
              <Input
                id="resource-url"
                placeholder="https://youtube.com/watch?v=... or Google Drive link"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {thumbnail && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                  <img src={thumbnail} alt="Video thumbnail" className="w-full h-auto" />
                </div>
              )}
            </div>
          )}

          {/* Content — for pointers/notes */}
          {(type === "pointer" || type === "note") && (
            <div className="space-y-2">
              <Label htmlFor="resource-content">Content</Label>
              <Textarea
                id="resource-content"
                placeholder={type === "pointer" ? "e.g. Focus on keeping your ribs down during overhead press. Think about pulling your belt buckle to your chin." : "Write session notes, homework, or detailed guidance..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={type === "note" ? 6 : 3}
              />
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="resource-category">Category <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="resource-category"
              placeholder="e.g. Mobility, Strength, Recovery"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Pinned */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="resource-pinned" className="text-sm font-medium">Pin to top</Label>
              <p className="text-xs text-muted-foreground">Pinned items appear first in the client portal</p>
            </div>
            <Switch
              id="resource-pinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
