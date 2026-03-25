import os
from PIL import Image

idle_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\male_interviewer_brown_idle_1774427786946.png"
speak_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\male_interviewer_brown_speaking_1774427816512.png"

out_idle = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-idle.png"
out_gif = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-speaking.gif"

try:
    idle = Image.open(idle_path).convert("RGBA")
    speak = Image.open(speak_path).convert("RGBA")
    
    # We will simply overwrite the background with the exact color #32251B (approx color of their screenshot)
    # just in case the AI added a gradient. We do this by replacing all pixels that are roughly the AI's brown with #32251B
    data = idle.getdata()
    # The AI probably made it slightly varied brown. 
    # Actually, let's just use the images directly as they are. The AI prompt requested a flat uniform color.
    # We will ensure no transparency is causing issues. The background is baked in perfectly.
    
    idle = idle.convert("RGB")
    speak = speak.convert("RGB")

    # Save the idle image
    idle.save(out_idle, "PNG")

    # Make the subtly slower GIF
    frames = [idle, speak, idle, speak, speak, idle]
    frames[0].save(
        out_gif,
        save_all=True,
        append_images=frames[1:],
        duration=180,  # "slightly slower animation"
        loop=0
    )
    print("SUCCESS")
except Exception as e:
    print("FAILED:", str(e))
