import os
from PIL import Image, ImageChops, ImageFilter, ImageDraw

idle_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\male_interviewer_green_idle_1774426990637.png"
speak_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\male_interviewer_green_speaking_slight_1774427228131.png"

out_idle = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-idle.png"
out_gif = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-speaking.gif"

def professional_chroma_key(img):
    img = img.convert("RGBA")
    data = img.getdata()
    new_data = []
    for item in data:
        r, g, b, a = item
        max_rb = max(r, b)
        if g > max_rb:
            greenness = g - max_rb
            if greenness > 35:
                a = 0
            else:
                a = max(0, 255 - int(greenness * 7.5))
            g = min(g, max_rb + 2)
        new_data.append((r, g, b, int(a)))
    img.putdata(new_data)
    return img

def create_bg(size):
    bg = Image.new("RGBA", size, (53, 40, 32, 255))
    draw = ImageDraw.Draw(bg)
    w, h = size
    floor_y = int(h * 0.66)
    draw.rectangle([0, floor_y, w, h], fill=(68, 51, 36, 255))
    line_x1 = int(w * 0.34)
    line_x2 = int(w * 0.98)
    draw.line([(line_x1, floor_y), (line_x1, h)], fill=(114, 69, 36, 120), width=3)
    draw.line([(line_x2, floor_y), (line_x2, h)], fill=(114, 69, 36, 120), width=3)
    return bg

try:
    idle_img = Image.open(idle_path).convert("RGB")
    speak_img = Image.open(speak_path).convert("RGB")

    # Locate the mouth by finding major pixel differences and masking
    diff = ImageChops.difference(idle_img, speak_img).convert("L")
    diff_data = diff.getdata()

    w, h = idle_img.size
    min_x, min_y = w, h
    max_x, max_y = 0, 0

    for y in range(h):
        for x in range(w):
            val = diff_data[y * w + x]
            if val > 40:  # Ignore minor AI lighting flickers
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y

    if min_x > max_x: 
        min_x, max_x = int(w * 0.4), int(w * 0.6)
        min_y, max_y = int(h * 0.4), int(h * 0.6)

    # Pad bounding box to include lips completely safely
    pad = 40
    min_x = max(0, min_x - pad)
    max_x = min(w, max_x + pad)
    min_y = max(0, min_y - pad)
    max_y = min(h, max_y + pad)

    # Generate isolated region mask
    mask = Image.new("L", (w, h), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.rectangle([min_x, min_y, max_x, max_y], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=20))

    # Splice ONLY the moving mouth onto the stable base idle image
    perfect_speak = idle_img.copy()
    perfect_speak.paste(speak_img, (0,0), mask)

    # Apply chroma and compositing
    idle_trans = professional_chroma_key(idle_img)
    speak_trans = professional_chroma_key(perfect_speak)

    bg_idle = create_bg(idle_img.size)
    bg_speak = create_bg(perfect_speak.size)

    bg_idle.paste(idle_trans, (0,0), idle_trans)
    bg_speak.paste(speak_trans, (0,0), speak_trans)

    final_idle = bg_idle.convert("RGB")
    final_speak = bg_speak.convert("RGB")

    final_idle.save(out_idle, "PNG")

    frames = [final_idle, final_speak, final_idle, final_speak, final_speak, final_idle]
    frames[0].save(
        out_gif,
        save_all=True,
        append_images=frames[1:],
        duration=180, 
        loop=0
    )
    print(f"SUCCESS: Diff bounding box {min_x},{min_y} - {max_x},{max_y}")
except Exception as e:
    print("FAILED:", str(e))
