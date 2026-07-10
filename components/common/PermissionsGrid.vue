<template>
  <div>
    <!-- Search -->
    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search permissions..."
      density="compact"
      hide-details
      clearable
      variant="outlined"
      class="mb-4"
    />

    <div v-if="filteredGroups.length === 0" class="text-center py-8 text-grey">
      <v-icon size="48" color="grey-lighten-1">mdi-key-off</v-icon>
      <div class="mt-2">No permissions found</div>
    </div>

    <!-- Groups -->
    <div v-for="group in filteredGroups" :key="group.label" class="mb-3 group-wrapper">
      <!-- Group header -->
      <div
        class="group-header d-flex align-center justify-space-between px-4 py-3 cursor-pointer"
        @click="toggleGroup(group.label)"
      >
        <div class="d-flex align-center gap-3">
          <v-icon
            size="16"
            color="white"
            class="group-chevron"
            :class="{ 'group-chevron--collapsed': collapsedGroups.includes(group.label) }"
          >mdi-chevron-down</v-icon>
          <span class="font-weight-bold text-white text-body-2 text-uppercase tracking-wide">
            {{ group.label }}
          </span>
          <v-chip
            v-if="!guide"
            size="x-small"
            :color="countSelected(group) > 0 ? 'white' : 'rgba(255,255,255,0.3)'"
            variant="flat"
            :class="countSelected(group) > 0 ? 'text-primary font-weight-bold' : 'text-white'"
          >
            {{ countSelected(group) }}/{{ countTotal(group) }}
          </v-chip>
          <v-chip v-else size="x-small" color="rgba(255,255,255,0.3)" variant="flat" class="text-white">
            {{ countTotal(group) }}
          </v-chip>
        </div>
        <v-checkbox
          v-if="!readonly && !guide"
          :model-value="isGroupAllSelected(group)"
          :indeterminate="isGroupPartiallySelected(group)"
          color="white"
          hide-details
          density="compact"
          class="flex-grow-0"
          @update:model-value="(v) => toggleGroup_selectAll(group, v)"
          @click.stop
        />
      </div>

      <div v-if="!collapsedGroups.includes(group.label)" class="group-body pa-4">
        <!-- Sub-groups -->
        <div v-for="sub in group.subgroups" :key="sub.label" class="mb-4">
          <div
            v-if="sub.label !== '__root__'"
            class="d-flex align-center justify-space-between mb-3"
          >
            <div class="d-flex align-center gap-2">
              <div class="subgroup-bar" />
              <span class="text-body-2 font-weight-semibold text-primary">
                {{ sub.label }}
              </span>
            </div>
            <v-checkbox
              v-if="!readonly && !guide"
              :model-value="isSubGroupAllSelected(sub)"
              :indeterminate="isSubGroupPartiallySelected(sub)"
              color="primary"
              hide-details
              density="compact"
              class="flex-grow-0"
              @update:model-value="(v) => toggleSubGroup_selectAll(sub, v)"
              @click.stop
            />
          </div>

          <!-- Guide mode: readable list with descriptions, no toggling -->
          <div v-if="guide" class="d-flex flex-column gap-2">
            <div
              v-for="perm in sub.permissions"
              :key="perm.id"
              class="guide-row pa-3 rounded-lg"
            >
              <div class="d-flex align-center gap-2">
                <span class="font-weight-medium text-body-2">{{ perm.humanLabel }}</span>
                <v-chip size="x-small" variant="text" class="text-grey px-0">{{ perm.name }}</v-chip>
              </div>
              <div class="text-caption text-grey-darken-1 mt-1">
                {{ perm.description || 'Sin descripción todavía.' }}
              </div>
            </div>
          </div>

          <div v-else class="d-flex flex-wrap gap-2">
            <div
              v-for="perm in sub.permissions"
              :key="perm.id"
              class="perm-chip d-flex align-center justify-space-between px-4 py-2 rounded-pill text-caption font-weight-medium"
              :class="[
                modelValue.includes(perm.id)
                  ? 'perm-chip--active'
                  : 'perm-chip--inactive',
                readonly ? 'perm-chip--readonly' : 'cursor-pointer',
              ]"
              @click="!readonly && toggle(perm.id, !modelValue.includes(perm.id))"
            >
              <span>{{ perm.humanLabel }}</span>
              <v-icon
                v-if="modelValue.includes(perm.id)"
                size="14"
                class="ml-2"
              >mdi-check</v-icon>
              <span v-else style="width: 14px; display: inline-block; margin-left: 8px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RawPermission {
  id: number
  name: string
  [key: string]: any
}

interface PermissionNode {
  id: number
  name: string
  humanLabel: string
  description?: string | null
}

interface SubGroup {
  label: string
  permissions: PermissionNode[]
}

interface Group {
  label: string
  subgroups: SubGroup[]
}

const props = defineProps<{
  permissions: RawPermission[]
  modelValue: number[]
  readonly?: boolean
  /** Read-only reference mode: shows name + description instead of toggleable chips. */
  guide?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: number[]): void
}>()

const search = ref('')
const collapsedGroups = ref<string[]>([])

function normalize(name: string): string[] {
  // Support both '-' and '.' as separators by splitting on either
  return name.split(/[-.]/)
}

function humanize(str: string): string {
  return str
    .split(/[-.]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

const grouped = computed((): Group[] => {
  const perms = props.permissions

  // Count 2-segment prefixes (normalized)
  const prefixCount: Record<string, number> = {}
  for (const p of perms) {
    const parts = normalize(p.name)
    if (parts.length >= 2) {
      const key = `${parts[0]}-${parts[1]}`
      prefixCount[key] = (prefixCount[key] ?? 0) + 1
    }
  }

  // Build tree
  const groupMap: Record<string, Record<string, PermissionNode[]>> = {}

  for (const p of perms) {
    const parts = normalize(p.name)
    const groupLabel = humanize(parts[0])

    let subLabel = '__root__'
    if (parts.length >= 2) {
      const prefix = `${parts[0]}-${parts[1]}`
      if (prefixCount[prefix] >= 2) {
        subLabel = humanize(parts[1])
      }
    }

    if (!groupMap[groupLabel]) groupMap[groupLabel] = {}
    if (!groupMap[groupLabel][subLabel]) groupMap[groupLabel][subLabel] = []

    // Human label = everything except the already-used group/subgroup prefix
    let labelParts = parts.slice(1)
    if (subLabel !== '__root__') labelParts = parts.slice(2)
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
    const humanLabel = (labelParts.length > 0 ? labelParts : [parts[parts.length - 1]])
      .map(capitalize)
      .join(' ')

    groupMap[groupLabel][subLabel].push({ id: p.id, name: p.name, humanLabel, description: p.description })
  }

  return Object.entries(groupMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, subs]) => ({
      label,
      subgroups: Object.entries(subs)
        .sort(([a], [b]) => {
          if (a === '__root__') return -1
          if (b === '__root__') return 1
          return a.localeCompare(b)
        })
        .map(([subLabel, permissions]) => ({ label: subLabel, permissions })),
    }))
})

const filteredGroups = computed((): Group[] => {
  if (!search.value) return grouped.value
  const q = search.value.toLowerCase()
  return grouped.value
    .map((g) => ({
      ...g,
      subgroups: g.subgroups
        .map((s) => ({
          ...s,
          permissions: s.permissions.filter((p) => p.name.toLowerCase().includes(q) || p.humanLabel.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)),
        }))
        .filter((s) => s.permissions.length > 0),
    }))
    .filter((g) => g.subgroups.length > 0)
})

function toggleGroup(label: string) {
  const idx = collapsedGroups.value.indexOf(label)
  if (idx >= 0) collapsedGroups.value.splice(idx, 1)
  else collapsedGroups.value.push(label)
}

function toggle(id: number, checked: boolean | null) {
  if (props.readonly) return
  const current = [...props.modelValue]
  if (checked) {
    if (!current.includes(id)) current.push(id)
  } else {
    const i = current.indexOf(id)
    if (i >= 0) current.splice(i, 1)
  }
  emit('update:modelValue', current)
}

function allPermsInGroup(group: Group): number[] {
  return group.subgroups.flatMap((s) => s.permissions.map((p) => p.id))
}

function allPermsInSubGroup(sub: SubGroup): number[] {
  return sub.permissions.map((p) => p.id)
}

function countSelected(group: Group): number {
  return allPermsInGroup(group).filter((id) => props.modelValue.includes(id)).length
}

function countTotal(group: Group): number {
  return allPermsInGroup(group).length
}

function isGroupAllSelected(group: Group): boolean {
  const ids = allPermsInGroup(group)
  return ids.length > 0 && ids.every((id) => props.modelValue.includes(id))
}

function isGroupPartiallySelected(group: Group): boolean {
  const ids = allPermsInGroup(group)
  const selected = ids.filter((id) => props.modelValue.includes(id))
  return selected.length > 0 && selected.length < ids.length
}

function isSubGroupAllSelected(sub: SubGroup): boolean {
  const ids = allPermsInSubGroup(sub)
  return ids.length > 0 && ids.every((id) => props.modelValue.includes(id))
}

function isSubGroupPartiallySelected(sub: SubGroup): boolean {
  const ids = allPermsInSubGroup(sub)
  const selected = ids.filter((id) => props.modelValue.includes(id))
  return selected.length > 0 && selected.length < ids.length
}

function toggleGroup_selectAll(group: Group, checked: boolean | null) {
  if (props.readonly) return
  const ids = allPermsInGroup(group)
  let current = [...props.modelValue]
  if (checked) {
    ids.forEach((id) => { if (!current.includes(id)) current.push(id) })
  } else {
    current = current.filter((id) => !ids.includes(id))
  }
  emit('update:modelValue', current)
}

function toggleSubGroup_selectAll(sub: SubGroup, checked: boolean | null) {
  if (props.readonly) return
  const ids = allPermsInSubGroup(sub)
  let current = [...props.modelValue]
  if (checked) {
    ids.forEach((id) => { if (!current.includes(id)) current.push(id) })
  } else {
    current = current.filter((id) => !ids.includes(id))
  }
  emit('update:modelValue', current)
}
</script>

<style scoped>
/* ── Group wrapper ────────────────────────────── */
.group-wrapper {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
}

/* ── Group header ─────────────────────────────── */
.group-header {
  background: rgb(var(--v-theme-primary));
  transition: filter 0.15s;
}
.group-header:hover {
  filter: brightness(1.08);
}

.group-chevron {
  transition: transform 0.2s;
}
.group-chevron--collapsed {
  transform: rotate(-90deg);
}

/* ── Group body ───────────────────────────────── */
.group-body {
  background: rgba(var(--v-theme-surface), 1);
}

/* ── Subgroup bar accent ──────────────────────── */
.subgroup-bar {
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: rgb(var(--v-theme-primary));
  opacity: 0.7;
}

/* ── Permission chips ─────────────────────────── */
.perm-chip {
  border: 1px solid;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
  user-select: none;
  white-space: nowrap;
}

.perm-chip--active {
  background-color: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
  color: #fff;
}

.perm-chip--inactive {
  background-color: transparent;
  border-color: rgba(var(--v-theme-on-surface), 0.2);
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.perm-chip--inactive:not(.perm-chip--readonly):hover {
  border-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.06);
}

.perm-chip--readonly {
  opacity: 0.75;
}

/* ── Guide mode rows ──────────────────────────── */
.guide-row {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
