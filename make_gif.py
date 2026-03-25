import sys
import subprocess

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

idle_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\half_body_interviewer_idle_male_1774426051231.png"
speak_path = r"C:\Users\DHYEY RATHI\.gemini\antigravity\brain\54e6d502-75be-465b-a9d3-cbea065208a8\half_body_interviewer_speaking_male_1774426081117.png"
gif_path = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-speaking.gif"
idle_out = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\public\interviewer-idle.png"

idle = Image.open(idle_path)
speak = Image.open(speak_path)

# Save the idle image for when not speaking
idle.save(idle_out)

# Make a GIF of the mouth moving
frames = [idle, speak, idle, speak, speak, idle]
frames[0].save(
    gif_path,
    save_all=True,
    append_images=frames[1:],
    duration=250,
    loop=0
)
print("SUCCESS")
