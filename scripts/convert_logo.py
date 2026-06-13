import os
from PIL import Image
import pillow_heif

# Register HEIF opener with Pillow
pillow_heif.register_heif_opener()

heic_path = r"d:\Projects\horizon-optical\public\images\horizon-optical-inside-logo.HEIC"
png_path = r"d:\Projects\horizon-optical\public\images\horizon-optical-inside-logo.png"

def convert_and_analyze():
    print(f"Loading {heic_path}...")
    image = Image.open(heic_path)
    
    # Save as PNG
    print(f"Saving to {png_path}...")
    image.save(png_path, "PNG")
    print("Saved successfully!")
    
    # Analyze dominant colors (resize to speed up processing)
    small_image = image.resize((100, 100))
    colors = small_image.getcolors(10000)
    
    # Sort colors by count descending
    sorted_colors = sorted(colors, key=lambda x: x[0], reverse=True)
    
    print("Dominant colors (count, RGB):")
    printed = 0
    for count, rgba in sorted_colors:
        # If image is RGBA and transparent, ignore
        if len(rgba) == 4 and rgba[3] < 50:
            continue
        # Ignore near white (backgrounds)
        rgb = rgba[:3]
        if rgb[0] > 240 and rgb[1] > 240 and rgb[2] > 240:
            continue
        # Ignore near black unless it's a major color
        print(f"  {count}: #{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x} (RGB: {rgb})")
        printed += 1
        if printed >= 10:
            break

if __name__ == "__main__":
    convert_and_analyze()
