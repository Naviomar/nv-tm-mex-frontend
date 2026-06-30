<template>
  <div>
    <!-- Filters -->
    <v-card variant="flat" class="mb-4 rounded-lg" bg-color="grey-lighten-5">
      <v-card-text class="pb-2">
        <div class="grid grid-cols-6 gap-4" @keyup.enter="onEnterFilters">
          <div class="col-span-1">
            <v-text-field
              v-model="filters.id"
              clearable
              density="compact"
              label="# ID"
              variant="outlined"
              prepend-inner-icon="mdi-pound"
              hide-details
            />
          </div>
          <div class="col-span-1">
            <v-autocomplete
              v-model="filters.event"
              clearable
              density="compact"
              label="Event"
              variant="outlined"
              hide-details
              :items="eventOptions"
              item-title="label"
              item-value="value"
            />
          </div>
          <div class="col-span-2">
            <v-autocomplete
              v-model="filters.module"
              clearable
              density="compact"
              label="Module"
              variant="outlined"
              hide-details
              :items="moduleOptions"
              item-title="label"
              item-value="value"
            />
          </div>
          <div class="col-span-1">
            <v-text-field
              v-model="filters.startDate"
              clearable
              type="date"
              density="compact"
              label="Start date"
              variant="outlined"
              hide-details
            />
          </div>
          <div class="col-span-1">
            <v-text-field
              v-model="filters.endDate"
              clearable
              type="date"
              density="compact"
              label="End date"
              variant="outlined"
              hide-details
            />
          </div>
          <div class="col-span-3">
            <AUserSearch v-model="filters.user_id" label="Executed by user" />
          </div>
        </div>
        <div class="flex gap-2 mt-3">
          <v-btn color="secondary" variant="outlined" @click="clearFilters">Clear</v-btn>
          <v-btn color="primary" prepend-icon="mdi-magnify" @click="getAuditLogs">Search</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Table -->
    <v-card variant="flat" class="rounded-lg">
      <v-card-text class="pa-0">
        <div class="d-flex justify-end px-4 pt-3 pb-1">
          <v-pagination
            v-model="audits.current_page"
            :length="audits.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          />
        </div>

        <v-table density="compact" hover>
          <thead>
            <tr class="bg-grey-lighten-4">
              <th class="text-left" style="width:48px"></th>
              <th class="text-left" style="width:60px">#</th>
              <th class="text-left">What changed</th>
              <th class="text-left">Event</th>
              <th class="text-left">Executed by</th>
              <th class="text-left">Module</th>
              <th class="text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="audits.data.length === 0">
              <td colspan="7" class="text-center py-10 text-grey">
                <v-icon size="36" class="mb-2">mdi-history</v-icon>
                <div>No audit records found.</div>
              </td>
            </tr>
            <tr
              v-for="(audit, index) in audits.data"
              :key="`audit-${index}`"
              class="audit-row"
            >
              <td>
                <v-btn
                  icon="mdi-eye-outline"
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  @click="showDiff(audit)"
                />
              </td>
              <td class="text-caption text-grey-darken-1">#{{ audit.id }}</td>

              <!-- What changed -->
              <td>
                <div class="d-flex align-center gap-2 py-1">
                  <v-avatar :color="getModelColor(audit)" size="28" rounded="sm">
                    <v-icon size="14" color="white">{{ getModelIcon(audit) }}</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ getAuditableLabel(audit) }}</div>
                    <div class="text-caption text-grey-darken-1">{{ getAuditableSubtitle(audit) }}</div>
                  </div>
                </div>
              </td>

              <!-- Event chip -->
              <td>
                <v-chip
                  :color="getEventColor(audit.event)"
                  size="x-small"
                  variant="tonal"
                  :prepend-icon="getEventIcon(audit.event)"
                >
                  {{ audit.event }}
                </v-chip>
              </td>

              <!-- User -->
              <td>
                <div v-if="audit.user" class="d-flex align-center gap-1">
                  <v-avatar size="20" color="secondary" rounded="circle">
                    <v-icon size="12" color="white">mdi-account</v-icon>
                  </v-avatar>
                  <span class="text-body-2">{{ audit.user.name }}</span>
                </div>
                <span v-else class="text-caption text-grey">—</span>
              </td>

              <!-- Module / tags -->
              <td>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="tag in parseTags(audit.tags)"
                    :key="tag"
                    size="x-small"
                    variant="outlined"
                    color="primary"
                  >{{ tag }}</v-chip>
                  <span v-if="!audit.tags" class="text-caption text-grey">—</span>
                </div>
              </td>

              <!-- Date -->
              <td class="text-caption text-grey-darken-1 whitespace-nowrap">
                {{ formatDateString(audit.created_at) }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <div class="d-flex justify-end px-4 pb-3 pt-1">
          <v-pagination
            v-model="audits.current_page"
            :length="audits.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Diff dialog -->
    <v-dialog v-model="diffDialog.show" max-width="860" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center gap-2 pa-4 bg-grey-lighten-5">
          <v-avatar :color="getModelColor(diffDialog.audit)" size="32" rounded="sm">
            <v-icon size="16" color="white">{{ getModelIcon(diffDialog.audit) }}</v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold">{{ getAuditableLabel(diffDialog.audit) }}</div>
            <div class="text-caption text-grey-darken-1">
              {{ getEventLabel(diffDialog.audit.event) }} · {{ formatDateString(diffDialog.audit.created_at) }} · by {{ diffDialog.audit.user?.name || '—' }}
            </div>
          </div>
          <v-spacer />
          <v-chip :color="getEventColor(diffDialog.audit.event)" size="small" variant="tonal" :prepend-icon="getEventIcon(diffDialog.audit.event)">
            {{ diffDialog.audit.event }}
          </v-chip>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <AuditDiff
            :auditable="diffDialog.audit.auditable_type"
            :event="diffDialog.audit.event"
            :old-values="diffDialog.audit.old_values"
            :new-values="diffDialog.audit.new_values"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-3">
          <div class="text-caption text-grey-darken-1 ml-1">
            Audit ID #{{ diffDialog.audit.id }} · {{ diffDialog.audit.auditable_type }} {{ diffDialog.audit.auditable_id ? `#${diffDialog.audit.auditable_id}` : '' }}
          </div>
          <v-spacer />
          <v-btn color="primary" variant="tonal" @click="closeDiffDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const router = useRouter()
const route = useRoute()
const loadingStore = useLoadingStore()

const eventOptions = [
  { label: 'Created', value: 'created' },
  { label: 'Updated', value: 'updated' },
  { label: 'Deleted', value: 'deleted' },
  { label: 'Restored', value: 'restored' },
  { label: 'Roles updated', value: 'roles_updated' },
  { label: 'Permissions updated', value: 'permissions_updated' },
]

const moduleOptions = [
  { label: 'Departments', value: 'admin_departments' },
  { label: 'Users', value: 'admin_users' },
  { label: 'Roles', value: 'admin_roles' },
]

const filters = ref<any>({
  id: '',
  event: '',
  module: '',
  startDate: '',
  endDate: '',
  user_id: null,
})

const audits = ref({
  data: [] as any[],
  current_page: 1,
  page: 1,
  perPage: 25,
  last_page: 1,
})

const emptyAudit = {
  id: null,
  auditable_type: '',
  auditable_id: null,
  old_values: {},
  new_values: {},
  event: '',
  tags: '',
  created_at: '',
  user: null,
  auditable: null,
}

const diffDialog = ref({
  show: false,
  audit: { ...emptyAudit } as any,
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const MODEL_META: Record<string, { label: string; icon: string; color: string }> = {
  DepartmentRole: { label: 'Department Role', icon: 'mdi-shield-account', color: 'amber-darken-2' },
  DepartmentUser: { label: 'Department Member', icon: 'mdi-account-group', color: 'blue-darken-1' },
  Department:     { label: 'Department', icon: 'mdi-office-building', color: 'primary' },
  User:           { label: 'User', icon: 'mdi-account', color: 'teal' },
  RoleMex:        { label: 'Role', icon: 'mdi-tag-multiple', color: 'deep-purple' },
  Permission:     { label: 'Permission', icon: 'mdi-key', color: 'orange' },
}

function getModelName(audit: any): string {
  return audit.auditable_name || audit.auditable_type?.split('\\').pop() || ''
}

function getModelMeta(audit: any) {
  return MODEL_META[getModelName(audit)] ?? { label: getModelName(audit), icon: 'mdi-file-document', color: 'grey' }
}

function getModelIcon(audit: any) { return getModelMeta(audit).icon }
function getModelColor(audit: any) { return getModelMeta(audit).color }

function getAuditableLabel(audit: any): string {
  const modelName = getModelName(audit)

  if (modelName === 'DepartmentRole') {
    const dept = audit.auditable?.department?.name
    const role = audit.auditable?.role?.name
    const type = audit.auditable?.role_type
    if (dept && role) return `${dept} → ${role} (${type})`
    if (dept) return `Department: ${dept}`
    return `Role linked #${audit.auditable_id}`
  }

  if (modelName === 'DepartmentUser') {
    const dept = audit.auditable?.department?.name
    const member = audit.auditable?.user?.name
    const type = audit.auditable?.department_type
    if (dept && member) return `${dept} → ${member} (${type})`
    if (dept) return `Department: ${dept}`
    return `Member assignment #${audit.auditable_id}`
  }

  if (modelName === 'Department') {
    return audit.auditable?.name || `Department #${audit.auditable_id}`
  }

  if (modelName === 'User') {
    return audit.auditable?.name || `User #${audit.auditable_id}`
  }

  if (modelName === 'RoleMex') {
    return audit.auditable?.name || `Role #${audit.auditable_id}`
  }

  return `${getModelMeta(audit).label} #${audit.auditable_id ?? ''}`
}

function getAuditableSubtitle(audit: any): string {
  const modelName = getModelName(audit)
  return MODEL_META[modelName]?.label ?? modelName
}

function getEventColor(event: string): string {
  const map: Record<string, string> = {
    created: 'success',
    updated: 'primary',
    deleted: 'error',
    restored: 'warning',
    roles_updated: 'deep-purple',
    permissions_updated: 'orange-darken-2',
  }
  return map[event] ?? 'grey'
}

function getEventIcon(event: string): string {
  const map: Record<string, string> = {
    created: 'mdi-plus-circle',
    updated: 'mdi-pencil-circle',
    deleted: 'mdi-delete-circle',
    restored: 'mdi-restore',
    roles_updated: 'mdi-shield-account',
    permissions_updated: 'mdi-key',
  }
  return map[event] ?? 'mdi-circle'
}

function getEventLabel(event: string): string {
  const map: Record<string, string> = {
    created: 'Created',
    updated: 'Updated',
    deleted: 'Deleted',
    restored: 'Restored',
    roles_updated: 'Roles updated',
    permissions_updated: 'Permissions updated',
  }
  return map[event] ?? event
}

function parseTags(tags: string | null): string[] {
  if (!tags) return []
  return tags.split(',').map((t) => t.trim().replace('module:', '').replace('model:', '').replace('_', ' '))
}

// ── Dialog ───────────────────────────────────────────────────────────────────

const showDiff = (audit: any) => {
  diffDialog.value.audit = audit
  diffDialog.value.show = true
}

const closeDiffDialog = () => {
  diffDialog.value.show = false
  diffDialog.value.audit = { ...emptyAudit }
}

// ── Data fetching ─────────────────────────────────────────────────────────────

const onEnterFilters = async () => {
  audits.value.current_page = 1
  await getAuditLogs()
}

const onClickPagination = async (page: number) => {
  audits.value.current_page = page
  await getAuditLogs()
}

const getAuditLogs = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.audit.getPaged({
      query: {
        page: audits.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })
    audits.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const clearFilters = async () => {
  filters.value = { id: '', event: '', module: '', startDate: '', endDate: '', user_id: null }
  await getAuditLogs()
}

watch(
  filters,
  (newFilters) => {
    router.push({ query: { ...route.query, ...newFilters } })
  },
  { deep: true }
)

onMounted(() => {
  const queryFilters = route.query
  Object.keys(filters.value).forEach((key) => {
    if (queryFilters[key]) {
      const value: any = queryFilters[key]
      filters.value[key] = /^\d+$/.test(value) ? Number(value) : value
    }
  })
  getAuditLogs()
})
</script>
<style scoped>
.audit-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.03);
}
</style>
