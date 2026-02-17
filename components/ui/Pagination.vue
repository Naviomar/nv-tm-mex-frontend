<template>
  <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-center gap-1.5 py-2">
    <button
      type="button"
      class="h-8 shrink-0 rounded-md px-3 text-sm font-medium border border-zinc-300 dark:border-zinc-600 bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
      :disabled="currentPage <= 1"
      aria-label="Previous page"
      @click="$emit('update:currentPage', currentPage - 1)"
    >
      Previous
    </button>
    <template v-for="(p, idx) in pages" :key="p === '…' ? `e-${idx}` : p">
      <button
        v-if="p !== '…'"
        type="button"
        class="h-8 min-w-[2rem] rounded-md px-2 text-sm font-medium transition-colors"
        :class="p === currentPage ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'border border-zinc-300 dark:border-zinc-600 bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'"
        @click="$emit('update:currentPage', p)"
      >
        {{ p }}
      </button>
      <span v-else class="px-1 text-zinc-400">…</span>
    </template>
    <button
      type="button"
      class="h-8 shrink-0 rounded-md px-3 text-sm font-medium border border-zinc-300 dark:border-zinc-600 bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
      :disabled="currentPage >= totalPages"
      aria-label="Next page"
      @click="$emit('update:currentPage', currentPage + 1)"
    >
      Next
    </button>
  </div>
</template>
<script setup lang="ts">
defineOptions({ name: 'Pagination' })

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{ (e: 'update:currentPage', page: number): void }>()

const pages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
})
</script>
