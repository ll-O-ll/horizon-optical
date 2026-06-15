"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Sparkles, Save, Plus, Trash2, Loader2, Eye, Compass, Wrench } from "lucide-react"
import { getShowcaseData, saveShowcaseData } from "@/lib/showcase-actions"
import Image from "next/image"

const BRANDS = [
  "Emporio Armani",
  "Kate Spade",
  "Tory Burch",
  "Ray-Ban",
  "Vogue",
  "Coach",
  "Michael Kors",
  "Guess",
  "Tommy Hilfiger",
  "Polo Ralph Lauren",
  "Hugo",
  "Boss",
  "Versace",
  "Burberry",
  "Marc Jacobs",
  "DKNY",
  "Oakley Meta",
  "PRADA",
  "Timberland"
]

const FRAME_ASSETS = [
  { value: "/images/glasses-wayfarer.png", label: "Wayfarer (Classic Acetate)" },
  { value: "/images/glasses-aviator.png", label: "Aviator (Metal Wire)" },
  { value: "/images/glasses-clubmaster.png", label: "Clubmaster (Browline Tortoise)" }
]

interface GlassesModel {
  name: string;
  code: string;
  image: string;
  shape: string;
  material: string;
  fit: string;
}

interface BrandShowcaseDetails {
  bio: string;
  models: GlassesModel[];
}

export function ManageShowcaseTab() {
  const [catalog, setCatalog] = useState<Record<string, BrandShowcaseDetails>>({})
  const [selectedBrand, setSelectedBrand] = useState<string>("Ray-Ban")
  const [bio, setBio] = useState<string>("")
  const [models, setModels] = useState<GlassesModel[]>([])
  
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Form state for a new model
  const [newModelName, setNewModelName] = useState("")
  const [newModelCode, setNewModelCode] = useState("")
  const [newModelImage, setNewModelImage] = useState("/images/glasses-wayfarer.png")
  const [newModelShape, setNewModelShape] = useState("Square")
  const [newModelMaterial, setNewModelMaterial] = useState("Acetate")
  const [newModelFit, setNewModelFit] = useState("Oval, Round faces")

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true)
      const res = await getShowcaseData()
      if (res.success) {
        setCatalog(res.data)
      } else {
        toast.error("Failed to load designer catalog. Using default values.")
        setCatalog(res.data)
      }
      setIsLoading(false)
    }
    fetchCatalog()
  }, [])

  // Update form inputs when selected brand or catalog changes
  useEffect(() => {
    if (selectedBrand) {
      const brandData = catalog[selectedBrand] || {
        bio: `${selectedBrand} represents premium fashion craftsmanship. Their eyewear collection blends unique house styling elements with state-of-the-art durability.`,
        models: [
          { name: `Signature ${selectedBrand} Square`, code: `${selectedBrand.substring(0, 3).toUpperCase()}-7209`, image: "/images/glasses-wayfarer.png", shape: "Square", material: "Polished Acetate", fit: "Oval, Round faces" },
          { name: `Bespoke ${selectedBrand} Round`, code: `${selectedBrand.substring(0, 3).toUpperCase()}-4188`, image: "/images/glasses-clubmaster.png", shape: "Round", material: "Metal & Acetate", fit: "Square, Heart faces" }
        ]
      }
      setBio(brandData.bio)
      setModels([...brandData.models])
    }
  }, [selectedBrand, catalog])

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newModelName.trim() || !newModelCode.trim()) {
      toast.error("Please provide a name and model code.")
      return
    }

    const newModel: GlassesModel = {
      name: newModelName.trim(),
      code: newModelCode.trim().toUpperCase(),
      image: newModelImage,
      shape: newModelShape,
      material: newModelMaterial.trim(),
      fit: newModelFit.trim()
    }

    setModels([...models, newModel])
    
    // Clear add model form fields
    setNewModelName("")
    setNewModelCode("")
    toast.success(`Added ${newModel.name} to list. Remember to save changes!`)
  }

  const handleDeleteModel = (index: number) => {
    const updated = models.filter((_, idx) => idx !== index)
    setModels(updated)
    toast.success("Model removed from list. Remember to save changes!")
  }

  const handleUpdateModelField = (index: number, field: keyof GlassesModel, value: string) => {
    const updated = [...models]
    updated[index] = { ...updated[index], [field]: value }
    setModels(updated)
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    const toastId = toast.loading("Saving designer details...")

    // Update locally stored copy of current brand details
    const updatedCatalog = {
      ...catalog,
      [selectedBrand]: {
        bio,
        models
      }
    }
    setCatalog(updatedCatalog)

    const res = await saveShowcaseData(updatedCatalog)
    if (res.success) {
      toast.success("Designer details saved successfully!", { id: toastId })
    } else {
      toast.error(res.error || "Failed to save details.", { id: toastId })
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-[350px] flex items-center justify-center bg-card rounded-xl border border-border/80">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading designer catalog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Brand Select Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-serif">
                <Sparkles className="h-5 w-5 text-primary" />
                Designer Showcase Customizer
              </CardTitle>
              <CardDescription className="mt-1">
                Configure brand biographies and manage frame specifications for the customer storefront.
              </CardDescription>
            </div>
            <Button onClick={handleSaveAll} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/95 rounded-full px-6 gap-2 h-10 w-full md:w-auto shadow-sm">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-full sm:max-w-xs">
              <Label htmlFor="brand-selector" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Select Designer Brand</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand-selector" className="h-10 rounded-lg">
                  <SelectValue placeholder="Select brand..." />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Brand Bio & Add Model Form - Span 5 */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand Bio Card */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-serif">Brand Description</CardTitle>
              <CardDescription>The bio text displayed under the brand logo in the customer showcase details.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-2">
                <Label htmlFor="brand-bio" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio Text</Label>
                <Textarea
                  id="brand-bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={`Write a brief bio introducing ${selectedBrand}...`}
                  className="resize-none rounded-lg text-sm bg-background/50 border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Glasses Model Card */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-serif">Add New Model</CardTitle>
              <CardDescription>Append another model of glasses to the {selectedBrand} catalog list.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleAddModel} className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="model-name" className="text-xs font-semibold text-muted-foreground">Model Name</Label>
                  <Input
                    id="model-name"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="e.g. New Wayfarer"
                    required
                    className="rounded-lg h-9 bg-background/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="model-code" className="text-xs font-semibold text-muted-foreground">Model Code / ID</Label>
                  <Input
                    id="model-code"
                    value={newModelCode}
                    onChange={(e) => setNewModelCode(e.target.value)}
                    placeholder="e.g. RX5184"
                    required
                    className="rounded-lg h-9 bg-background/50 font-mono uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="model-image" className="text-xs font-semibold text-muted-foreground">Image Frame Asset</Label>
                  <Select value={newModelImage} onValueChange={setNewModelImage}>
                    <SelectTrigger id="model-image" className="rounded-lg h-9 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FRAME_ASSETS.map(asset => (
                        <SelectItem key={asset.value} value={asset.value}>{asset.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="model-shape" className="text-xs font-semibold text-muted-foreground">Frame Shape</Label>
                    <Input
                      id="model-shape"
                      value={newModelShape}
                      onChange={(e) => setNewModelShape(e.target.value)}
                      placeholder="e.g. Square"
                      className="rounded-lg h-9 bg-background/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="model-material" className="text-xs font-semibold text-muted-foreground">Frame Material</Label>
                    <Input
                      id="model-material"
                      value={newModelMaterial}
                      onChange={(e) => setNewModelMaterial(e.target.value)}
                      placeholder="e.g. Acetate"
                      className="rounded-lg h-9 bg-background/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="model-fit" className="text-xs font-semibold text-muted-foreground">Ideal Face Fit</Label>
                  <Input
                    id="model-fit"
                    value={newModelFit}
                    onChange={(e) => setNewModelFit(e.target.value)}
                    placeholder="e.g. Oval, Round faces"
                    className="rounded-lg h-9 bg-background/50"
                  />
                </div>
                <Button type="submit" className="w-full gap-2 rounded-full mt-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80 h-9 font-medium shadow-sm">
                  <Plus className="h-4 w-4" /> Add Model to List
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Models List - Span 7 */}
        <div className="lg:col-span-7">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-serif">Models Catalog ({models.length})</CardTitle>
              <CardDescription>Adjust current specifications or remove models for {selectedBrand}.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {models.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border/80 rounded-xl text-muted-foreground text-sm font-light bg-muted/5">
                  No glasses models defined for this brand. Fill in the "Add New Model" form to create one.
                </div>
              ) : (
                <div className="space-y-6">
                  {models.map((model, index) => (
                    <Card key={index} className="border border-border/60 p-5 relative overflow-hidden bg-background/30 rounded-xl group transition-all hover:border-primary/20 hover:bg-background/50">
                      {/* Delete absolute button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteModel(index)}
                        className="absolute top-3 right-3 p-1.5 rounded-full border border-destructive/10 text-destructive/80 bg-destructive/5 hover:bg-destructive hover:text-white transition-all cursor-pointer opacity-40 group-hover:opacity-100 shadow-sm"
                        title="Delete model"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="grid sm:grid-cols-[110px_1fr] gap-5 items-start">
                        {/* Image preview box */}
                        <div className="bg-white rounded-lg border border-border/40 p-2 flex items-center justify-center aspect-video sm:aspect-square w-full shadow-inner">
                          <Image
                            src={model.image}
                            alt={model.name}
                            width={90}
                            height={45}
                            className="object-contain"
                          />
                        </div>

                        {/* Edit spec inputs */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Model Name</Label>
                            <Input
                              value={model.name}
                              onChange={(e) => handleUpdateModelField(index, "name", e.target.value)}
                              className="h-8 text-xs rounded-md bg-background focus:ring-1 focus:ring-primary border-border"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Model Code</Label>
                            <Input
                              value={model.code}
                              onChange={(e) => handleUpdateModelField(index, "code", e.target.value)}
                              className="h-8 text-xs rounded-md bg-background font-mono uppercase focus:ring-1 focus:ring-primary border-border"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Frame Asset</Label>
                            <Select
                              value={model.image}
                              onValueChange={(val) => handleUpdateModelField(index, "image", val)}
                            >
                              <SelectTrigger className="h-8 text-xs rounded-md bg-background focus:ring-1 focus:ring-primary border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="text-xs">
                                {FRAME_ASSETS.map(asset => (
                                  <SelectItem key={asset.value} value={asset.value}>{asset.label.split(" ")[0]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Shape</Label>
                            <Input
                              value={model.shape}
                              onChange={(e) => handleUpdateModelField(index, "shape", e.target.value)}
                              className="h-8 text-xs rounded-md bg-background focus:ring-1 focus:ring-primary border-border"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Material</Label>
                            <Input
                              value={model.material}
                              onChange={(e) => handleUpdateModelField(index, "material", e.target.value)}
                              className="h-8 text-xs rounded-md bg-background focus:ring-1 focus:ring-primary border-border"
                            />
                          </div>

                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ideal Face Fit</Label>
                            <Input
                              value={model.fit}
                              onChange={(e) => handleUpdateModelField(index, "fit", e.target.value)}
                              className="h-8 text-xs rounded-md bg-background focus:ring-1 focus:ring-primary border-border"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
