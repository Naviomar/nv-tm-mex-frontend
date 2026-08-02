<template>
  <div>
    <div class="flex items-center justify-end gap-2 mb-2">
      <v-chip v-if="isCustomized" size="x-small" color="primary" variant="tonal"> Custom layout </v-chip>
      <v-menu :close-on-content-click="false" location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" size="small" variant="tonal" prepend-icon="mdi-view-grid-plus-outline">
            Layout
          </v-btn>
        </template>
        <v-card width="360">
          <div class="px-3 pt-3 pb-1 text-subtitle-2 font-weight-bold">Customize layout</div>
          <div class="px-3 pb-1 text-caption text-medium-emphasis">
            Drag filters by their handle to reorder them. Changes apply instantly.
          </div>

          <div class="px-3 pt-2 text-caption font-weight-bold text-uppercase text-medium-emphasis">Active filters</div>
          <TransitionGroup tag="div" name="layout-list" class="py-1" @dragleave="onListDragLeave">
            <div
              v-for="(item, index) in items"
              :key="item.key"
              class="layout-row draggable"
              :class="{
                dragging: draggedKey === item.key,
                'drop-before': dropIndicator?.index === index && !dropIndicator.after,
                'drop-after': dropIndicator?.index === index && dropIndicator.after,
              }"
              draggable="true"
              title="Drag to reorder"
              @dragstart="onDragStart(item.key, $event)"
              @dragover="onDragOver(index, item.key, $event)"
              @drop="onDrop"
              @dragend="onDragEnd"
            >
              <v-icon size="18" class="drag-handle"> mdi-drag-vertical </v-icon>
              <span class="layout-label">{{ labelOf(item.key) }}</span>
              <input
                v-model.number="item.span"
                type="number"
                :min="MIN_SPAN"
                :max="MAX_SPAN"
                class="span-input"
                title="Columns (1-12)"
                @change="clampItemSpan(item)"
              />
              <v-btn
                icon="mdi-eye-off-outline"
                size="x-small"
                variant="text"
                density="compact"
                title="Hide filter"
                @click="hideFilter(item.key)"
              />
            </div>
          </TransitionGroup>

          <div class="px-3 pt-2 text-caption font-weight-bold text-uppercase text-medium-emphasis">
            Available filters
          </div>
          <div class="py-1">
            <div v-for="filterDef in hiddenFilters" :key="`available-${filterDef.key}`" class="layout-row">
              <v-icon size="18" class="drag-handle-disabled"> mdi-drag-vertical </v-icon>
              <span class="layout-label text-medium-emphasis">{{ filterDef.label }}</span>
              <v-btn
                icon="mdi-plus"
                size="x-small"
                variant="text"
                density="compact"
                color="primary"
                title="Add filter"
                @click="addFilter(filterDef.key)"
              />
            </div>
            <div v-if="hiddenFilters.length === 0" class="px-3 py-2 text-caption text-medium-emphasis">
              All filters are visible
            </div>
          </div>

          <v-divider />
          <v-btn block size="small" variant="text" prepend-icon="mdi-restore" @click="resetLayout">
            Reset to default layout
          </v-btn>
        </v-card>
      </v-menu>
    </div>

    <TransitionGroup tag="div" name="filter-grid" class="grid grid-cols-1 md:grid-cols-12 gap-2" @before-leave="onBeforeLeave">
      <div v-for="item in items" :key="item.key" class="filter-grid-item" :style="{ '--filter-span': item.span }">
        <slot :name="item.key" />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
export interface FilterLayoutDef {
  /** Unique key, must match the slot name that renders the filter input */
  key: string
  /** Human readable name shown in the layout menu */
  label: string
  /** Default width in grid columns (1-12) */
  span?: number
  /** Whether the filter is visible in the default layout (default: true) */
  visible?: boolean
}

interface LayoutItem {
  key: string
  span: number
}

interface DropIndicator {
  index: number
  after: boolean
}

const MIN_SPAN = 1
const MAX_SPAN = 12

const props = defineProps<{
  /** Registry of every filter that can be shown, in default order */
  filters: FilterLayoutDef[]
  /** localStorage key used to persist the user's layout */
  storageKey: string
}>()

const emit = defineEmits<{
  /** Fired when a filter is hidden so the parent can clear its model values */
  (e: 'hide', key: string): void
}>()

const clampSpan = (span: any): number => {
  const value = Number(span)
  if (isNaN(value)) return 2
  return Math.min(MAX_SPAN, Math.max(MIN_SPAN, Math.round(value)))
}

const buildDefaults = (): LayoutItem[] =>
  props.filters.filter((f) => f.visible !== false).map((f) => ({ key: f.key, span: clampSpan(f.span ?? 2) }))

const loadLayout = (): LayoutItem[] => {
  const defaults = buildDefaults()
  try {
    const raw = localStorage.getItem(props.storageKey)
    if (!raw) return defaults
    const saved = JSON.parse(raw) as LayoutItem[]
    if (!Array.isArray(saved)) return defaults

    const registryKeys = new Set(props.filters.map((f) => f.key))
    const savedKeys = new Set(saved.map((s) => s.key))

    // Keep saved order/spans, dropping filters that no longer exist
    const merged = saved
      .filter((s) => registryKeys.has(s.key))
      .map((s) => ({ key: s.key, span: clampSpan(s.span) }))

    // Append registry filters that are visible by default but are not in the
    // saved layout (e.g. filters added to the codebase after the user saved)
    for (const def of defaults) {
      if (!savedKeys.has(def.key)) merged.push(def)
    }

    return merged.length > 0 ? merged : defaults
  } catch {
    return defaults
  }
}

const items = ref<LayoutItem[]>(buildDefaults())
const draggedKey = ref<string | null>(null)
const dropIndicator = ref<DropIndicator | null>(null)

onMounted(() => {
  items.value = loadLayout()
})

watch(
  items,
  (value) => {
    try {
      localStorage.setItem(props.storageKey, JSON.stringify(value))
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  },
  { deep: true }
)

const labelOf = (key: string): string => props.filters.find((f) => f.key === key)?.label || key

const hiddenFilters = computed(() => {
  const visibleKeys = new Set(items.value.map((i) => i.key))
  return props.filters.filter((f) => !visibleKeys.has(f.key))
})

const isCustomized = computed(() => {
  const defaults = buildDefaults()
  if (defaults.length !== items.value.length) return true
  return defaults.some((d, index) => {
    const item = items.value[index]
    return !item || item.key !== d.key || item.span !== d.span
  })
})

const addFilter = (key: string) => {
  const def = props.filters.find((f) => f.key === key)
  if (!def) return
  items.value.push({ key, span: clampSpan(def.span ?? 2) })
}

const hideFilter = (key: string) => {
  const index = items.value.findIndex((i) => i.key === key)
  if (index === -1) return
  items.value.splice(index, 1)
  emit('hide', key)
}

const clampItemSpan = (item: LayoutItem) => {
  item.span = clampSpan(item.span)
}

const resetLayout = () => {
  items.value = buildDefaults()
}

const onDragStart = (key: string, event: DragEvent) => {
  // Let interactive elements (span input, buttons) work normally: no drag from them
  const target = event.target as HTMLElement
  if (target.closest('button, input, a, .v-btn')) {
    event.preventDefault()
    return
  }
  draggedKey.value = key
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', key)
    // Use the whole row as the drag image
    const row = target.closest('.layout-row')
    if (row) {
      event.dataTransfer.setDragImage(row as HTMLElement, 20, 16)
    }
  }
}

// While dragging, only show an insertion line — never mutate the list,
// otherwise the rows jump around on every dragover event ("crazy" animation).
const onDragOver = (index: number, targetKey: string, event: DragEvent) => {
  if (!draggedKey.value) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  if (targetKey === draggedKey.value) {
    dropIndicator.value = null
    return
  }

  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  dropIndicator.value = {
    index,
    after: event.clientY > rect.top + rect.height / 2,
  }
}

// Commit the reorder exactly once, when the user drops the row
const onDrop = (event: DragEvent) => {
  event.preventDefault()
  const indicator = dropIndicator.value
  if (indicator && draggedKey.value) {
    const fromIndex = items.value.findIndex((i) => i.key === draggedKey.value)
    if (fromIndex !== -1) {
      let insertAt = indicator.after ? indicator.index + 1 : indicator.index
      const [moved] = items.value.splice(fromIndex, 1)
      if (fromIndex < insertAt) insertAt--
      items.value.splice(insertAt, 0, moved)
    }
  }
  dropIndicator.value = null
}

const onListDragLeave = (event: DragEvent) => {
  // Clear the indicator only when the cursor leaves the list container
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
    dropIndicator.value = null
  }
}

const onDragEnd = () => {
  draggedKey.value = null
  dropIndicator.value = null
}

// FLIP helper: keep leaving items in place while the grid reflows around them
const onBeforeLeave = (el: Element) => {
  const htmlEl = el as HTMLElement
  const { marginLeft, marginTop, width, height } = getComputedStyle(htmlEl)
  htmlEl.style.left = `${htmlEl.offsetLeft - parseFloat(marginLeft)}px`
  htmlEl.style.top = `${htmlEl.offsetTop - parseFloat(marginTop)}px`
  htmlEl.style.width = width
  htmlEl.style.height = height
}
</script>

<style scoped>
.filter-grid-item {
  position: relative;
  grid-column: span 1 / span 1;
  border-radius: 6px;
}

@media (min-width: 768px) {
  .filter-grid-item {
    grid-column: span var(--filter-span, 2) / span var(--filter-span, 2);
  }
}

/* Layout menu rows */
.layout-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  margin: 0 6px;
  transition: background-color 0.15s ease;
}

.layout-row.draggable {
  cursor: grab;
}

.layout-row.draggable:active {
  cursor: grabbing;
}

.layout-row:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.layout-row.dragging {
  opacity: 0.4;
}

/* Insertion line shown while dragging (no list mutation until drop) */
.layout-row.drop-before {
  box-shadow: inset 0 2px 0 0 rgb(var(--v-theme-primary));
}

.layout-row.drop-after {
  box-shadow: inset 0 -2px 0 0 rgb(var(--v-theme-primary));
}

.drag-handle {
  cursor: grab;
  color: rgba(var(--v-theme-on-surface), 0.45);
  flex-shrink: 0;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle-disabled {
  color: rgba(var(--v-theme-on-surface), 0.15);
  flex-shrink: 0;
}

.layout-label {
  flex: 1;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.span-input {
  width: 44px;
  padding: 2px 4px;
  font-size: 0.75rem;
  text-align: center;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 4px;
  background: transparent;
  color: inherit;
}

.span-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
}

/* Reorder animation inside the layout menu (runs once per drop) */
.layout-list-move {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Grid add / remove / reorder animations */
.filter-grid-move {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.filter-grid-enter-active {
  transition:
    opacity 0.25s ease-out,
    transform 0.25s ease-out;
}

.filter-grid-leave-active {
  transition:
    opacity 0.2s ease-in,
    transform 0.2s ease-in;
  position: absolute;
}

.filter-grid-enter-from,
.filter-grid-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
