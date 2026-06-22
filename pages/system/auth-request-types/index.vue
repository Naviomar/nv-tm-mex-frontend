<template>
  <div class="pa-6">
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-3">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-key-variant" size="28" color="primary" />
        <div>
          <div class="text-h5">Auth Request Types</div>
          <div class="text-caption text-medium-emphasis">
            Catalog and control center for every authorization / process request type in the system
          </div>
        </div>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        New Type
      </v-btn>
    </div>

    <!-- Filters -->
    <v-card variant="flat" class="mb-4" rounded="lg" border>
      <v-card-text class="d-flex align-center justify-space-between flex-wrap gap-3 py-3">
        <v-tabs v-model="kindFilter" color="primary" density="comfortable">
          <v-tab value="all">All <v-chip size="x-small" class="ml-2" variant="tonal">{{ types.length }}</v-chip></v-tab>
          <v-tab value="authorization">Authorization <v-chip size="x-small" class="ml-2" variant="tonal" color="blue">{{ countByKind('authorization') }}</v-chip></v-tab>
          <v-tab value="process">Process <v-chip size="x-small" class="ml-2" variant="tonal" color="purple">{{ countByKind('process') }}</v-chip></v-tab>
          <v-tab value="support">Support <v-chip size="x-small" class="ml-2" variant="tonal" color="teal">{{ countByKind('support') }}</v-chip></v-tab>
        </v-tabs>

        <div class="d-flex align-center gap-3">
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
            placeholder="Search code or description…"
            style="min-width: 260px"
          />
          <v-btn-toggle v-model="activeFilter" density="comfortable" mandatory color="primary" variant="outlined">
            <v-btn value="all" size="small">All</v-btn>
            <v-btn value="active" size="small">Active</v-btn>
            <v-btn value="inactive" size="small">Inactive</v-btn>
          </v-btn-toggle>
        </div>
      </v-card-text>
    </v-card>

    <!-- Card grid -->
    <v-row v-if="!loading">
      <v-col v-for="type in filteredTypes" :key="type.id" cols="12" sm="6" md="4" lg="3">
        <v-card
          rounded="lg"
          border
          class="h-100 d-flex flex-column type-card"
          :class="{ 'type-card--inactive': !type.is_active }"
        >
          <v-card-text class="flex-grow-1">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-avatar :color="type.color || kindColor(type.kind)" size="38" variant="tonal">
                <v-icon :icon="type.icon || 'mdi-shield-key-outline'" />
              </v-avatar>
              <div class="d-flex gap-1">
                <v-chip size="x-small" :color="kindColor(type.kind)" variant="tonal">
                  {{ kindLabel(type.kind) }}
                </v-chip>
                <v-chip size="x-small" :color="type.is_active ? 'success' : 'grey'" variant="tonal">
                  {{ type.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </div>
            </div>

            <div class="text-subtitle-1 font-weight-medium mb-1">{{ type.description }}</div>
            <code class="text-caption text-medium-emphasis d-block mb-3">{{ type.code }}</code>

            <div class="mb-2">
              <div class="text-caption text-medium-emphasis d-flex align-center gap-1 mb-1">
                <v-icon size="14">mdi-account-multiple-plus-outline</v-icon> CC users
              </div>
              <div class="d-flex flex-wrap gap-1">
                <v-avatar v-for="u in type.default_cc_users ?? []" :key="u.id" size="22" color="primary" variant="tonal" :title="u.name">
                  <span class="text-caption">{{ initials(u.name) }}</span>
                </v-avatar>
                <span v-if="!(type.default_cc_users?.length)" class="text-caption text-disabled">—</span>
              </div>
            </div>

            <div>
              <div class="text-caption text-medium-emphasis d-flex align-center gap-1 mb-1">
                <v-icon size="14">mdi-shield-check-outline</v-icon> Approvers
              </div>
              <div class="d-flex flex-wrap gap-1">
                <v-avatar v-for="u in type.approvers ?? []" :key="u.id" size="22" color="success" variant="tonal" :title="u.name">
                  <span class="text-caption">{{ initials(u.name) }}</span>
                </v-avatar>
                <span v-if="!(type.approvers?.length)" class="text-caption text-disabled">Falls back to permission holders</span>
              </div>
            </div>
          </v-card-text>

          <v-divider />
          <v-card-actions class="px-3">
            <v-btn size="small" variant="text" prepend-icon="mdi-pencil" color="primary" @click="openEditDialog(type)">Edit</v-btn>
            <v-spacer />
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(type)" />
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col v-if="!filteredTypes.length" cols="12">
        <v-alert type="info" variant="tonal" border="start">
          No request types match the current filters.
        </v-alert>
      </v-col>
    </v-row>
    <div v-else class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="680" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center gap-2 pt-4 px-6">
          <v-icon :icon="editingType ? 'mdi-pencil' : 'mdi-plus-circle-outline'" color="primary" />
          {{ editingType ? 'Edit Type' : 'New Type' }}
        </v-card-title>

        <v-divider />

        <v-card-text class="px-6 py-4" style="max-height: 70vh;">
          <v-form ref="formRef">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.kind"
                  label="Kind"
                  :items="kindOptions"
                  item-title="label"
                  item-value="value"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.code"
                  label="Code"
                  required
                  :rules="codeRules"
                  hint="e.g. cancel-invoice-tm"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="form.description" label="Description" required />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.redirect" label="Redirect Path" hint="Frontend route (optional)" />
              </v-col>
              <v-col v-if="form.kind === 'process'" cols="12" md="6">
                <v-text-field v-model="form.key_label" label="Key Label" hint="Label for request_key (processes only)" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.icon" label="Icon (Material Design)" hint="e.g. mdi-cancel" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.color" label="Color" hint="Vuetify color name (optional)" />
              </v-col>
              <v-col cols="12">
                <v-switch v-model="form.is_active" label="Active" color="primary" hide-details />
              </v-col>
            </v-row>
          </v-form>

          <!-- Default CC Users (only when editing an existing type) -->
          <template v-if="editingType">
            <v-divider class="my-4" />
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center gap-2">
                <v-icon size="18" color="primary">mdi-account-multiple-plus-outline</v-icon>
                <span class="text-subtitle-2 font-weight-bold">Default CC Users</span>
              </div>
              <span class="text-caption text-disabled">Auto-added to every new request of this type</span>
            </div>

            <!-- Current CC users -->
            <div class="d-flex flex-wrap gap-2 mb-3">
              <v-chip
                v-for="u in ccUsers"
                :key="u.id"
                size="small"
                variant="tonal"
                color="primary"
                closable
                @click:close="removeCcUser(u.id)"
              >
                <v-icon start size="14">mdi-account-outline</v-icon>
                {{ u.name }}
              </v-chip>
              <span v-if="!ccUsers.length" class="text-caption text-disabled">No default CC users configured</span>
            </div>

            <!-- User search to add -->
            <v-autocomplete
              v-model="selectedCcUser"
              label="Add user to CC"
              :items="userSearchResults"
              :loading="searchingUsers"
              item-title="name"
              item-value="id"
              :search="userSearchQuery"
              hide-no-data
              density="compact"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search by name or email…"
              return-object
              clearable
              @update:search="onUserSearch"
              @update:model-value="addCcUser"
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.email" />
              </template>
            </v-autocomplete>

            <!-- Approvers -->
            <v-divider class="my-4" />
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center gap-2">
                <v-icon size="18" color="success">mdi-shield-check-outline</v-icon>
                <span class="text-subtitle-2 font-weight-bold">Approvers</span>
              </div>
              <span class="text-caption text-disabled">
                These users can accept/deny this type's requests. If empty, falls back to permission holders.
              </span>
            </div>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <v-chip
                v-for="u in approvers"
                :key="u.id"
                size="small"
                variant="tonal"
                color="success"
                closable
                @click:close="removeApprover(u.id)"
              >
                <v-icon start size="14">mdi-account-check-outline</v-icon>
                {{ u.name }}
              </v-chip>
              <span v-if="!approvers.length" class="text-caption text-disabled">No specific approvers configured</span>
            </div>

            <v-autocomplete
              v-model="selectedApprover"
              label="Add approver"
              :items="approversSearchResults"
              :loading="searchingApprovers"
              item-title="name"
              item-value="id"
              :search="approversSearchQuery"
              hide-no-data
              density="compact"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search by name or email…"
              return-object
              clearable
              @update:search="onApproverSearch"
              @update:model-value="addApprover"
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.email" />
              </template>
            </v-autocomplete>
          </template>
        </v-card-text>

        <v-divider />
        <v-card-actions class="justify-end px-6 pb-4">
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="showDeleteDialog" max-width="420">
      <v-card>
        <v-card-title class="d-flex align-center gap-2 pt-4 px-6">
          <v-icon color="error">mdi-alert-circle-outline</v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text class="px-6">
          Are you sure you want to delete the type <strong>"{{ deletingType?.description }}"</strong>?
        </v-card-text>
        <v-card-actions class="justify-end px-6 pb-4">
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteType">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { IAuthRequestType, IDefaultCcUser } from '~/repository/modules/catalogs/authRequestTypes'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

definePageMeta({
  title: 'Auth Request Types - System',
  layout: 'default',
})

const types = ref<IAuthRequestType[]>([])
const loading = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingType = ref<IAuthRequestType | null>(null)
const deletingType = ref<IAuthRequestType | null>(null)
const saving = ref(false)
const deleting = ref(false)
const formRef = ref()

// Filters
const kindFilter = ref<'all' | 'authorization' | 'process' | 'support'>('all')
const activeFilter = ref<'all' | 'active' | 'inactive'>('all')
const search = ref('')

// Default CC users state
const ccUsers = ref<IDefaultCcUser[]>([])
const userSearchQuery = ref('')
const userSearchResults = ref<IDefaultCcUser[]>([])
const searchingUsers = ref(false)
const selectedCcUser = ref<IDefaultCcUser | null>(null)

// Approvers state
const approvers = ref<IDefaultCcUser[]>([])
const approversSearchQuery = ref('')
const approversSearchResults = ref<IDefaultCcUser[]>([])
const searchingApprovers = ref(false)
const selectedApprover = ref<IDefaultCcUser | null>(null)

const kindOptions = [
  { label: 'Authorization (AuthorizationRequest)', value: 'authorization' },
  { label: 'Process (ProcessRequest)', value: 'process' },
  { label: 'Support (SupportAssistance)', value: 'support' },
]

const kindColor = (kind: string) => {
  return { authorization: 'blue', process: 'purple', support: 'teal' }[kind] ?? 'grey'
}

const kindLabel = (kind: string) => {
  return { authorization: 'Authorization', process: 'Process', support: 'Support' }[kind] ?? kind
}

const form = ref({
  kind: 'authorization' as 'authorization' | 'process' | 'support',
  code: '',
  description: '',
  redirect: '',
  key_label: '',
  icon: '',
  color: '',
  is_active: true,
})

const codeRules = [(v: string) => !!v || 'Code is required']

const countByKind = (kind: string) => types.value.filter(t => t.kind === kind).length

const filteredTypes = computed(() => {
  return types.value.filter((t) => {
    if (kindFilter.value !== 'all' && t.kind !== kindFilter.value) return false
    if (activeFilter.value === 'active' && !t.is_active) return false
    if (activeFilter.value === 'inactive' && t.is_active) return false
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!t.code.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false
    }
    return true
  })
})

const initials = (name?: string) => {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')
}

const loadTypes = async () => {
  loading.value = true
  try {
    types.value = (await $api.authRequestTypes.getTypes()) as any
  } catch {
    snackbar.add({ type: 'error', text: 'Error loading types' })
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingType.value = null
  ccUsers.value = []
  approvers.value = []
  form.value = { kind: 'authorization', code: '', description: '', redirect: '', key_label: '', icon: '', color: '', is_active: true }
  showDialog.value = true
}

const openEditDialog = async (type: IAuthRequestType) => {
  editingType.value = type
  form.value = { ...type } as any
  ccUsers.value = type.default_cc_users ?? []
  approvers.value = type.approvers ?? []
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingType.value = null
  ccUsers.value = []
  approvers.value = []
  userSearchQuery.value = ''
  userSearchResults.value = []
  approversSearchQuery.value = ''
  approversSearchResults.value = []
}

const save = async () => {
  if (!formRef.value?.validate()) return
  saving.value = true
  try {
    if (editingType.value) {
      await $api.authRequestTypes.updateType(editingType.value.id, form.value)
      snackbar.add({ type: 'success', text: 'Type updated' })
    } else {
      await $api.authRequestTypes.createType(form.value)
      snackbar.add({ type: 'success', text: 'Type created' })
    }
    closeDialog()
    await loadTypes()
  } catch {
    snackbar.add({ type: 'error', text: 'Error saving type' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (type: IAuthRequestType) => {
  deletingType.value = type
  showDeleteDialog.value = true
}

const deleteType = async () => {
  if (!deletingType.value) return
  deleting.value = true
  try {
    await $api.authRequestTypes.deleteType(deletingType.value.id)
    snackbar.add({ type: 'success', text: 'Type deleted' })
    showDeleteDialog.value = false
    await loadTypes()
  } catch {
    snackbar.add({ type: 'error', text: 'Error deleting type' })
  } finally {
    deleting.value = false
  }
}

// ── Default CC Users ─────────────────────────────────────────────────

let searchTimer: ReturnType<typeof setTimeout> | null = null
const onUserSearch = (q: string) => {
  userSearchQuery.value = q
  if (!q || q.length < 2) { userSearchResults.value = []; return }
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    searchingUsers.value = true
    try {
      userSearchResults.value = await $api.requestCcUsers.searchAvailableUsers(q)
    } finally {
      searchingUsers.value = false
    }
  }, 300)
}

const addCcUser = async (user: IDefaultCcUser | null) => {
  if (!user || !editingType.value) return
  if (ccUsers.value.some(u => u.id === user.id)) { selectedCcUser.value = null; return }
  try {
    ccUsers.value = await $api.authRequestTypes.addDefaultCcUser(editingType.value.id, user.id)
    const idx = types.value.findIndex(t => t.id === editingType.value!.id)
    if (idx >= 0) types.value[idx].default_cc_users = [...ccUsers.value]
  } catch {
    snackbar.add({ type: 'error', text: 'Error adding CC user' })
  } finally {
    selectedCcUser.value = null
    userSearchQuery.value = ''
  }
}

const removeCcUser = async (userId: number) => {
  if (!editingType.value) return
  try {
    ccUsers.value = await $api.authRequestTypes.removeDefaultCcUser(editingType.value.id, userId)
    const idx = types.value.findIndex(t => t.id === editingType.value!.id)
    if (idx >= 0) types.value[idx].default_cc_users = [...ccUsers.value]
  } catch {
    snackbar.add({ type: 'error', text: 'Error removing CC user' })
  }
}

// ── Approvers ─────────────────────────────────────────────────────────

let approversSearchTimer: ReturnType<typeof setTimeout> | null = null
const onApproverSearch = (q: string) => {
  approversSearchQuery.value = q
  if (!q || q.length < 2) { approversSearchResults.value = []; return }
  if (approversSearchTimer) clearTimeout(approversSearchTimer)
  approversSearchTimer = setTimeout(async () => {
    searchingApprovers.value = true
    try {
      approversSearchResults.value = await $api.requestCcUsers.searchAvailableUsers(q)
    } finally {
      searchingApprovers.value = false
    }
  }, 300)
}

const addApprover = async (user: IDefaultCcUser | null) => {
  if (!user || !editingType.value) return
  if (approvers.value.some(u => u.id === user.id)) { selectedApprover.value = null; return }
  try {
    approvers.value = await $api.authRequestTypes.addApprover(editingType.value.id, user.id)
    const idx = types.value.findIndex(t => t.id === editingType.value!.id)
    if (idx >= 0) types.value[idx].approvers = [...approvers.value]
  } catch {
    snackbar.add({ type: 'error', text: 'Error adding approver' })
  } finally {
    selectedApprover.value = null
    approversSearchQuery.value = ''
  }
}

const removeApprover = async (userId: number) => {
  if (!editingType.value) return
  try {
    approvers.value = await $api.authRequestTypes.removeApprover(editingType.value.id, userId)
    const idx = types.value.findIndex(t => t.id === editingType.value!.id)
    if (idx >= 0) types.value[idx].approvers = [...approvers.value]
  } catch {
    snackbar.add({ type: 'error', text: 'Error removing approver' })
  }
}

onMounted(() => loadTypes())
</script>

<style scoped>
.type-card {
  transition: box-shadow 0.15s, transform 0.15s;
}
.type-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.type-card--inactive {
  opacity: 0.6;
}
</style>
