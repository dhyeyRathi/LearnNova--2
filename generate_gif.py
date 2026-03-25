import os
from PIL import Image

idle_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\half_body_interviewer_idle_1774425522640.png"
speak_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\half_body_interviewer_speaking_1774425563233.png"

out_idle = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-idle-half.png"
out_gif = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-speaking.gif"

def remove_bg(img):
    img = img.convert("RGBA")
    data = img.getdata()
    # Assume top-left pixel is background color
    bg_color = data[0]
    
    new_data = []
    # Simple color distance
    def color_dist(c1, c2):
        return sum(abs(a - b) for a, b in zip(c1[:3], c2[:3]))
        
    for item in data:
        # If pixel is close to background color, make transparent
        if color_dist(item, bg_color) < 40:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    return img

try:
    idle = Image.open(idle_path)
    speak = Image.open(speak_path)

    # We will just remove backgrounds if needed, but let's just make the GIF first.
    # The image generation usually has a very clean solid background if prompted.
    # Let's try simple transparency filter.
    idle_trans = remove_bg(idle)
    speak_trans = remove_bg(speak)
    
    # Save the transparent idle image
    idle_trans.save(out_idle, "PNG")

    # Create GIF alternating the two frames for speech
    frames = [idle_trans, speak_trans, idle_trans, speak_trans, speak_trans, idle_trans]
    frames[0].save(
        out_gif,
        save_all=True,
        append_images=frames[1:],
        duration=250, # 250ms per frame
        loop=0,
        disposal=2,
        transparency=0
    )
    print("SUCCESS")
except Exception as e:
    print("FAILED:", str(e))
