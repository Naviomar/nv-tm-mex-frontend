<template>
  <span
    :class="[
      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
      variantClass,
    ]"
  >
    <slot />
  </span>
</template>
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'success' | 'error' | 'warning'
  }>(),
  { variant: 'default' }
)

const variantClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    case 'warning':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    default:
      return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
  }
})
</script>
