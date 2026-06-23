<template>
  <div class="auth-globe-bg" :class="darkMode.isDark ? 'theme-dark' : 'theme-light'">
    <template v-if="!hideGlobeMotion">
      <div class="auth-globe-aura"></div>
      <canvas ref="canvasRef" class="auth-globe-canvas"></canvas>
    </template>
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
const { hideGlobeMotion } = useReducedMotion()
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Mismos puertos en mex y chl: puertos reales de carga/descarga de mex
// (Reports > Sea Import > Loading Ports / Discharge Ports) + los puertos
// marítimos de chl.
const MARKERS: [number, number][] = [
  [19.05, -104.32], // Manzanillo (MEX) — top puerto de descarga
  [17.96, -102.19], // Lázaro Cárdenas (MEX) — top puerto de descarga
  [19.18, -96.13], // Veracruz (MEX) — top puerto de descarga
  [23.22, -106.42], // Mazatlán (MEX) — descarga
  [-33.59, -71.62], // San Antonio (CHL) — principal puerto de Chile
  [-33.03, -71.55], // Valparaíso (CHL)
  [-36.74, -73.13], // San Vicente / Talcahuano (CHL)
  [-20.21, -70.15], // Iquique (CHL)
  [-23.65, -70.4], // Antofagasta (CHL)
  [31.23, 121.47], // Shanghai — top puerto de carga
  [29.87, 121.54], // Ningbo — top puerto de carga
  [36.07, 120.38], // Qingdao — carga
  [22.54, 114.05], // Shenzhen
  [1.35, 103.82], // Singapore
]

// Rutas reales carga -> descarga (origen en Asia, destino en el puerto de
// MEX/CHL que más volumen recibe de ese origen, según el reporte
// comparativo). Se muestran de una en una, cíclicamente, para no saturar.
const ROUTES: { from: [number, number]; to: [number, number] }[] = [
  { from: [31.23, 121.47], to: [19.05, -104.32] }, // Shanghai -> Manzanillo
  { from: [29.87, 121.54], to: [17.96, -102.19] }, // Ningbo -> Lázaro Cárdenas
  { from: [36.07, 120.38], to: [19.18, -96.13] }, // Qingdao -> Veracruz
  { from: [31.23, 121.47], to: [-33.59, -71.62] }, // Shanghai -> San Antonio
  { from: [22.54, 114.05], to: [-33.03, -71.55] }, // Shenzhen -> Valparaíso
  { from: [29.87, 121.54], to: [-36.74, -73.13] }, // Ningbo -> San Vicente
]
const ROUTE_CYCLE_MS = 5000
const ROUTE_FADE_MS = 900
const ROUTE_WINDOW = 4

let rafId = 0
let dots: { lat: number; lon: number }[] = []
let routePaths: [number, number, number][][] = []

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

function latLonToVec3(lat: number, lon: number): [number, number, number] {
  const latR = (lat * Math.PI) / 180
  const lonR = (lon * Math.PI) / 180
  return [Math.cos(latR) * Math.sin(lonR), Math.sin(latR), Math.cos(latR) * Math.cos(lonR)]
}

function rotateAndProject(
  vec: [number, number, number],
  rotationY: number,
  tilt: number,
): { x: number; y: number; depth: number } {
  const [vx, vy, vz] = vec
  const cosY = Math.cos(rotationY)
  const sinY = Math.sin(rotationY)
  const x0 = vx * cosY + vz * sinY
  const z0 = -vx * sinY + vz * cosY

  const y = vy * Math.cos(tilt) - z0 * Math.sin(tilt)
  const depth = vy * Math.sin(tilt) + z0 * Math.cos(tilt)

  return { x: x0, y, depth }
}

function project(
  lat: number,
  lon: number,
  rotationY: number,
  tilt: number,
): { x: number; y: number; depth: number } {
  return rotateAndProject(latLonToVec3(lat, lon), rotationY, tilt)
}

/**
 * Rutas marítimas: en vez de una línea recta (great-circle) que atraviesa
 * países, se busca un camino que se mantenga sobre el océano usando el mismo
 * bitmap del mapa mundial (continente = blanco) que ya tenemos para los
 * puntos. Se trata el bitmap como una cuadrícula navegable y se corre un
 * BFS (con wraparound de longitud, para que cruces transpacíficos salgan por
 * el lado corto) desde el puerto de origen hasta el de destino.
 */
function isOceanCell(mask: ImageData, u: number, v: number): boolean {
  if (v < 0 || v >= mask.height) return false
  const uu = ((u % mask.width) + mask.width) % mask.width
  return mask.data[(v * mask.width + uu) * 4] <= 128
}

function latLonToCell(lat: number, lon: number, mask: ImageData): [number, number] {
  const u = Math.floor(((lon + 180) / 360) * mask.width)
  const v = Math.floor(((90 - lat) / 180) * mask.height)
  return [((u % mask.width) + mask.width) % mask.width, Math.max(0, Math.min(mask.height - 1, v))]
}

function cellToLatLon(u: number, v: number, mask: ImageData): [number, number] {
  const lon = ((u + 0.5) / mask.width) * 360 - 180
  const lat = 90 - ((v + 0.5) / mask.height) * 180
  return [lat, lon]
}

// Los puertos caen justo en la costa (a veces sobre el pixel de tierra más
// cercano): se busca en espiral la celda de océano más próxima.
function nearestOceanCell(mask: ImageData, u0: number, v0: number): [number, number] {
  if (isOceanCell(mask, u0, v0)) return [u0, v0]
  for (let r = 1; r < 24; r++) {
    for (let dv = -r; dv <= r; dv++) {
      for (let du = -r; du <= r; du++) {
        if (Math.max(Math.abs(du), Math.abs(dv)) !== r) continue
        const u = u0 + du
        const v = v0 + dv
        if (isOceanCell(mask, u, v)) return [((u % mask.width) + mask.width) % mask.width, v]
      }
    }
  }
  return [u0, v0]
}

function bfsSeaPath(mask: ImageData, start: [number, number], end: [number, number]): [number, number][] {
  const { width, height } = mask
  const key = (u: number, v: number) => v * width + u
  const visited = new Uint8Array(width * height)
  const prev = new Int32Array(width * height).fill(-1)
  const queue: [number, number][] = [start]
  visited[key(start[0], start[1])] = 1
  const dirs: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]

  let found = false
  for (let qi = 0; qi < queue.length; qi++) {
    const [u, v] = queue[qi]
    if (u === end[0] && v === end[1]) {
      found = true
      break
    }
    for (const [du, dv] of dirs) {
      const nv = v + dv
      if (nv < 0 || nv >= height) continue
      const nu = ((u + du) % width + width) % width
      if (!isOceanCell(mask, nu, nv)) continue
      const k = key(nu, nv)
      if (visited[k]) continue
      visited[k] = 1
      prev[k] = key(u, v)
      queue.push([nu, nv])
    }
  }

  if (!found) return [start, end]

  const path: [number, number][] = []
  let curKey: number = key(end[0], end[1])
  while (curKey !== -1) {
    path.push([curKey % width, Math.floor(curKey / width)])
    curKey = prev[curKey]
  }
  path.reverse()
  return path
}

// Promedio móvil sobre lat/lon (con la longitud "desenrollada" para que el
// promedio no se rompa al cruzar el meridiano 180°) para suavizar el
// escalonado propio de una cuadrícula de baja resolución.
function smoothPath(path: [number, number][], passes = 2): [number, number][] {
  let pts = path.map((p) => [p[0], p[1]] as [number, number])
  for (let i = 1; i < pts.length; i++) {
    while (pts[i][1] - pts[i - 1][1] > 180) pts[i][1] -= 360
    while (pts[i][1] - pts[i - 1][1] < -180) pts[i][1] += 360
  }
  for (let pass = 0; pass < passes; pass++) {
    const next = pts.map((p) => [p[0], p[1]] as [number, number])
    for (let i = 1; i < pts.length - 1; i++) {
      next[i][0] = (pts[i - 1][0] + pts[i][0] + pts[i + 1][0]) / 3
      next[i][1] = (pts[i - 1][1] + pts[i][1] + pts[i + 1][1]) / 3
    }
    pts = next
  }
  pts[0] = path[0]
  pts[pts.length - 1] = path[path.length - 1]
  return pts
}

function buildSeaRoute(mask: ImageData, from: [number, number], to: [number, number]): [number, number][] {
  const startCell = nearestOceanCell(mask, ...latLonToCell(from[0], from[1], mask))
  const endCell = nearestOceanCell(mask, ...latLonToCell(to[0], to[1], mask))
  const cells = bfsSeaPath(mask, startCell, endCell)
  const waypoints = cells.map(([u, v]) => cellToLatLon(u, v, mask))
  waypoints[0] = from
  waypoints[waypoints.length - 1] = to
  return smoothPath(waypoints)
}

// Convierte la ruta (lat/lon) a vectores 3D, con una elevación leve a mitad
// de camino para que el trazo no quede pegado a la textura de puntos.
function routeToVec3(path: [number, number][]): [number, number, number][] {
  return path.map(([lat, lon], i) => {
    const t = i / (path.length - 1)
    const bulge = 1 + Math.sin(t * Math.PI) * 0.025
    const [x, y, z] = latLonToVec3(lat, lon)
    return [x * bulge, y * bulge, z * bulge] as [number, number, number]
  })
}

async function start() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (dots.length === 0) {
    const mask = await loadMask()
    dots = buildDotsFromMask(mask)
    // Se calcula una sola vez: el BFS por ruta corre sobre una cuadrícula de
    // 256x128, es liviano, pero no hace falta repetirlo cada frame ni cada
    // vez que cambia el tema.
    routePaths = ROUTES.map((r) => routeToVec3(buildSeaRoute(mask, r.from, r.to)))
  }

  const isDark = darkMode.isDark
  // Centrado y compacto en modo claro; grande y en la esquina en modo oscuro
  // (pedido explícito: "centrado en modo claro... a la derecha en oscuro").
  const size = isDark ? 1750 : 1100
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = size * dpr
  canvas.height = size * dpr
  ctx.scale(dpr, dpr)

  const radius = size * 0.36
  const cx = size / 2
  const cy = size / 2
  const tilt = 0.34
  let rotationY = 0

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

    // Ventana de 4 rutas activas a la vez (de las 6 totales), deslizándose de
    // una en una con fundido en los bordes. El "flujo" se dibuja como una
    // línea continua cuyo grosor/opacidad varía a lo largo del trazo — sin
    // puntos/círculos.
    const now = performance.now()
    const cycleElapsed = now % (ROUTE_CYCLE_MS * ROUTES.length)
    const start = Math.floor(cycleElapsed / ROUTE_CYCLE_MS)
    const withinCycle = cycleElapsed % ROUTE_CYCLE_MS
    const enterAlpha = withinCycle < ROUTE_FADE_MS ? withinCycle / ROUTE_FADE_MS : 1
    const exitAlpha = withinCycle < ROUTE_FADE_MS ? 1 - withinCycle / ROUTE_FADE_MS : 0

    const activeRoutes: { alpha: number; idx: number }[] = []
    for (let offset = 0; offset < ROUTE_WINDOW; offset++) {
      const idx = (start + offset) % ROUTES.length
      const alpha = offset === ROUTE_WINDOW - 1 ? enterAlpha : 1
      activeRoutes.push({ alpha, idx })
    }
    const leavingIdx = (start - 1 + ROUTES.length) % ROUTES.length
    if (exitAlpha > 0.01) activeRoutes.push({ alpha: exitAlpha, idx: leavingIdx })

    const PULSE_MS = 2200
    for (const { alpha, idx } of activeRoutes) {
      if (alpha <= 0.01) continue

      const pts = routePaths[idx]
      const projected = pts.map((v) => {
        const { x, y, depth } = rotateAndProject(v, rotationY, tilt)
        return { px: cx + x * radius, py: cy - y * radius, depth }
      })

      // Cada ruta tiene su propio pulso, desfasado, para que no se muevan
      // todas en sincronía.
      const pulseT = (((now + idx * 350) % PULSE_MS) / PULSE_MS) * 1.3
      const sigma = 0.045

      for (let i = 0; i < projected.length - 1; i++) {
        const p0 = projected[i]
        const p1 = projected[i + 1]
        if (p0.depth <= 0 || p1.depth <= 0) continue

        const t = (i + 0.5) / (projected.length - 1)
        const glow = Math.exp(-((t - pulseT) ** 2) / sigma)
        const lineAlpha = (0.14 + glow * 0.86) * alpha

        ctx!.beginPath()
        ctx!.moveTo(p0.px, p0.py)
        ctx!.lineTo(p1.px, p1.py)
        ctx!.lineWidth = 1.2 + glow * 1.8
        ctx!.strokeStyle = `rgba(${markerColor}, ${Math.min(1, lineAlpha)})`
        ctx!.stroke()
      }
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

watch(() => darkMode.isDark, () => {
  if (!hideGlobeMotion.value) start()
})
watch(hideGlobeMotion, (hidden) => {
  if (hidden) {
    cancelAnimationFrame(rafId)
  } else {
    // El canvas recién se vuelve a montar (v-if) cuando se reactiva.
    nextTick(start)
  }
})
onMounted(() => {
  if (!hideGlobeMotion.value) start()
})
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

/* Modo claro: centrado y compacto (1100px, radio real 396px).
   Modo oscuro: grande, en la esquina inferior derecha (1750px, radio 630px).
   Los stops del halo están en píxeles exactos para coincidir con el radio
   real que dibuja el canvas en cada tamaño. */
.auth-globe-aura {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(22px);
  /* Solo se ve por debajo del planeta, como si la luz saliera de ahí, en vez
     de un anillo completo y parejo alrededor. */
  -webkit-mask-image: linear-gradient(to top, black 0%, black 35%, transparent 80%);
  mask-image: linear-gradient(to top, black 0%, black 35%, transparent 80%);
}
.theme-light .auth-globe-aura {
  top: 50%;
  left: 50%;
  width: 1100px;
  height: 1100px;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle at 50% 50%,
    transparent 0px,
    transparent 398px,
    rgba(64, 130, 255, 0.22) 414px,
    rgba(64, 130, 255, 0.07) 432px,
    transparent 454px
  );
}
.theme-dark .auth-globe-aura {
  bottom: -22%;
  right: -20%;
  width: 1750px;
  height: 1750px;
  background: radial-gradient(
    circle at 50% 50%,
    transparent 0px,
    transparent 632px,
    rgba(64, 130, 255, 0.3) 658px,
    rgba(64, 130, 255, 0.1) 685px,
    transparent 720px
  );
}

.auth-globe-canvas {
  position: absolute;
}
.theme-light .auth-globe-canvas {
  top: 50%;
  left: 50%;
  width: 1100px;
  height: 1100px;
  transform: translate(-50%, -50%);
}
.theme-dark .auth-globe-canvas {
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
  background: radial-gradient(circle at 50% 50%, transparent 30%, #f4f6fb 72%);
}
</style>
