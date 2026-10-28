<template>
  <div class="access-panel">
    <!-- Summary -->
    <div class="d-flex flex-wrap align-center gap-2 mb-3">
      <template v-if="!guide">
        <v-chip color="primary" variant="tonal" size="small" prepend-icon="mdi-key-variant">
          {{ selectedCount }} of {{ permissions.length }} granted
        </v-chip>
        <v-chip v-if="impactLabel" color="warning" variant="tonal" size="small" prepend-icon="mdi-account-group-outline">
          {{ impactLabel }}
        </v-chip>
      </template>
      <v-chip v-else color="primary" variant="tonal" size="small" prepend-icon="mdi-key-variant">
        {{ permissions.length }} permissions
      </v-chip>
      <v-spacer />
      <slot name="status" />
      <v-btn
        v-if="!guide"
        size="x-small"
        variant="text"
        color="primary"
        prepend-icon="mdi-help-circle-outline"
        @click="pageDocs.open('access-control', 'rules')"
      >
        How does this work?
      </v-btn>
    </div>

    <!-- Search + filters -->
    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search permissions by name or description..."
      density="compact"
      variant="outlined"
      hide-details
      clearable
      class="mb-2"
    />
    <v-chip-group v-if="!guide" v-model="filter" mandatory selected-class="filter-chip--active" class="mb-2">
      <v-chip v-for="f in filters" :key="f.value" :value="f.value" size="small" variant="outlined" filter>
        {{ f.label }}
        <span class="ml-1 text-medium-emphasis">{{ f.count }}</span>
      </v-chip>
    </v-chip-group>

    <div v-if="filteredGroups.length === 0" class="text-center py-8 text-medium-emphasis">
      <v-icon size="40">mdi-key-off</v-icon>
      <div class="mt-2 text-body-2">No permissions match.</div>
    </div>

    <PermissionGroupsList
      v-model="open"
      :groups="filteredGroups"
      :row-class="(p) => (!guide && isGranted(p.id) ? 'access-row--granted' : '')"
    >
      <template #group-stats="{ group }">
        <v-chip v-if="!guide" size="x-small" variant="tonal" color="primary" class="ml-3">
          {{ groupStats(group).granted }}/{{ groupStats(group).total }}
        </v-chip>
        <v-chip v-else size="x-small" variant="tonal" color="primary" class="ml-3">{{ groupStats(group).total }}</v-chip>
      </template>

      <template v-if="canEdit" #group-actions="{ group }">
        <v-chip
          v-if="groupStats(group).granted < groupStats(group).total"
          size="x-small"
          variant="outlined"
          color="primary"
          class="mr-1"
          @click.stop="setMany(idsOf(group), true)"
        >
          Grant all
        </v-chip>
        <v-chip
          v-if="groupStats(group).granted > 0"
          size="x-small"
          variant="outlined"
          class="mr-2"
          @click.stop="setMany(idsOf(group), false)"
        >
          Clear
        </v-chip>
      </template>

      <template v-if="canEdit" #sub-actions="{ sub }">
        <v-chip
          v-if="subGranted(sub) < sub.permissions.length"
          size="x-small"
          variant="text"
          color="primary"
          @click="setMany(sub.permissions.map((p) => p.id), true)"
        >
          Grant all
        </v-chip>
        <v-chip v-if="subGranted(sub) > 0" size="x-small" variant="text" @click="setMany(sub.permissions.map((p) => p.id), false)">
          Clear
        </v-chip>
      </template>

      <template #main="{ perm }">
        <div class="d-flex align-center flex-wrap gap-2">
          <span class="font-weight-medium text-body-2">{{ perm.humanLabel }}</span>
        </div>
      </template>

      <template v-if="!guide" #actions="{ perm }">
        <v-switch
          :model-value="isGranted(perm.id)"
          :disabled="!canEdit"
          color="primary"
          density="compact"
          hide-details
          inset
          @update:model-value="(v: any) => setMany([perm.id], !!v)"
        />
      </template>
    </PermissionGroupsList>
  </div>
</template>

<script setup lang="ts">
import { groupPermissions } from '~/utils/permissions/groupPermissions'
import type { PermissionGroup, PermissionSubGroup, RawPermission } from '~/utils/permissions/groupPermissions'

/**
 * Role permission editor and read-only permission catalog, with the same look as
 * UserAccessPanel. The parent owns persistence: it receives `update:modelValue` with
 * the full list of granted permission ids (and may debounce-save it).
 */
const props = defineProps<{
  permissions: RawPermission[]
  /** Ids of the granted permissions. */
  modelValue?: number[]
  readonly?: boolean
  /** Read-only reference list (name + description), no switches or filters. */
  guide?: boolean
  /** Users affected by a change to this role (shown as a warning chip). */
  affectedUsers?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const pageDocs = usePageDocs()

const search = ref<string | null>('')
const filter = ref<'all' | 'granted' | 'missing'>('all')
const open = ref<string[]>([])

const canEdit = computed(() => !props.readonly && !props.guide)
const selected = computed(() => new Set<number>(props.modelValue ?? []))
const isGranted = (id: number) => selected.value.has(id)
const selectedCount = computed(() => props.permissions.filter((p) => selected.value.has(p.id)).length)

const impactLabel = computed(() => {
  if (props.affectedUsers == null) return ''
  return props.affectedUsers === 1 ? 'Changes affect 1 user' : `Changes affect ${props.affectedUsers} users`
})

const filters = computed(() => [
  { value: 'all', label: 'All', count: props.permissions.length },
  { value: 'granted', label: 'Granted', count: selectedCount.value },
  { value: 'missing', label: 'Not granted', count: props.permissions.length - selectedCount.value },
])

const filteredGroups = computed((): PermissionGroup[] => {
  const q = (search.value ?? '').trim().toLowerCase()
  const matching = props.permissions.filter((p: any) => {
    if (!props.guide) {
      if (filter.value === 'granted' && !selected.value.has(p.id)) return false
      if (filter.value === 'missing' && selected.value.has(p.id)) return false
    }
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      p.name.replace(/[-.]/g, ' ').includes(q)
    )
  })
  return groupPermissions(matching)
})

const idsOf = (group: PermissionGroup) => group.subgroups.flatMap((s) => s.permissions.map((p) => p.id))
const subGranted = (sub: PermissionSubGroup) => sub.permissions.filter((p) => selected.value.has(p.id)).length

function groupStats(group: PermissionGroup) {
  const ids = idsOf(group)
  return { total: ids.length, granted: ids.filter((id) => selected.value.has(id)).length }
}

function setMany(ids: number[], granted: boolean) {
  if (!canEdit.value) return
  const next = new Set(selected.value)
  ids.forEach((id) => (granted ? next.add(id) : next.delete(id)))
  emit('update:modelValue', [...next])
}

// Open the matching modules when searching/filtering (unless it would open a wall of rows).
watch([search, filter], () => {
  const active = !!(search.value ?? '').trim() || filter.value !== 'all'
  const labels = filteredGroups.value.map((g) => g.label)
  open.value = active && labels.length <= 12 ? labels : []
})
</script>

<style scoped>
.filter-chip--active {
  color: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
}
</style>
