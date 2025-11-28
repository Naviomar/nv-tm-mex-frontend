<template>
  <div
    class="fixed bg-neutral-400/90 p-2 cursor-move"
    :style="{ top: position.top + 'px', left: position.left + 'px' }"
    @mousedown="startDrag"
  >
    <div class="fixed">
      <v-icon>mdi-drag</v-icon>
      <v-icon @click="initPosition">mdi-target</v-icon>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// Initial position of the div
const position = ref({ top: 100, left: 100 })
let isDragging = false
let offset = { x: 0, y: 0 }

const startDrag = (event: any) => {
  isDragging = true
  // Calculate the offset of the cursor relative to the div
  offset.x = event.clientX - position.value.left
  offset.y = event.clientY - position.value.top

  // Add event listeners to handle dragging
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (event: any) => {
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
}

const initPosition = () => {
  const draggable = document.querySelector('.fixed') as HTMLElement
  const width = draggable?.offsetWidth || 300 // Default width if not available
  const height = draggable?.offsetHeight || 200 // Default height if not available

  position.value = {
    top: window.innerHeight - height - 60, // Bottom padding of 20px
    left: window.innerWidth - width - 20, // Right padding of 20px
  }
}

// Set initial coordinates based on the window size and the element's dimensions
onMounted(() => {
  initPosition()
})
</script>

<style scoped>
/* Optional styling to prevent the div from going off the screen */
.fixed {
  position: fixed; /* Use absolute to allow free placement */
}
</style>
