import os
from PIL import Image

idle_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\male_interviewer_green_idle_1774426990637.png"
speak_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\male_interviewer_green_speaking_1774427023597.png"

out_idle = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-idle.png"
out_gif = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-speaking.gif"

def remove_green(img):
    img = img.convert("RGBA")
    data = img.getdata()
    
    new_data = []
    # Identify green: G dominant, high brightness. Standard chroma key.
    # #00FF00 means r is low, g is very high, b is low.
    for item in data:
        r, g, b, a = item
        # If green is the prominent color and it's quite bright, drop it.
        # Strict green screen threshold:
        if g > 150 and g > r * 1.5 and g > b * 1.5:
            new_data.append((255, 255, 255, 0))
        elif g > 100 and g > r * 1.2 and g > b * 1.2:
            # edge blending
            new_data.append((r, g, b, max(0, 255 - int(g * 1.5))))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    return img

try:
    idle = Image.open(idle_path)
    speak = Image.open(speak_path)

    # Process green screen
    idle_trans = remove_green(idle)
    speak_trans = remove_green(speak)
    
    # Save the transparent idle image
    idle_trans.save(out_idle, "PNG")

    # Create GIF alternating the two frames for speech - FASTER (100ms)
    frames = [idle_trans, speak_trans, idle_trans, speak_trans, speak_trans, idle_trans]
    frames[0].save(
        out_gif,
        save_all=True,
        append_images=frames[1:],
        duration=100, # 100ms = 10fps, faster
        loop=0,
        disposal=2,
        transparency=0
    )
    print("SUCCESS")
except Exception as e:
    print("FAILED:", str(e))
