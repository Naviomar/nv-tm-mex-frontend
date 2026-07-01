<template>
  <div>
    <!-- "created" event: only new values, full width -->
    <div v-if="isCreated">
      <v-alert type="success" variant="tonal" density="compact" class="mb-3" icon="mdi-plus-circle">
        Record created with the following values
      </v-alert>
      <div class="diff-grid">
        <div v-for="(value, key) in newValues" :key="String(key)" class="diff-row diff-row--added">
          <span class="diff-key">{{ humanize(String(key)) }}</span>
          <span class="diff-value">{{ format(value) }}</span>
        </div>
      </div>
    </div>

    <!-- "deleted" event: only old values, full width -->
    <div v-else-if="isDeleted">
      <v-alert type="error" variant="tonal" density="compact" class="mb-3" icon="mdi-delete-circle">
        Record deleted — values at the time of deletion
      </v-alert>
      <div class="diff-grid">
        <div v-for="(value, key) in oldValues" :key="String(key)" class="diff-row diff-row--removed">
          <span class="diff-key">{{ humanize(String(key)) }}</span>
          <span class="diff-value">{{ format(value) }}</span>
        </div>
      </div>
    </div>

    <!-- "updated" / default: side-by-side -->
    <div v-else>
      <v-alert v-if="changedKeys.length === 0" type="info" variant="tonal" density="compact" class="mb-3" icon="mdi-information">
        No field changes detected in this audit record.
      </v-alert>

      <div v-else>
        <div class="text-caption text-grey-darken-1 mb-2">
          {{ changedKeys.length }} field{{ changedKeys.length > 1 ? 's' : '' }} changed
        </div>

        <div class="diff-side-by-side">
          <!-- Header -->
          <div class="diff-header diff-header--old">
            <v-icon size="14" class="mr-1">mdi-arrow-left-circle</v-icon> Before
          </div>
          <div class="diff-header diff-header--new">
            <v-icon size="14" class="mr-1">mdi-arrow-right-circle</v-icon> After
          </div>

          <!-- Rows for each changed key -->
          <template v-for="key in allKeys" :key="String(key)">
            <div
              :class="[
                'diff-cell diff-cell--old',
                changedKeys.includes(String(key)) ? 'diff-cell--changed' : 'diff-cell--unchanged',
              ]"
            >
              <span class="diff-key">{{ humanize(String(key)) }}</span>
              <span class="diff-value">{{ format(oldValues?.[key]) }}</span>
            </div>
            <div
              :class="[
                'diff-cell diff-cell--new',
                changedKeys.includes(String(key)) ? 'diff-cell--changed' : 'diff-cell--unchanged',
              ]"
            >
              <span class="diff-key">{{ humanize(String(key)) }}</span>
              <span class="diff-value">{{ format(newValues?.[key]) }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  auditable?: string
  oldValues?: Record<string, any> | null
  newValues?: Record<string, any> | null
  event?: string
}>()

const isCreated = computed(() => props.event === 'created')
const isDeleted = computed(() => props.event === 'deleted')

const allKeys = computed(() => {
  const keys = new Set([
    ...Object.keys(props.oldValues ?? {}),
    ...Object.keys(props.newValues ?? {}),
  ])
  return Array.from(keys)
})

const changedKeys = computed(() =>
  allKeys.value.filter(
    (key) => JSON.stringify(props.oldValues?.[key]) !== JSON.stringify(props.newValues?.[key])
  )
)

// Pretty-print field names (snake_case → Title Case words)
const FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  name: 'Name',
  email: 'Email',
  department_id: 'Department ID',
  role_id: 'Role ID',
  user_id: 'User ID',
  department_type: 'Member Type',
  role_type: 'Role Type',
  created_by: 'Created by',
  updated_by: 'Updated by',
  deleted_at: 'Deleted at',
  created_at: 'Created at',
  updated_at: 'Updated at',
  description: 'Description',
  guard_name: 'Guard',
}

function humanize(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function format(val: any): string {
  if (val === null || val === undefined) return '—'
  if (Array.isArray(val)) return val.length ? val.join(', ') : '(none)'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
</script>

<style scoped>
.diff-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.diff-row {
  display: flex;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  align-items: baseline;
}

.diff-row--added {
  background: rgba(var(--v-theme-success), 0.06);
  border-left: 3px solid rgb(var(--v-theme-success));
}

.diff-row--removed {
  background: rgba(var(--v-theme-error), 0.06);
  border-left: 3px solid rgb(var(--v-theme-error));
}

.diff-key {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  min-width: 140px;
  flex-shrink: 0;
}

.diff-value {
  color: rgba(var(--v-theme-on-surface), 0.75);
  word-break: break-all;
}

/* Side-by-side grid */
.diff-side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
}

.diff-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.diff-header--old {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.06);
}

.diff-header--new {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.06);
}

.diff-cell {
  display: flex;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  align-items: baseline;
}

.diff-cell--old.diff-cell--changed {
  background: rgba(var(--v-theme-error), 0.06);
  border-left: 3px solid rgba(var(--v-theme-error), 0.5);
}

.diff-cell--new.diff-cell--changed {
  background: rgba(var(--v-theme-success), 0.06);
  border-left: 3px solid rgb(var(--v-theme-success));
}

.diff-cell--unchanged {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-left: 3px solid transparent;
  opacity: 0.6;
}
</style>
