<template>
  <Card class="relative">
    <h2 class="text-overline px-3 pt-3">{{ title }}</h2>
    <div class="p-4">
      <div class="text-blue-900 dark:text-blue-200 text-5xl font-bold z-10 relative">
        {{ value }}
      </div>
      <div class="text-xs font-bold">{{ subtitle }}</div>
      <span
        :class="['mdi', icon, 'absolute right-4 top-1/2 -translate-y-1/2 text-[64px] opacity-30 z-0', iconColorClass]"
        aria-hidden="true"
      />
      <slot name="actions" />
    </div>
    <div
      v-if="$slots.footer"
      class="border-t border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400"
    >
      <slot name="footer" />
    </div>
  </Card>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    value: number | string
    subtitle: string
    icon: string
    iconColor?: 'default' | 'red' | 'orange'
  }>(),
  { iconColor: 'default' }
)

const iconColorClass = computed(() => {
  switch (props.iconColor) {
    case 'red':
      return 'text-red-500'
    case 'orange':
      return 'text-orange-500'
    default:
      return 'text-blue-900/80 dark:text-blue-200/80'
  }
})
</script>
