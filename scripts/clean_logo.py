import os
from PIL import Image, ImageDraw
import pillow_heif

# Register HEIF opener with Pillow
pillow_heif.register_heif_opener()

heic_path = r"d:\Projects\horizon-optical\public\images\horizon-optical-inside-logo.HEIC"
output_png = r"d:\Projects\horizon-optical\public\images\horizon-optical-inside-logo-clean.png"

def clean_logo():
    # 1. Load HEIC and convert to RGBA
    print("Loading image...")
    img = Image.open(heic_path).convert("RGBA")
    
    # 2. Crop the image to focus on the logo (removing excess wall margins)
    # Original is 2986 x 1237
    # Let's crop to a tight bounding box around the logo
    # Left: 200, Top: 50, Right: 2800, Bottom: 1100
    crop_box = (200, 50, 2800, 1100)
    print("Cropping...")
    img = img.crop(crop_box)
    w, h = img.size
    
    # 3. Apply floodfill from the edges to make the grey wall transparent
    # The wall color is around (191, 192, 187). We will flood fill from the four corners.
    print("Removing background via floodfill...")
    transparent_color = (0, 0, 0, 0)
    
    # Fill from top-left, top-right, bottom-left, bottom-right corners
    # A threshold of 28 allows us to cover shade variations on the wall
    ImageDraw.floodfill(img, (2, 2), transparent_color, thresh=28)
    ImageDraw.floodfill(img, (w - 3, 2), transparent_color, thresh=28)
    ImageDraw.floodfill(img, (2, h - 3), transparent_color, thresh=28)
    ImageDraw.floodfill(img, (w - 3, h - 3), transparent_color, thresh=28)
    
    # Also floodfill from some top/bottom edges just in case
    for x in range(0, w, w // 5):
        ImageDraw.floodfill(img, (x, 2), transparent_color, thresh=28)
        ImageDraw.floodfill(img, (x, h - 3), transparent_color, thresh=28)
        
    print(f"Saving cleaned logo to {output_png}...")
    img.save(output_png, "PNG")
    print("Finished cleaning logo!")

if __name__ == "__main__":
    clean_logo()
