<template>
  <div
    class="input-file-dropzone"
    :class="{ 'input-file-dropzone--dragging': isDragging }"
    @dragenter.capture.stop.prevent="onDragEnter"
    @dragover.capture.stop.prevent="onDragEnter"
    @dragleave.capture.stop.prevent="onDragLeave"
    @drop.capture.stop.prevent="onDrop"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  multiple: Boolean,
})

const emit = defineEmits(['drop-files'])

const isDragging = ref(false)
let dragCounter = 0

const onDragEnter = () => {
  dragCounter++
  isDragging.value = true
}

const onDragLeave = () => {
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    isDragging.value = false
  }
}

const onDrop = (e) => {
  dragCounter = 0
  isDragging.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  if (!files.length) return

  emit('drop-files', props.multiple ? files : files[0])
}
</script>

<style scoped>
.input-file-dropzone {
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 2px;
  transition: background-color 0.15s ease, outline-color 0.15s ease;
  outline: 2px dashed rgba(var(--v-theme-on-surface), 0.3);
  outline-offset: -2px;
}

.input-file-dropzone :deep(.v-input) {
  width: 100%;
}

.input-file-dropzone--dragging {
  outline-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
