from PIL import Image, ImageDraw, ImageFont
import math

INK="#14181C"; SENAL="#FFD100"; PAPER="#F1F3F2"; CONCRETO="#8A9199"; GRID="#242C33"
D="/usr/share/fonts/truetype/dejavu/"
def f(n,s): return ImageFont.truetype(D+n, s)

def traza(dr, x0, y0, w, h, color, grosor):
    """Sismograma: ondas P, pico S y coda amortiguada."""
    mid = y0 + h/2; pts=[]
    steps = int(w)
    for i in range(steps+1):
        t = i/steps
        if t < 0.24:   a = math.sin(t*90)*0.10*h*(t/0.24)
        elif t < 0.34: a = math.sin(t*130)*0.62*h*math.sin((t-0.24)/0.10*math.pi)
        else:          a = (math.sin(t*105)*0.55*h*math.exp(-(t-0.34)*6.2)
                            + math.sin(t*47)*0.09*h*math.exp(-(t-0.34)*3.4))
        pts.append((x0+t*w, mid-a))
    dr.line(pts, fill=color, width=grosor, joint="curve")

# ---------------- OG 1200x630 ----------------
W,H = 1200,630
img = Image.new("RGB",(W,H),INK); dr = ImageDraw.Draw(img)
for x in range(0,W+1,60): dr.line([(x,0),(x,H)], fill=GRID, width=1)
for y in range(0,H+1,60): dr.line([(0,y),(W,y)], fill=GRID, width=1)

traza(dr, 0, 178, W, 200, SENAL, 5)

dr.rectangle([0,0,W,10], fill=SENAL)

dr.text((70,58), "COLOMBIA RESPONDE", font=f("DejaVuSansCondensed-Bold.ttf",62), fill=PAPER)
dr.text((74,132), "AYUDA VERIFICADA  ·  TERREMOTO 10 AGO 2026", font=f("DejaVuSansMono.ttf",21), fill=SENAL)

dr.line([(70,410),(W-70,410)], fill=GRID, width=2)

dr.text((70,436), "M 7,4", font=f("DejaVuSansCondensed-Bold.ttf",80), fill=SENAL)
dr.text((330,448), "SAN JOSÉ DEL PALMAR, CHOCÓ", font=f("DejaVuSansMono.ttf",23), fill=PAPER)
dr.text((330,484), "07:34 a. m.  ·  103 km de profundidad", font=f("DejaVuSansMono.ttf",21), fill=CONCRETO)

dr.text((70,556), "Dónde donar · Qué donar · Centros de acopio · Cómo evitar estafas",
        font=f("DejaVuSansCondensed-Bold.ttf",31), fill=PAPER)
dr.text((70,596), "Funciona sin conexión  ·  Desarrollada por Vibras Positivas HM",
        font=f("DejaVuSansMono.ttf",17), fill=CONCRETO)
img.save("og-image.png", optimize=True)

# ---------------- Iconos ----------------
def icono(size, maskable=False):
    im = Image.new("RGB",(size,size),INK); d = ImageDraw.Draw(im)
    pad = size*0.22 if maskable else size*0.10
    g = max(1,int(size/64))
    for x in range(0,size+1,int(size/8)): d.line([(x,0),(x,size)], fill=GRID, width=1)
    for y in range(0,size+1,int(size/8)): d.line([(0,y),(size,y)], fill=GRID, width=1)
    traza(d, pad, size*0.30, size-2*pad, size*0.30, SENAL, max(2,int(size/38)))
    ft = ImageFont.truetype(D+"DejaVuSansCondensed-Bold.ttf", int(size*0.30))
    t = "CR"; bb = d.textbbox((0,0),t,font=ft)
    d.text(((size-(bb[2]-bb[0]))/2 - bb[0], size*0.60), t, font=ft, fill=PAPER)
    return im

icono(192).save("icon-192.png", optimize=True)
icono(512).save("icon-512.png", optimize=True)
icono(512, maskable=True).save("icon-maskable-512.png", optimize=True)
print("imagenes generadas")
