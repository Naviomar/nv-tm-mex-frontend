<template>
  <Card class="relative">
    <h2 class="text-overline px-3 pt-3">{{ title.toUpperCase() }}</h2>
    <div class="p-4">
      <div class="text-blue-900 dark:text-blue-200 text-2xl font-bold mb-2">
        {{ formatToCurrency(amount) ?? '0.00' }}
      </div>
      <div class="text-green-700 dark:text-green-400 text-sm">Paid: {{ formatToCurrency(paid) ?? '0.00' }}</div>
      <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{{ subtitle }}</div>
      <span
        :class="['mdi', icon, 'absolute right-4 top-1/2 -translate-y-1/2 text-[48px] opacity-10 z-0 text-blue-900/80 dark:text-blue-200/80']"
        aria-hidden="true"
      />
    </div>
  </Card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle: string
    amount?: number | string
    paid?: number
    icon?: string
  }>(),
  { icon: 'mdi-file-document-outline' }
)
</script>
