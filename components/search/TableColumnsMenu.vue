<template>
  <v-menu :close-on-content-click="false" location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-btn v-bind="menuProps" size="small" variant="tonal" prepend-icon="mdi-table-column-plus-after">
        Columns
        <v-chip v-if="state.isCustomized.value" size="x-small" color="primary" variant="tonal" class="ml-1">
          Custom
        </v-chip>
      </v-btn>
    </template>
    <v-card width="320">
      <div class="px-3 pt-3 pb-1 text-subtitle-2 font-weight-bold">Customize columns</div>
      <div class="px-3 pb-1 text-caption text-medium-emphasis">
        Drag rows to reorder, toggle the eye to show or hide. Changes apply instantly.
      </div>

      <TransitionGroup tag="div" name="columns-list" class="py-1" @dragleave="onListDragLeave">
        <div
          v-for="(item, index) in state.items.value"
          :key="item.key"
          class="column-row"
          :class="{
            draggable: !state.isLocked(item.key),
            dragging: draggedKey === item.key,
            'drop-before': dropIndicator?.index === index && !dropIndicator.after,
            'drop-after': dropIndicator?.index === index && dropIndicator.after,
            'is-hidden': !item.visible,
          }"
          :draggable="!state.isLocked(item.key)"
          @dragstart="onDragStart(item.key, $event)"
          @dragover="onDragOver(index, item.key, $event)"
          @drop="onDrop"
          @dragend="onDragEnd"
        >
          <v-icon size="18" class="drag-handle">
            {{ state.isLocked(item.key) ? 'mdi-lock-outline' : 'mdi-drag-vertical' }}
          </v-icon>
          <span class="column-label">{{ labelOf(item.key) }}</span>
          <v-btn
            :icon="item.visible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
            size="x-small"
            variant="text"
            density="compact"
            :color="item.visible ? undefined : 'grey'"
            :disabled="state.isLocked(item.key)"
            :title="item.visible ? 'Hide column' : 'Show column'"
            @click="state.toggleColumn(item.key)"
          />
        </div>
      </TransitionGroup>

      <v-divider />
      <v-btn block size="small" variant="text" prepend-icon="mdi-restore" @click="state.resetColumns">
        Reset to default columns
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import type { TableColumnDef } from '~/composables/useTableColumns'

interface DropIndicator {
  index: number
  after: boolean
}

const props = defineProps<{
  /** State returned by useTableColumns (shared with the table) */
  state: ReturnType<typeof useTableColumns>
}>()

const draggedKey = ref<string | null>(null)
const dropIndicator = ref<DropIndicator | null>(null)

const labelOf = (key: string): string =>
  props.state.allowedDefs.value.find((d: TableColumnDef) => d.key === key)?.label || key

const onDragStart = (key: string, event: DragEvent) => {
  // Let interactive elements (buttons) work normally: no drag from them
  const target = event.target as HTMLElement
  if (target.closest('button, input, a')) {
    event.preventDefault()
    return
  }
  draggedKey.value = key
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', key)
    const row = target.closest('.column-row')
    if (row) {
      event.dataTransfer.setDragImage(row as HTMLElement, 20, 16)
    }
  }
}

// While dragging, only show an insertion line — never mutate the list,
// otherwise the rows jump around on every dragover event.
const onDragOver = (index: number, targetKey: string, event: DragEvent) => {
  if (!draggedKey.value) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  if (targetKey === draggedKey.value || props.state.isLocked(targetKey)) {
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
    props.state.moveColumn(draggedKey.value, indicator.after ? indicator.index + 1 : indicator.index)
  }
  dropIndicator.value = null
}

const onListDragLeave = (event: DragEvent) => {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
    dropIndicator.value = null
  }
}

const onDragEnd = () => {
  draggedKey.value = null
  dropIndicator.value = null
}
</script>

<style scoped>
.column-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  margin: 0 6px;
  transition: background-color 0.15s ease;
}

.column-row.draggable {
  cursor: grab;
}

.column-row.draggable:active {
  cursor: grabbing;
}

.column-row:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.column-row.dragging {
  opacity: 0.4;
}

.column-row.drop-before {
  box-shadow: inset 0 2px 0 0 rgb(var(--v-theme-primary));
}

.column-row.drop-after {
  box-shadow: inset 0 -2px 0 0 rgb(var(--v-theme-primary));
}

.drag-handle {
  color: rgba(var(--v-theme-on-surface), 0.45);
  flex-shrink: 0;
}

.column-label {
  flex: 1;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.column-row.is-hidden .column-label {
  color: rgba(var(--v-theme-on-surface), 0.45);
}

/* Reorder animation (runs once per drop) */
.columns-list-move {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
