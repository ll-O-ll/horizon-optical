import os
from PIL import Image
import pillow_heif

# Register HEIF opener with Pillow
pillow_heif.register_heif_opener()

heic_path = r"d:\Projects\horizon-optical\public\images\horizon-optical-inside-logo.HEIC"
output_png = r"d:\Projects\horizon-optical\public\images\horizon-optical-inside-logo-clean.png"

def super_clean():
    print("Loading HEIC...")
    img = Image.open(heic_path).convert("RGBA")
    
    # Bounding box crop (Tight crop around the logo)
    crop_box = (200, 50, 2800, 1100)
    print("Cropping...")
    img = img.crop(crop_box)
    w, h = img.size
    
    # Convert to pixel array for editing
    pixels = img.load()
    
    print("Cleaning pixels...")
    # Bounding box of the iris inside the cropped coordinates:
    # Centered horizontally, at the top vertically.
    # Center is w // 2 = 1300.
    iris_min_x = 1050
    iris_max_x = 1550
    iris_min_y = 50
    iris_max_y = 380

    for x in range(w):
        for y in range(h):
            r, g, b, a = pixels[x, y]
            
            # Skip checking inside the protected iris region
            if iris_min_x <= x <= iris_max_x and iris_min_y <= y <= iris_max_y:
                # Still check if it's very close to the outer grey border, but keep the iris
                # Let's keep it safe and not make anything in the iris box transparent 
                # unless it's definitely the background (very outer edges of the box)
                # If it's near the top or bottom of the iris box, check if it's wall background:
                is_wall_near_edge = (y < 90 or y > 350 or x < 1120 or x > 1480)
                if not is_wall_near_edge:
                    continue
            
            # Determine if this pixel is the wall background (grey-beige).
            # The wall is matte grey/beige.
            # Characteristics: 
            # - R, G, B are close to each other (low saturation)
            # - Brightness is medium (not black, not white)
            max_val = max(r, g, b)
            min_val = min(r, g, b)
            diff = max_val - min_val
            
            # Blue letter filter: Blue is saturated, b is higher than r/g
            is_blue = (b > r * 1.25) and (b > 100)
            # Black letters/eye filter: Very dark
            is_black = (r < 90) and (g < 90) and (b < 90)
            
            if not is_blue and not is_black:
                # If difference between RGB components is small, it's grey/neutral background
                # Threshold of 24 handles shadows/lighting gradients
                # min_val > 70 ensures we don't accidentally transparentize dark shadows under letters
                if diff < 24 and min_val > 70:
                    pixels[x, y] = (0, 0, 0, 0)
                # Very bright wall spots (near white specular reflection on wall)
                elif min_val > 220:
                    pixels[x, y] = (0, 0, 0, 0)
                    
    # Smooth edges or simple cleanup: remove isolated pixels (optional)
    print("Saving cleaned transparent logo...")
    img.save(output_png, "PNG")
    print("Done!")

if __name__ == "__main__":
    super_clean()
