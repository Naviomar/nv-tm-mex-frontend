<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {{ label }}
    </label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :readonly="readonly"
      class="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 resize-y min-h-[80px]"
      v-bind="$attrs"
      @input="onInput"
    />
    <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
  </div>
</template>
<script setup lang="ts">
defineOptions({ name: 'Textarea', inheritAttrs: false })

withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    rows?: number
    readonly?: boolean
    error?: string
  }>(),
  { rows: 3 }
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

function onInput(ev: Event) {
  const target = ev.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>
