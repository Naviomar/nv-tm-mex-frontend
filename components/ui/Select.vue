<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {{ label }}
    </label>
    <select
      :value="modelValue"
      class="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
      v-bind="$attrs"
      @change="onChange"
    >
      <slot />
    </select>
  </div>
</template>
<script setup lang="ts">
defineOptions({ name: 'Select', inheritAttrs: false })

defineProps<{
  modelValue?: string | number | null
  label?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number | null): void }>()

function onChange(ev: Event) {
  const target = ev.target as HTMLSelectElement
  const raw = target.value
  const num = Number(raw)
  emit('update:modelValue', raw === '' ? null : Number.isNaN(num) ? raw : num)
}
</script>
