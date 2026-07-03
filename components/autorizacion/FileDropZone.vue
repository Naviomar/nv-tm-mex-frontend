<template>
  <div class="mt-2">
    <div v-if="label" class="text-caption text-medium-emphasis mb-1">{{ label }}</div>
    <div
      class="fdz"
      :class="{ 'fdz-active': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="browse"
    >
      <v-icon size="26" :color="isDragging ? 'primary' : 'grey'">mdi-cloud-upload-outline</v-icon>
      <div class="text-caption text-medium-emphasis">
        Drag &amp; drop files here or <span class="text-primary font-weight-medium">browse</span>
      </div>
      <input ref="inputRef" type="file" multiple class="d-none" :accept="accept" @change="onSelect" />
    </div>

    <div v-if="modelValue.length > 0" class="mt-2 d-flex flex-wrap ga-1">
      <v-chip
        v-for="(file, idx) in modelValue"
        :key="`${file.name}-${idx}`"
        size="small"
        variant="tonal"
        color="primary"
        closable
        @click:close="removeFile(idx)"
      >
        <v-icon start size="14">mdi-paperclip</v-icon>
        {{ file.name }}
        <span class="text-caption text-medium-emphasis ml-1">({{ formatSize(file.size) }})</span>
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: File[]
    label?: string
    accept?: string
  }>(),
  {
    label: 'Supporting documents',
    accept: '.pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx,.csv,.txt',
  }
)

const emit = defineEmits<{ 'update:modelValue': [files: File[]] }>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const browse = () => inputRef.value?.click()

const addFiles = (list: FileList | null) => {
  if (!list) return
  const merged = [...props.modelValue]
  for (const file of Array.from(list)) {
    // Skip duplicates by name + size
    if (!merged.some((f) => f.name === file.name && f.size === file.size)) {
      merged.push(file)
    }
  }
  emit('update:modelValue', merged)
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  addFiles(e.dataTransfer?.files ?? null)
}

const onSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  addFiles(input.files)
  input.value = ''
}

const removeFile = (idx: number) => {
  const next = [...props.modelValue]
  next.splice(idx, 1)
  emit('update:modelValue', next)
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
.fdz {
  border: 2px dashed rgba(var(--v-border-color), 0.4);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.fdz:hover,
.fdz-active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
