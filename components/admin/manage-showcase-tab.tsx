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
import { Sparkles, Save, Plus, Trash2, Loader2 } from "lucide-react"
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
  "Oakley Meta"
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
      <div className="min-h-[350px] flex items-center justify-center bg-card rounded-xl border">
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
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Designer Showcase Customizer
          </CardTitle>
          <CardDescription>
            Select any designer brand to manage their brand bio, models, shapes, and specifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="w-full sm:max-w-xs">
              <Label htmlFor="brand-selector" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Select Designer Brand</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand-selector">
                  <SelectValue placeholder="Select brand..." />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveAll} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Brand Bio & Add Model Form - Span 5 */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand Bio Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Brand Description</CardTitle>
              <CardDescription>The bio displayed under the brand logo in the customer showcase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-bio">Bio Text</Label>
                <Textarea
                  id="brand-bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={`Write a brief bio introducing ${selectedBrand}...`}
                  className="resize-none rounded-lg text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Glasses Model Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Add New Model</CardTitle>
              <CardDescription>Add another model of glasses to the {selectedBrand} catalog list.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddModel} className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="model-name">Model Name</Label>
                  <Input
                    id="model-name"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="e.g. New Wayfarer"
                    required
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="model-code">Model Code / ID</Label>
                  <Input
                    id="model-code"
                    value={newModelCode}
                    onChange={(e) => setNewModelCode(e.target.value)}
                    placeholder="e.g. RX5184"
                    required
                    className="rounded-lg font-mono uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="model-image">Image Frame Asset</Label>
                  <Select value={newModelImage} onValueChange={setNewModelImage}>
                    <SelectTrigger id="model-image" className="rounded-lg">
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
                    <Label htmlFor="model-shape">Frame Shape</Label>
                    <Input
                      id="model-shape"
                      value={newModelShape}
                      onChange={(e) => setNewModelShape(e.target.value)}
                      placeholder="e.g. Square"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="model-material">Frame Material</Label>
                    <Input
                      id="model-material"
                      value={newModelMaterial}
                      onChange={(e) => setNewModelMaterial(e.target.value)}
                      placeholder="e.g. Acetate"
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="model-fit">Ideal Face Fit</Label>
                  <Input
                    id="model-fit"
                    value={newModelFit}
                    onChange={(e) => setNewModelFit(e.target.value)}
                    placeholder="e.g. Oval, Round faces"
                    className="rounded-lg"
                  />
                </div>
                <Button type="submit" className="w-full gap-2 rounded-full mt-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border">
                  <Plus className="h-4 w-4" /> Add Model to List
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Models List - Span 7 */}
        <div className="lg:col-span-7">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Models Catalog ({models.length})</CardTitle>
              <CardDescription>Adjust current specifications or remove models for {selectedBrand}.</CardDescription>
            </CardHeader>
            <CardContent>
              {models.length === 0 ? (
                <div className="py-12 text-center border border-dashed rounded-xl text-muted-foreground text-sm font-light">
                  No glasses models defined for this brand. Fill in the "Add New Model" form to create one.
                </div>
              ) : (
                <div className="space-y-6">
                  {models.map((model, index) => (
                    <Card key={index} className="border border-border/40 p-4 relative overflow-hidden bg-background/30 rounded-xl group">
                      <button
                        type="button"
                        onClick={() => handleDeleteModel(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-full border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                        title="Delete model"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="grid sm:grid-cols-[100px_1fr] gap-4 items-start text-xs">
                        {/* Image view */}
                        <div className="bg-white rounded-lg border border-border/10 p-1 flex items-center justify-center aspect-video sm:aspect-square w-full">
                          <Image
                            src={model.image}
                            alt={model.name}
                            width={80}
                            height={40}
                            className="object-contain"
                          />
                        </div>

                        {/* Edit specs fields */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px] text-muted-foreground">Model Name</Label>
                            <Input
                              value={model.name}
                              onChange={(e) => handleUpdateModelField(index, "name", e.target.value)}
                              className="h-8 text-xs rounded-md"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Model Code</Label>
                            <Input
                              value={model.code}
                              onChange={(e) => handleUpdateModelField(index, "code", e.target.value)}
                              className="h-8 text-xs rounded-md font-mono uppercase"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Frame Asset</Label>
                            <Select
                              value={model.image}
                              onValueChange={(val) => handleUpdateModelField(index, "image", val)}
                            >
                              <SelectTrigger className="h-8 text-xs rounded-md">
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
                            <Label className="text-[10px] text-muted-foreground">Shape</Label>
                            <Input
                              value={model.shape}
                              onChange={(e) => handleUpdateModelField(index, "shape", e.target.value)}
                              className="h-8 text-xs rounded-md"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Material</Label>
                            <Input
                              value={model.material}
                              onChange={(e) => handleUpdateModelField(index, "material", e.target.value)}
                              className="h-8 text-xs rounded-md"
                            />
                          </div>

                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px] text-muted-foreground">Face Fit</Label>
                            <Input
                              value={model.fit}
                              onChange={(e) => handleUpdateModelField(index, "fit", e.target.value)}
                              className="h-8 text-xs rounded-md"
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
