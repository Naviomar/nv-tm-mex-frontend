<template>
  <div class="auth-globe-bg" :class="darkMode.isDark ? 'theme-dark' : 'theme-light'">
    <div class="auth-globe-aura"></div>
    <canvas ref="canvasRef" class="auth-globe-canvas"></canvas>
    <div class="auth-globe-fade"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * Globo de puntos dibujado en Canvas 2D (sin WebGL).
 *
 * Se intentó primero con la librería `cobe` (WebGL), pero en varios entornos
 * el renderer software/driver no rasteriza el punteado del mapa y solo deja
 * ver una esfera lisa con los marcadores — sin textura de continentes y sin
 * animación visible. Canvas 2D evita por completo esa dependencia de drivers
 * GL: los puntos se dibujan a mano, frame a frame, así que siempre se ven y
 * siempre rotan, en cualquier navegador/GPU.
 *
 * El bitmap world-dot-map.png es el mismo mapa mundial (continente = blanco)
 * que cobe trae embebido en su bundle; lo extraje para decidir qué puntos de
 * la esfera caen sobre tierra.
 */

const darkMode = useDarkMode()
const canvasRef = ref<HTMLCanvasElement | null>(null)

const MARKERS: [number, number][] = [
  [19.43, -99.13], // CDMX
  [25.67, -100.31], // Monterrey
  [31.62, -106.5], // Juarez
  [20.97, -89.62], // Merida / Progreso
  [40.71, -74.0], // NY
  [22.54, 114.05], // Shenzhen
  [1.35, 103.82], // Singapore
]

let rafId = 0
let dots: { lat: number; lon: number }[] = []

function buildDotsFromMask(mask: ImageData) {
  const points: { lat: number; lon: number }[] = []
  const SAMPLES = 6000
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < SAMPLES; i++) {
    const y = 1 - (i / (SAMPLES - 1)) * 2
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = goldenAngle * i

    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY

    const lat = (Math.asin(y) * 180) / Math.PI
    const lon = (Math.atan2(z, x) * 180) / Math.PI

    const u = Math.floor(((lon + 180) / 360) * mask.width) % mask.width
    const v = Math.floor(((90 - lat) / 180) * mask.height)
    const idx = (Math.max(0, v) * mask.width + ((u + mask.width) % mask.width)) * 4
    const isLand = mask.data[idx] > 128

    if (isLand) points.push({ lat, lon })
  }
  return points
}

function project(
  lat: number,
  lon: number,
  rotationY: number,
  tilt: number,
): { x: number; y: number; depth: number } {
  const latR = (lat * Math.PI) / 180
  const lonR = (lon * Math.PI) / 180 + rotationY

  const x0 = Math.cos(latR) * Math.sin(lonR)
  const y0 = Math.sin(latR)
  const z0 = Math.cos(latR) * Math.cos(lonR)

  const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt)
  const depth = y0 * Math.sin(tilt) + z0 * Math.cos(tilt)

  return { x: x0, y, depth }
}

async function start() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (dots.length === 0) {
    const mask = await loadMask()
    dots = buildDotsFromMask(mask)
  }

  const size = 1750
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = size * dpr
  canvas.height = size * dpr
  ctx.scale(dpr, dpr)

  const radius = size * 0.36
  const cx = size / 2
  const cy = size / 2
  const tilt = 0.34
  let rotationY = 0

  const isDark = darkMode.isDark
  const dotColor = isDark ? '255, 255, 255' : '60, 80, 150'
  const markerColor = '74, 130, 255'

  function frame() {
    ctx!.clearRect(0, 0, size, size)

    for (const { lat, lon } of dots) {
      const { x, y, depth } = project(lat, lon, rotationY, tilt)
      if (depth <= 0) continue

      const px = cx + x * radius
      const py = cy - y * radius
      const scale = 0.45 + 0.55 * depth
      const dotSize = 1.6 * scale

      ctx!.beginPath()
      ctx!.arc(px, py, dotSize, 0, Math.PI * 2)
      ctx!.fillStyle = `rgba(${dotColor}, ${0.32 + 0.65 * depth})`
      ctx!.fill()
    }

    for (const [lat, lon] of MARKERS) {
      const { x, y, depth } = project(lat, lon, rotationY, tilt)
      if (depth <= 0.05) continue

      const px = cx + x * radius
      const py = cy - y * radius
      const scale = 0.5 + 0.5 * depth

      ctx!.beginPath()
      ctx!.arc(px, py, 4 * scale, 0, Math.PI * 2)
      ctx!.fillStyle = `rgba(${markerColor}, ${0.7 * depth})`
      ctx!.shadowColor = `rgba(${markerColor}, 0.9)`
      ctx!.shadowBlur = 8
      ctx!.fill()
      ctx!.shadowBlur = 0
    }

    rotationY += 0.0028
    rafId = requestAnimationFrame(frame)
  }

  cancelAnimationFrame(rafId)
  frame()
}

function loadMask(): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const off = document.createElement('canvas')
      off.width = img.width
      off.height = img.height
      const offCtx = off.getContext('2d')!
      offCtx.drawImage(img, 0, 0)
      resolve(offCtx.getImageData(0, 0, img.width, img.height))
    }
    img.onerror = reject
    img.src = '/world-dot-map.png'
  })
}

watch(() => darkMode.isDark, start)
onMounted(start)
onBeforeUnmount(() => cancelAnimationFrame(rafId))
</script>

<style scoped>
.auth-globe-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  transition: background 0.4s ease;
}
.theme-dark {
  background: #05070d;
}
.theme-light {
  background: #f4f6fb;
}

/* Mismo tamaño/posición que el canvas (1750px). El radio real de la esfera
   dibujada en el canvas es size*0.36 = 630px — los stops están en píxeles
   exactos (no %, que no coinciden con el radio real del canvas) para que el
   anillo arranque justo después de ese borde y nunca quede encima de los
   puntos. */
.auth-globe-aura {
  position: absolute;
  bottom: -22%;
  right: -20%;
  width: 1750px;
  height: 1750px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(22px);
  /* Solo se ve por debajo del planeta, como si la luz saliera de ahí, en vez
     de un anillo completo y parejo alrededor. */
  -webkit-mask-image: linear-gradient(to top, black 0%, black 35%, transparent 80%);
  mask-image: linear-gradient(to top, black 0%, black 35%, transparent 80%);
}
.theme-dark .auth-globe-aura {
  background: radial-gradient(
    circle at 50% 50%,
    transparent 0px,
    transparent 632px,
    rgba(64, 130, 255, 0.3) 658px,
    rgba(64, 130, 255, 0.1) 685px,
    transparent 720px
  );
}
.theme-light .auth-globe-aura {
  background: radial-gradient(
    circle at 50% 50%,
    transparent 0px,
    transparent 632px,
    rgba(64, 130, 255, 0.22) 658px,
    rgba(64, 130, 255, 0.07) 685px,
    transparent 720px
  );
}

.auth-globe-canvas {
  position: absolute;
  bottom: -22%;
  right: -20%;
  width: 1750px;
  height: 1750px;
}

.auth-globe-fade {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.theme-dark .auth-globe-fade {
  background: radial-gradient(circle at 78% 72%, transparent 38%, #05070d 72%);
}
.theme-light .auth-globe-fade {
  background: radial-gradient(circle at 78% 72%, transparent 38%, #f4f6fb 72%);
}
</style>
