import os
from PIL import Image

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
        
        # If green dominates by a wide margin, it's the background.
        if g > max_rb:
            greenness = g - max_rb
            
            # Hard cutoff for strong background green
            if greenness > 35:
                a = 0
            else:
                # Soft blend for the edge
                a = max(0, 255 - int(greenness * 7.5))
            
            # Despill: limit green to max_rb strictly so no green glows 
            # This turns any green spill grey/white, which blends perfectly!
            g = min(g, max_rb + 2)
            
        new_data.append((r, g, b, int(a)))
            
    img.putdata(new_data)
    return img

try:
    idle = Image.open(idle_path)
    speak = Image.open(speak_path)

    idle_trans = professional_chroma_key(idle)
    speak_trans = professional_chroma_key(speak)
    
    idle_trans.save(out_idle, "PNG")

    # Slower animation: 180ms per frame
    frames = [idle_trans, speak_trans, idle_trans, speak_trans, speak_trans, idle_trans]
    frames[0].save(
        out_gif,
        save_all=True,
        append_images=frames[1:],
        duration=180, 
        loop=0,
        disposal=2,
        transparency=0
    )
    print("SUCCESS")
except Exception as e:
    print("FAILED:", str(e))
