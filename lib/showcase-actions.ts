"use server"

import { nhostGraphqlClient, isNhostEnabled } from "@/lib/nhost"
import fs from "fs"
import path from "path"
import { revalidatePath } from "next/cache"

const DATA_FILE = path.join(process.cwd(), "lib", "designer-showcase-data.json")

const DEFAULT_BRAND_MODELS: Record<string, {
  bio: string;
  models: {
    name: string;
    code: string;
    image: string;
    shape: string;
    material: string;
    fit: string;
  }[];
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
  }
}

export async function getShowcaseData(): Promise<{ success: boolean; data: Record<string, any> }> {
  // 1. Try fetching from Nhost first if enabled
  if (isNhostEnabled()) {
    const query = `
      query GetDesignerShowcase {
        designer_showcase {
          brand_name
          bio
          models
        }
      }
    `

    try {
      const res: any = await nhostGraphqlClient.request(query)
      if (res && res.designer_showcase && res.designer_showcase.length > 0) {
        // Reconstruct dictionary Record<brand_name, { bio, models }>
        const data: Record<string, any> = {}
        res.designer_showcase.forEach((row: any) => {
          data[row.brand_name] = {
            bio: row.bio,
            models: typeof row.models === "string" ? JSON.parse(row.models) : row.models
          }
        })
        return { success: true, data }
      }
    } catch (error) {
      console.warn("Nhost designer_showcase query failed. Falling back to local JSON.", error)
    }
  } else {
    console.log("Nhost is disabled or unconfigured. Bypassing Nhost fetch.")
  }

  // 2. Fall back to local filesystem JSON
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_BRAND_MODELS, null, 2), "utf8")
    }
    const content = fs.readFileSync(DATA_FILE, "utf8")
    const data = JSON.parse(content)
    return { success: true, data }
  } catch (error) {
    console.error("Local JSON read failed. Falling back to static constant defaults.", error)
    return { success: false, data: DEFAULT_BRAND_MODELS }
  }
}

export async function saveShowcaseData(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  let nhostSuccess = false

  // 1. Try saving to Nhost first if enabled
  if (isNhostEnabled()) {
    const mutation = `
      mutation UpsertDesignerShowcase($objects: [designer_showcase_insert_input!]!) {
        insert_designer_showcase(
          objects: $objects,
          on_conflict: {
            constraint: designer_showcase_pkey,
            update_columns: [bio, models]
          }
        ) {
          affected_rows
        }
      }
    `

    const objects = Object.entries(data).map(([brandName, details]) => ({
      brand_name: brandName,
      bio: details.bio,
      models: details.models // Hasura supports JSON/JSONB binding directly as objects/arrays
    }))

    try {
      const res: any = await nhostGraphqlClient.request(mutation, { objects })
      if (res) {
        nhostSuccess = true
      }
    } catch (error: any) {
      console.warn("Nhost designer_showcase upsert failed. Saving locally to JSON.", error?.message || error)
    }
  } else {
    console.log("Nhost is disabled or unconfigured. Bypassing Nhost save.")
  }

  // 2. Save to local JSON (keep it in sync or as a fallback)
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8")
    revalidatePath("/")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to write to local JSON file:", error)
    if (nhostSuccess) {
      // If Nhost succeeded but local file write failed, we can still report success
      revalidatePath("/")
      revalidatePath("/dashboard")
      return { success: true }
    }
    return { success: false, error: error?.message || "Failed to save data" }
  }
}
