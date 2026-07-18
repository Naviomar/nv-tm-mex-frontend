<template>
  <div>
    <!-- Assigned notifications, organized like To / Cc / Bcc lanes -->
    <div class="lanes-grid mb-5">
      <div v-for="lane in lanes" :key="lane.type" class="lane-card">
        <div class="lane-header" :style="{ color: lane.hex }">
          <v-icon size="16" :color="lane.hex">{{ lane.icon }}</v-icon>
          <span class="lane-title">{{ lane.label }}</span>
          <v-chip size="x-small" :color="lane.hex" variant="flat" class="ml-auto text-white">
            {{ assignedTo(lane.type).length }}
          </v-chip>
        </div>

        <div class="lane-body">
          <div v-if="assignedTo(lane.type).length === 0" class="lane-empty">
            No notifications assigned
          </div>
          <div v-else class="d-flex flex-wrap gap-1">
            <v-chip
              v-for="n in assignedTo(lane.type)"
              :key="n.id"
              size="small"
              class="wrap-chip"
              :style="{ backgroundColor: lane.hex, color: 'white' }"
              @click="cycleType(n.id)"
            >
              <span>{{ humanize(n.short_name) }}</span>
              <v-icon size="14" class="ml-1 flex-shrink-0" @click.stop="setType(n.id, '')">mdi-close</v-icon>
            </v-chip>
          </div>

          <v-autocomplete
            :model-value="null"
            :items="unassignedNotifications"
            :item-title="(n) => humanize(n.short_name)"
            item-value="id"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            :placeholder="`+ Add to ${lane.label}`"
            class="mt-2 lane-add"
            @update:model-value="(id) => id && setType(id, lane.type)"
          />
        </div>
      </div>
    </div>

    <p class="text-caption text-medium-emphasis mb-2">
      Click a chip to cycle it between To / Cc / Bcc, or use the × to remove it.
    </p>

    <!-- Browse & bulk-add -->
    <div class="browse-toggle mb-3 d-flex align-center justify-space-between flex-wrap gap-2">
      <v-btn variant="text" size="small" density="compact" @click="browseOpen = !browseOpen">
        <v-icon start size="16" :class="{ 'rotate-180': browseOpen }">mdi-chevron-down</v-icon>
        Browse all notifications
        <v-chip size="x-small" variant="tonal" class="ml-2">{{ notifications.length }}</v-chip>
      </v-btn>
      <div v-if="browseOpen" class="d-flex align-center gap-2">
        <span class="text-caption text-medium-emphasis">{{ visibleAssignedCount }}/{{ visibleNotifications.length }} shown are assigned</span>
        <v-btn size="x-small" variant="tonal" @click="selectAllVisible">Add all shown as To</v-btn>
        <v-btn size="x-small" variant="tonal" @click="clearVisible">Clear shown</v-btn>
      </div>
    </div>

    <div v-show="browseOpen">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search by name or description..."
        density="compact"
        hide-details
        clearable
        variant="outlined"
        class="mb-4"
      />

      <div v-if="filteredGroups.length === 0" class="text-center py-8 text-grey">
        <v-icon size="48" color="grey-lighten-1">mdi-email-off-outline</v-icon>
        <div class="mt-2">No notifications found</div>
      </div>

      <div v-for="group in filteredGroups" :key="group.label" class="mb-3 group-wrapper">
        <div
          class="group-header d-flex align-center justify-space-between px-3 py-2 cursor-pointer"
          @click="toggleGroup(group.label)"
        >
          <div class="d-flex align-center gap-2">
            <v-icon
              size="18"
              class="group-chevron"
              :class="{ 'group-chevron--collapsed': collapsedGroups.includes(group.label) }"
            >mdi-chevron-down</v-icon>
            <span class="group-label">{{ group.label }}</span>
            <v-chip
              size="x-small"
              :color="countSelected(group) > 0 ? 'primary' : 'grey'"
              :variant="countSelected(group) > 0 ? 'flat' : 'tonal'"
            >
              {{ countSelected(group) }}/{{ group.notifications.length }}
            </v-chip>
          </div>
          <v-checkbox
            :model-value="isGroupAllSelected(group)"
            :indeterminate="isGroupPartiallySelected(group)"
            color="primary"
            hide-details
            density="compact"
            class="flex-grow-0"
            @update:model-value="(v) => toggleGroup_selectAll(group, v)"
            @click.stop
          />
        </div>

        <div v-if="!collapsedGroups.includes(group.label)" class="group-body">
          <div
            v-for="notification in group.notifications"
            :key="notification.id"
            class="browse-row"
            :class="{ 'browse-row--active': !!typeOf(notification.id) }"
            @click="toggleQuickAdd(notification.id)"
          >
            <v-icon
              size="20"
              :color="typeOf(notification.id) ? laneColor(typeOf(notification.id)) : 'grey-lighten-1'"
              class="flex-shrink-0"
            >
              {{ typeOf(notification.id) ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}
            </v-icon>
            <div class="browse-row-text">
              <div class="browse-row-name">{{ humanize(notification.short_name) }}</div>
              <div v-if="notification.description" class="browse-row-desc">{{ notification.description }}</div>
            </div>
            <v-chip
              v-if="typeOf(notification.id)"
              size="x-small"
              :style="{ backgroundColor: laneColor(typeOf(notification.id)), color: 'white' }"
              class="flex-shrink-0"
            >
              {{ typeOf(notification.id) }}
            </v-chip>
            <span v-else class="browse-row-add flex-shrink-0">+ Add</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NotificationItem {
  id: number
  short_name: string
  description?: string | null
  [key: string]: any
}

interface Group {
  label: string
  notifications: NotificationItem[]
}

const props = defineProps<{
  notifications: NotificationItem[]
  modelValue: Record<number, string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: Record<number, string>): void
}>()

const search = ref('')
const collapsedGroups = ref<string[]>([])
const browseOpen = ref(true)

const lanes = [
  { type: 'TO', label: 'To', icon: 'mdi-email-arrow-right-outline', hex: '#2563eb' },
  { type: 'CC', label: 'Cc', icon: 'mdi-email-multiple-outline', hex: '#d97706' },
  { type: 'BCC', label: 'Bcc', icon: 'mdi-email-lock-outline', hex: '#7c3aed' },
]
const laneOrder = ['TO', 'CC', 'BCC']

function laneColor(type: string): string {
  return lanes.find((l) => l.type === type)?.hex || '#6b7280'
}

function humanize(shortName: string): string {
  return (shortName || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2')
}

function groupLabel(shortName: string): string {
  return humanize(shortName).split(' ')[0] || 'Other'
}

function typeOf(id: number): string {
  return props.modelValue[id] || ''
}

const assignedTo = (type: string) => props.notifications.filter((n) => typeOf(n.id) === type)

const unassignedNotifications = computed(() => props.notifications.filter((n) => !typeOf(n.id)))

function setType(id: number, type: string) {
  emit('update:modelValue', { ...props.modelValue, [id]: type || '' })
}

function cycleType(id: number) {
  const current = typeOf(id)
  const idx = laneOrder.indexOf(current)
  const next = idx === -1 || idx === laneOrder.length - 1 ? '' : laneOrder[idx + 1]
  setType(id, next)
}

function toggleQuickAdd(id: number) {
  setType(id, typeOf(id) ? '' : 'TO')
}

const grouped = computed((): Group[] => {
  const groupMap: Record<string, NotificationItem[]> = {}

  for (const n of props.notifications) {
    const label = groupLabel(n.short_name)
    if (!groupMap[label]) groupMap[label] = []
    groupMap[label].push(n)
  }

  return Object.entries(groupMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, notifications]) => ({ label, notifications }))
})

const filteredGroups = computed((): Group[] => {
  if (!search.value) return grouped.value
  const q = search.value.toLowerCase()
  return grouped.value
    .map((g) => ({
      ...g,
      notifications: g.notifications.filter(
        (n) =>
          n.short_name.toLowerCase().includes(q) ||
          humanize(n.short_name).toLowerCase().includes(q) ||
          (n.description ?? '').toLowerCase().includes(q)
      ),
    }))
    .filter((g) => g.notifications.length > 0)
})

function toggleGroup(label: string) {
  const idx = collapsedGroups.value.indexOf(label)
  if (idx >= 0) collapsedGroups.value.splice(idx, 1)
  else collapsedGroups.value.push(label)
}

function countSelected(group: Group): number {
  return group.notifications.filter((n) => typeOf(n.id) !== '').length
}

function isGroupAllSelected(group: Group): boolean {
  return group.notifications.length > 0 && group.notifications.every((n) => typeOf(n.id) !== '')
}

function isGroupPartiallySelected(group: Group): boolean {
  const selected = countSelected(group)
  return selected > 0 && selected < group.notifications.length
}

function toggleGroup_selectAll(group: Group, checked: boolean | null) {
  const updated = { ...props.modelValue }
  group.notifications.forEach((n) => {
    updated[n.id] = checked ? 'TO' : ''
  })
  emit('update:modelValue', updated)
}

const visibleNotifications = computed(() => filteredGroups.value.flatMap((g) => g.notifications))

const visibleAssignedCount = computed(() => visibleNotifications.value.filter((n) => !!typeOf(n.id)).length)

function selectAllVisible() {
  const updated = { ...props.modelValue }
  visibleNotifications.value.forEach((n) => {
    updated[n.id] = 'TO'
  })
  emit('update:modelValue', updated)
}

function clearVisible() {
  const updated = { ...props.modelValue }
  visibleNotifications.value.forEach((n) => {
    updated[n.id] = ''
  })
  emit('update:modelValue', updated)
}
</script>

<style scoped>
.lanes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.lane-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  padding: 12px;
  background: rgb(var(--v-theme-surface));
}

.lane-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 10px;
}

.lane-body {
  min-height: 56px;
}

.lane-empty {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  padding: 4px 0 8px;
}

.lane-add :deep(.v-field) {
  font-size: 0.82rem;
}

.wrap-chip {
  height: auto !important;
  white-space: normal !important;
  padding-top: 6px;
  padding-bottom: 6px;
}
.wrap-chip :deep(.v-chip__content) {
  white-space: normal !important;
  flex-wrap: wrap;
  align-items: center;
  line-height: 1.3;
}

.browse-toggle .rotate-180 {
  transform: rotate(180deg);
}

.group-wrapper {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.group-header {
  background: rgba(var(--v-theme-primary), 0.06);
  transition: background-color 0.15s;
}
.group-header:hover {
  background: rgba(var(--v-theme-primary), 0.1);
}

.group-label {
  font-weight: 700;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.group-chevron {
  transition: transform 0.2s;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.group-chevron--collapsed {
  transform: rotate(-90deg);
}

.group-body {
  background: rgb(var(--v-theme-surface));
  padding: 4px 8px;
}

.browse-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s;
}
.browse-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.browse-row--active {
  background: rgba(var(--v-theme-primary), 0.05);
}
.browse-row-text {
  flex: 1 1 auto;
  min-width: 0;
}
.browse-row-name {
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.3;
}
.browse-row-desc {
  font-size: 0.74rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  line-height: 1.3;
  margin-top: 1px;
}
.browse-row-add {
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.4);
}
.browse-row:hover .browse-row-add {
  color: rgb(var(--v-theme-primary));
}
</style>
