import sys
import subprocess
import os

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

try:
    from PIL import Image
except:
    install("Pillow")
    from PIL import Image

try:
    import rembg
except:
    install("rembg[cli]")
    import rembg
    
from rembg import remove

idle_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\half_body_interviewer_idle_male_1774426051231.png"
speak_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\half_body_interviewer_speaking_male_1774426081117.png"

gif_path = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-speaking.gif"
idle_out = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-idle.png"

# Load images
idle = Image.open(idle_path)
speak = Image.open(speak_path)

# Remove background
print("Removing background for idle...")
idle_nobg = remove(idle)
print("Removing background for speak...")
speak_nobg = remove(speak)

# Save the idle image
idle_nobg.save(idle_out, "PNG")

# Make a GIF of the mouth moving (faster)
frames = [idle_nobg, speak_nobg, idle_nobg, speak_nobg, speak_nobg, idle_nobg]
frames[0].save(
    gif_path,
    save_all=True,
    append_images=frames[1:],
    duration=120,  # 120ms per frame, significantly faster
    loop=0,
    disposal=2,
    transparency=0
)
print("SUCCESS")
