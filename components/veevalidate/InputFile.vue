<template>
  <div
    class="input-file-dropzone"
    :class="{ 'input-file-dropzone--dragging': isDragging }"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <v-file-input
      v-model="value"
      :label="label"
      :error-messages="errorMessage"
      :multiple="multiple"
      :variant="variant"
      :density="density"
      @change="onchangeEmit"
    />
  </div>
</template>

<script setup>
import { useField } from 'vee-validate'
import { ref } from 'vue'

const props = defineProps({
  name: String,
  type: String,
  label: String,
  multiple: Boolean || false,
  variant: String || 'flat',
  density: String,
})

const emit = defineEmits(['onchange'])

const onchangeEmit = (e) => {
  emit('onchange', e)
}

// The `name` is returned in a function because we want to make sure it stays reactive
// If the name changes you want `useField` to be able to pick it up
const { value, errorMessage } = useField(() => props.name)

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

  value.value = props.multiple ? files : files[0]
  emit('onchange', { target: { files } })
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
