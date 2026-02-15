from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import os

def create_logo(path, text, size=(512, 512), bg_color=(30, 64, 175), text_color=(255, 255, 255)):
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw circle background
    draw.ellipse([0, 0, size[0], size[1]], fill=bg_color)
    
    # Draw text
    try:
        font = ImageFont.truetype("arial.ttf", size[0]//3)
    except IOError:
        font = ImageFont.load_default()
        
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    x = (size[0] - text_width) / 2
    y = (size[1] - text_height) / 2
    
    draw.text((x, y), text, font=font, fill=text_color)
    
    img.save(path)
    print(f"Created {path}")

public_dir = r"c:\Users\Black_Phoenix\OneDrive\Desktop\Bharamratri studios\complaint_portal\public"
if not os.path.exists(public_dir):
    os.makedirs(public_dir)

create_logo(os.path.join(public_dir, "logo.png"), "AIMT")
create_logo(os.path.join(public_dir, "favicon.ico"), "A", size=(64, 64))
