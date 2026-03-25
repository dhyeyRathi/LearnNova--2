import os
from PIL import Image, ImageDraw

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
    bg = Image.new("RGBA", size, (53, 40, 32, 255)) # wall: #352820
    draw = ImageDraw.Draw(bg)
    w, h = size
    floor_y = int(h * 0.66)
    draw.rectangle([0, floor_y, w, h], fill=(68, 51, 36, 255)) # floor: #443324
    
    # Draw vertical lines for the floor
    # Using roughly 33% intervals based on the screenshot
    line_x1 = int(w * 0.34)
    line_x2 = int(w * 0.98)
    draw.line([(line_x1, floor_y), (line_x1, h)], fill=(114, 69, 36, 120), width=3)
    draw.line([(line_x2, floor_y), (line_x2, h)], fill=(114, 69, 36, 120), width=3)
    return bg

try:
    idle = Image.open(idle_path)
    speak = Image.open(speak_path)

    # get transparent subjects
    idle_trans = professional_chroma_key(idle)
    speak_trans = professional_chroma_key(speak)
    
    # create exact background
    bg_idle = create_bg(idle.size)
    bg_speak = create_bg(speak.size)
    
    # composite on top of solid background
    bg_idle.paste(idle_trans, (0,0), idle_trans)
    bg_speak.paste(speak_trans, (0,0), speak_trans)
    
    # convert to RGB (removes alpha channel completely)
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
    print("SUCCESS")
except Exception as e:
    print("FAILED:", str(e))
