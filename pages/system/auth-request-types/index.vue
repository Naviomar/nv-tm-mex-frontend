<template>
  <div class="pa-6">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <v-icon icon="mdi-key-variant" size="28" color="primary" />
          <span class="text-h5">Authorization Request Types</span>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          New Type
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table :headers="headers" :items="types" :loading="loading" :items-per-page="15">
          <template #item.kind="{ item }">
            <v-chip size="small" :color="item.kind === 'authorization' ? 'blue' : 'purple'" variant="tonal">
              {{ item.kind === 'authorization' ? 'Authorization' : 'Process' }}
            </v-chip>
          </template>

          <template #item.code="{ item }">
            <code class="text-caption">{{ item.code }}</code>
          </template>

          <template #item.is_active="{ item }">
            <v-chip size="small" :color="item.is_active ? 'success' : 'grey'" variant="tonal">
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>

          <template #item.default_cc_users="{ item }">
            <div class="d-flex flex-wrap gap-1 py-1">
              <v-chip
                v-for="u in (item.default_cc_users ?? [])"
                :key="u.id"
                size="x-small"
                variant="tonal"
                color="primary"
              >
                {{ u.name }}
              </v-chip>
              <span v-if="!(item.default_cc_users?.length)" class="text-caption text-disabled">—</span>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEditDialog(item)" />
              <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(item)" />
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

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
              <v-col cols="6" md="3">
                <v-switch v-model="form.is_active" label="Active" color="primary" />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model.number="form.sort_order" label="Sort Order" type="number" />
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

// Default CC users state
const ccUsers = ref<IDefaultCcUser[]>([])
const userSearchQuery = ref('')
const userSearchResults = ref<IDefaultCcUser[]>([])
const searchingUsers = ref(false)
const selectedCcUser = ref<IDefaultCcUser | null>(null)

const kindOptions = [
  { label: 'Authorization (AuthorizationRequest)', value: 'authorization' },
  { label: 'Process (ProcessRequest)', value: 'process' },
]

const headers = [
  { title: 'Kind', key: 'kind' },
  { title: 'Code', key: 'code' },
  { title: 'Description', key: 'description' },
  { title: 'Status', key: 'is_active' },
  { title: 'Order', key: 'sort_order' },
  { title: 'Default CC', key: 'default_cc_users', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
]

const form = ref({
  kind: 'authorization' as 'authorization' | 'process',
  code: '',
  description: '',
  redirect: '',
  key_label: '',
  icon: '',
  color: '',
  is_active: true,
  sort_order: 0,
})

const codeRules = [(v: string) => !!v || 'Code is required']

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
  form.value = { kind: 'authorization', code: '', description: '', redirect: '', key_label: '', icon: '', color: '', is_active: true, sort_order: 0 }
  showDialog.value = true
}

const openEditDialog = async (type: IAuthRequestType) => {
  editingType.value = type
  form.value = { ...type } as any
  ccUsers.value = type.default_cc_users ?? []
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingType.value = null
  ccUsers.value = []
  userSearchQuery.value = ''
  userSearchResults.value = []
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
    // Refresh the table row too
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

onMounted(() => loadTypes())
</script>
