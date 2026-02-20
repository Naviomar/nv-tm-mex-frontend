<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {{ label }}
    </label>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :readonly="readonly"
      class="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-700 px-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
      :class="[readonly ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 cursor-not-allowed' : 'bg-white dark:bg-zinc-950']"
      v-bind="$attrs"
      @input="onInput"
    />
    <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
  </div>
</template>
<script setup lang="ts">
defineOptions({ name: 'Input', inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    type?: string
    placeholder?: string
    readonly?: boolean
    error?: string
  }>(),
  { type: 'text' }
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void; (e: 'input', ev: Event): void }>()

function onInput(ev: Event) {
  const target = ev.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', ev)
}
</script>
