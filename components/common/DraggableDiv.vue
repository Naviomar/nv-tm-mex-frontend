<template>
  <div
    ref="rootEl"
    class="draggable-div"
    :style="{ top: position.top + 'px', left: position.left + 'px' }"
  >
    <div class="draggable-div__header" @mousedown="startDrag">
      <div class="draggable-div__handle">
        <v-icon size="18">mdi-drag</v-icon>
      </div>
      <div class="draggable-div__actions">
        <v-icon size="18" class="draggable-div__action" @mousedown.stop @click="initPosition">mdi-target</v-icon>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// Initial position of the div
const position = ref({ top: 100, left: 100 })
const rootEl = ref<HTMLElement | null>(null)
const DRAGGABLE_COUNT_KEY = '__nv_tm_draggable_count__'
let isDragging = false
let offset = { x: 0, y: 0 }

const ensureInViewport = () => {
  const el = rootEl.value
  if (!el) return

  const width = el.offsetWidth || 300
  const height = el.offsetHeight || 200

  const margin = 12
  const footerReserve = 72

  const maxLeft = Math.max(margin, window.innerWidth - width - margin)
  const maxTop = Math.max(margin, window.innerHeight - height - footerReserve - margin)

  const nextLeft = Math.min(Math.max(position.value.left, margin), maxLeft)
  const nextTop = Math.min(Math.max(position.value.top, margin), maxTop)

  if (nextLeft !== position.value.left || nextTop !== position.value.top) {
    position.value.left = nextLeft
    position.value.top = nextTop
  }
}

const startDrag = (event: MouseEvent) => {
  if (event.button !== 0) return

  const target = event.target as HTMLElement | null
  const isInHeader = !!target?.closest('.draggable-div__header')
  const isResetAction = !!target?.closest('.draggable-div__action')

  if (isResetAction) return

  if (!isInHeader && target?.closest('button, a, input, textarea, select, .v-btn')) return

  isDragging = true
  // Calculate the offset of the cursor relative to the div
  offset.x = event.clientX - position.value.left
  offset.y = event.clientY - position.value.top

  event.preventDefault()

  // Add event listeners to handle dragging
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (event: MouseEvent) => {
  if (isDragging) {
    // Update the position of the div based on cursor movement
    position.value.left = event.clientX - offset.x
    position.value.top = event.clientY - offset.y
  }
}

const stopDrag = () => {
  isDragging = false

  // Remove event listeners when dragging ends
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)

  ensureInViewport()
}

const initPosition = () => {
  const draggable = rootEl.value
  const width = draggable?.offsetWidth || 300 // Default width if not available
  const height = draggable?.offsetHeight || 200 // Default height if not available

  const margin = 12
  const footerReserve = 72

  position.value = {
    top: window.innerHeight - height - footerReserve - margin,
    left: window.innerWidth - width - margin,
  }

  ensureInViewport()
}

const onRepositionRequest = () => {
  initPosition()
}

const onResize = () => {
  ensureInViewport()
}

const updatePresenceCount = (delta: number) => {
  if (!import.meta.client) return

  const w = window as any
  const next = Math.max(0, (w[DRAGGABLE_COUNT_KEY] ?? 0) + delta)
  w[DRAGGABLE_COUNT_KEY] = next

  window.dispatchEvent(new CustomEvent('nv-tm:draggable-presence', { detail: { count: next } }))
}

// Set initial coordinates based on the window size and the element's dimensions
onMounted(() => {
  initPosition()

  updatePresenceCount(1)
  window.addEventListener('nv-tm:draggable-reposition', onRepositionRequest)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('nv-tm:draggable-reposition', onRepositionRequest)
  window.removeEventListener('resize', onResize)

  updatePresenceCount(-1)
})
</script>

<style scoped>
/* Optional styling to prevent the div from going off the screen */
.draggable-div {
  position: fixed; /* Use absolute to allow free placement */
  z-index: 2500;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(var(--v-theme-surface), 0.86);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.18);
  color: rgb(var(--v-theme-on-surface));
  transition: box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.22),
    0 1px 0 rgba(255, 255, 255, 0.08) inset;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  user-select: none;
  max-width: min(420px, calc(100vw - 24px));
}


.draggable-div__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  padding: 4px 6px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  cursor: grab;
}

.draggable-div__header:active {
  cursor: grabbing;
}

.draggable-div__handle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
}

.draggable-div__actions {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.draggable-div__action {
  cursor: pointer;
}
</style>
