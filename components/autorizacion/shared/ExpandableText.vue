<template>
  <div v-if="text" class="exp-text">
    <div ref="el" class="exp-text__body" :class="{ 'exp-text__body--clamped': !isOpen }" :style="{ '--lines': lines }">{{ text }}</div>
    <button v-if="overflowing" class="exp-text__toggle" @click.stop="toggle">
      {{ isOpen ? 'Show less' : 'Show more' }}
    </button>
  </div>
  <span v-else class="text-caption text-disabled">{{ empty }}</span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{ text?: string | null; lines?: number; empty?: string; expanded?: boolean }>(),
  { lines: 3, empty: '—', expanded: undefined },
)
const emit = defineEmits<{ (e: 'update:expanded'): void; (e: 'truncated', value: boolean): void }>()

const el = ref<HTMLElement | null>(null)
const localOpen = ref(false)
const overflowing = ref(false)

// Controlled by the parent when `expanded` is passed (so a table can expand all rows)
const isOpen = computed(() => (props.expanded === undefined ? localOpen.value : props.expanded))
const toggle = () => (props.expanded === undefined ? (localOpen.value = !localOpen.value) : emit('update:expanded'))

const measure = () => {
  const node = el.value
  if (!node) return
  // Only measurable while clamped: scrollHeight > clientHeight means text is hidden
  if (!isOpen.value) {
    overflowing.value = node.scrollHeight > node.clientHeight + 1
    emit('truncated', overflowing.value)
  }
}

onMounted(() => nextTick(measure))
watch(() => props.text, () => nextTick(measure))
</script>

<style scoped>
.exp-text__body {
  font-size: 0.85rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}
.exp-text__body--clamped {
  display: -webkit-box;
  -webkit-line-clamp: var(--lines);
  line-clamp: var(--lines);
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.exp-text__toggle {
  margin-top: 2px;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
</style>
