<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="users">
          <v-icon start>mdi-account-group</v-icon>
          Members
          <v-chip size="x-small" color="primary" variant="tonal" class="ml-2">{{ linkedUsers.length }}</v-chip>
        </v-tab>
        <v-tab value="roles">
          <v-icon start>mdi-shield-account</v-icon>
          Roles & Permissions
        </v-tab>
      </v-tabs>
      <div class="d-flex gap-2">
        <v-btn
          variant="tonal"
          color="deep-purple"
          prepend-icon="mdi-sitemap-outline"
          size="small"
          @click="howItWorksModal.show = true"
        >
          How Roles & Permissions Work
        </v-btn>
        <v-btn
          variant="tonal"
          color="secondary"
          prepend-icon="mdi-help-circle-outline"
          size="small"
          @click="openPermissionsGuide"
        >
          Permissions Guide
        </v-btn>
      </div>
    </div>
    <v-divider class="mb-4" />

    <v-window v-model="activeTab">
      <!-- ====== USERS TAB ====== -->
      <v-window-item value="users">
        <!-- Add user row -->
        <v-card variant="flat" class="mb-4 rounded-lg" bg-color="blue-grey-lighten-5">
          <v-card-text class="pa-4">
            <div class="d-flex align-center gap-2 mb-4">
              <v-avatar color="primary" size="32" rounded="lg">
                <v-icon size="18" color="white">mdi-account-plus</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold">Add member</div>
                <div class="text-caption text-grey-darken-1">Link a user to this department</div>
              </div>
            </div>
            <v-row dense align="center">
              <v-col cols="12" md="5">
                <v-autocomplete
                  v-model="form.user"
                  density="compact"
                  :items="availableUsers"
                  item-title="email"
                  item-value="id"
                  label="Search user by email or name"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                  clearable
                >
                  <template #item="{ props: aProps, item }">
                    <v-list-item v-bind="aProps">
                      <template #prepend>
                        <v-avatar size="28" color="primary">
                          <span class="text-white text-caption">{{ getInitials(item.raw.name) }}</span>
                        </v-avatar>
                      </template>
                      <v-list-item-subtitle>{{ item.raw.name }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="form.department_type"
                  density="compact"
                  :items="departmentTypes"
                  item-title="label"
                  item-value="value"
                  label="Type"
                  variant="outlined"
                  bg-color="white"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  color="primary"
                  variant="flat"
                  block
                  :disabled="!form.user || !form.department_type"
                  @click="linkUser"
                  prepend-icon="mdi-account-plus"
                >
                  Add to Department
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Members table -->
        <v-card variant="flat" class="rounded-lg" bg-color="grey-lighten-5">
          <v-card-text class="pa-0">
            <v-table density="comfortable" hover class="rounded-lg">
              <thead>
                <tr class="bg-grey-lighten-4">
                  <th style="width: 56px"></th>
                  <th>
                    <span class="d-flex align-center gap-2 text-caption font-weight-bold text-grey-darken-1">
                      <v-icon size="16">mdi-account</v-icon> Member
                    </span>
                  </th>
                  <th style="width: 155px">
                    <span class="d-flex align-center gap-2 text-caption font-weight-bold text-grey-darken-1">
                      <v-icon size="16">mdi-badge-account</v-icon> Type
                    </span>
                  </th>
                  <th>
                    <span class="d-flex align-center gap-2 text-caption font-weight-bold text-grey-darken-1">
                      <v-icon size="16">mdi-shield-account</v-icon> Roles
                    </span>
                  </th>
                  <th style="width: 110px">
                    <span class="d-flex align-center gap-2 text-caption font-weight-bold text-grey-darken-1">
                      <v-icon size="16">mdi-key-variant</v-icon> Permissions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, index) in linkedUsers" :key="`user-${index}`">
                  <td>
                    <v-tooltip text="Remove from department" location="top">
                      <template #activator="{ props: tProps }">
                        <v-btn
                          v-bind="tProps"
                          size="x-small"
                          variant="tonal"
                          color="error"
                          icon="mdi-account-minus"
                          @click="unlinkUser(member)"
                        />
                      </template>
                    </v-tooltip>
                  </td>
                  <td>
                    <div class="d-flex align-center gap-2 py-1">
                      <v-avatar
                        size="32"
                        :color="member.pivot?.department_type === 'coordinator' ? 'amber-darken-2' : 'primary'"
                      >
                        <span class="text-white text-caption font-weight-bold">{{ getInitials(member.name) }}</span>
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium text-sm">{{ member.name }}</div>
                        <div class="text-caption text-grey-darken-1">{{ member.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <v-select
                      :model-value="member.pivot?.department_type ?? 'member'"
                      :items="departmentTypes"
                      item-title="label"
                      item-value="value"
                      density="compact"
                      variant="outlined"
                      hide-details
                      style="min-width: 140px"
                      :loading="updatingType === member.id"
                      @update:model-value="(val) => changeUserType(member, val)"
                    />
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <v-chip
                        v-for="role in member.roles"
                        :key="role.id"
                        size="x-small"
                        :color="role.name?.includes('Admin') ? 'amber-darken-2' : 'secondary'"
                        variant="tonal"
                      >
                        {{ role.name }}
                      </v-chip>
                      <span v-if="!member.roles?.length" class="text-caption text-grey-darken-1">—</span>
                    </div>
                  </td>
                  <td>
                    <v-btn
                      size="x-small"
                      variant="tonal"
                      :color="totalPermCount(member) ? 'primary' : 'grey'"
                      prepend-icon="mdi-key-variant"
                      @click="openEditPermissionsModal(member)"
                    >
                      {{ totalPermCount(member) }}
                    </v-btn>
                  </td>
                </tr>
                <tr v-if="linkedUsers.length === 0">
                  <td colspan="5" class="text-center py-10 text-grey">
                    <v-icon size="48" color="grey-lighten-2">mdi-account-group-outline</v-icon>
                    <div class="mt-2 text-caption">No members yet. Add one above.</div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- ====== ROLES TAB ====== -->
      <v-window-item value="roles">
        <DepartmentRolesPanel
          v-if="props.id"
          :department-id="props.id"
          :linked-users="linkedUsers"
          @roles-changed="reloadDepartment"
        />
      </v-window-item>
    </v-window>
  </div>

  <!-- Modal: Edit User Permissions -->
  <v-dialog v-model="editPermissionsModal.show" max-width="1200" persistent scrollable>
    <v-card class="rounded-lg">
      <v-toolbar color="primary" density="comfortable" class="rounded-t-lg">
        <v-toolbar-title>
          <v-icon class="mr-2">mdi-key-variant</v-icon>
          Permissions: {{ editPermissionsModal.user?.name }}
        </v-toolbar-title>
        <v-spacer />
        <div v-if="editPermissionsModal.saving" class="d-flex align-center mr-3 text-white text-caption">
          <v-progress-circular indeterminate size="14" width="2" color="white" class="mr-1" />
          Saving...
        </div>
        <div v-else-if="editPermissionsModal.saved" class="d-flex align-center mr-3 text-white text-caption">
          <v-icon size="14" class="mr-1">mdi-check</v-icon>
          Saved
        </div>
        <!-- Legend: role vs direct -->
        <div class="d-flex align-center gap-3 mr-3 text-white text-caption">
          <span class="d-flex align-center gap-1">
            <v-icon size="12" color="white">mdi-shield-account</v-icon>
            Via role
          </span>
          <span class="d-flex align-center gap-1">
            <v-icon size="12" color="white">mdi-account-key</v-icon>
            Direct ({{ editPermissionsModal.selectedIds.length }})
          </span>
        </div>
        <v-btn icon @click="editPermissionsModal.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text style="max-height: 75vh; overflow-y: auto" class="pa-4 rounded-b-lg">
        <div v-if="editPermissionsModal.loading" class="text-center py-6">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else-if="scopePermissions.length > 0">
          <!-- Role permissions (read-only, shown as context) -->
          <div v-if="editPermissionsModal.rolePermissionIds.length > 0" class="mb-4">
            <div class="d-flex align-center gap-2 mb-2">
              <v-icon size="18" color="secondary">mdi-shield-account</v-icon>
              <span class="text-subtitle-2 font-weight-bold text-secondary">
                Permissions via role (read-only)
              </span>
              <v-chip size="x-small" color="secondary" variant="tonal">
                {{ editPermissionsModal.rolePermissionIds.length }}
              </v-chip>
            </div>
            <PermissionsGrid
              :permissions="scopePermissions.filter(p => editPermissionsModal.rolePermissionIds.includes(p.id))"
              :model-value="editPermissionsModal.rolePermissionIds"
              :readonly="true"
            />
          </div>

          <!-- Direct permissions (editable) -->
          <div>
            <div class="d-flex align-center gap-2 mb-2" :class="editPermissionsModal.rolePermissionIds.length > 0 ? 'mt-4' : ''">
              <v-icon size="18" color="primary">mdi-account-key</v-icon>
              <span class="text-subtitle-2 font-weight-bold text-primary">
                Direct permissions (editable)
              </span>
              <v-chip size="x-small" color="primary" variant="tonal">
                {{ editPermissionsModal.selectedIds.length }}
              </v-chip>
            </div>
            <PermissionsGrid
              :permissions="directScopePermissions"
              v-model="editPermissionsModal.selectedIds"
            />
          </div>
        </div>
        <div v-else class="text-center py-6 text-grey">
          No permissions available in admin scope.
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Modal: Permissions Guide (read-only reference, what each permission does) -->
  <v-dialog v-model="permissionsGuideModal.show" max-width="1200" scrollable>
    <v-card class="rounded-lg">
      <v-toolbar color="secondary" density="comfortable" class="rounded-t-lg">
        <v-toolbar-title>
          <v-icon class="mr-2">mdi-help-circle-outline</v-icon>
          Permissions Guide
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="permissionsGuideModal.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text style="max-height: 75vh; overflow-y: auto" class="pa-4 rounded-b-lg">
        <div class="text-caption text-grey-darken-1 mb-3">
          What each permission available to this department lets a user do.
        </div>
        <div v-if="permissionsGuideModal.loading" class="text-center py-6">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <PermissionsGrid
          v-else-if="scopePermissions.length > 0"
          :permissions="scopePermissions"
          :model-value="[]"
          readonly
          guide
        />
        <div v-else class="text-center py-6 text-grey">
          No permissions available in admin scope.
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Modal: How Roles & Permissions Work (visual/interactive explainer) -->
  <v-dialog v-model="howItWorksModal.show" max-width="1000" scrollable>
    <v-card class="rounded-lg">
      <v-toolbar color="deep-purple" density="comfortable" class="rounded-t-lg">
        <v-toolbar-title>
          <v-icon class="mr-2">mdi-sitemap-outline</v-icon>
          How Roles & Permissions Work
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="howItWorksModal.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text style="max-height: 80vh; overflow-y: auto" class="pa-4 rounded-b-lg">
        <PermissionsExplainer :linked-users="linkedUsers" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const confirm = $notifications.useConfirm()

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})

const activeTab = ref('users')
const linkedUsers = ref<any[]>([])
const allUsers = ref<any[]>([])
const scopePermissions = ref<any[]>([])
const updatingType = ref<number | null>(null)

// Excluye del grid editable los permisos que el usuario ya tiene vía rol,
// para que no se puedan otorgar dos veces por dos mecanismos distintos
// (bug: contador "Direct" inflado con permisos ya cubiertos por el rol).
const directScopePermissions = computed(() =>
  scopePermissions.value.filter((p: any) => !editPermissionsModal.value.rolePermissionIds.includes(p.id))
)

const form = reactive({
  user: null as number | null,
  department_type: null as string | null,
})

const departmentTypes = [
  { label: 'Member', value: 'member' },
  { label: 'Coordinator', value: 'coordinator' },
]

const editPermissionsModal = ref({
  show: false,
  user: null as any,
  selectedIds: [] as number[],
  rolePermissionIds: [] as number[],
  loading: false,
  saving: false,
  saved: false,
})

const permissionsGuideModal = ref({
  show: false,
  loading: false,
})

const howItWorksModal = ref({
  show: false,
})

async function openPermissionsGuide() {
  permissionsGuideModal.value.show = true
  if (scopePermissions.value.length === 0) {
    permissionsGuideModal.value.loading = true
    await loadScopePermissions()
    permissionsGuideModal.value.loading = false
  }
}

function totalPermCount(member: any): number {
  const directIds = new Set((member.permissions ?? []).map((p: any) => p.id))
  const roleIds = (member.roles ?? []).flatMap((r: any) => (r.permissions ?? []).map((p: any) => p.id))
  roleIds.forEach((id: number) => directIds.add(id))
  return directIds.size
}

function getInitials(name: string): string {
  return (name ?? '')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const availableUsers = computed(() =>
  allUsers.value.filter((u: any) => !linkedUsers.value.some((l: any) => l.id === u.id))
)

async function reloadDepartment() {
  if (!props.id) return
  try {
    const response = (await $api.departments.getById(props.id)) as any
    linkedUsers.value = response.users ?? []
  } catch (e) {
    console.error(e)
  }
}

async function loadScopePermissions() {
  if (!props.id) return
  try {
    scopePermissions.value = (await $api.departments.getAdminScopePermissions(props.id)) as any[]
  } catch (e) {
    console.error(e)
  }
}

watch(
  () => props.id,
  async (id) => {
    if (id) {
      try {
        loadingStore.start()
        const response = (await $api.departments.getById(id)) as any
        linkedUsers.value = response.users ?? []
      } catch (e) {
        console.error(e)
      } finally {
        loadingStore.stop()
      }
    }
  },
  { immediate: true }
)

async function linkUser() {
  if (!form.user || !form.department_type) return
  try {
    const body = {
      user_id: form.user,
      department_type: form.department_type,
    }
    await $api.departments.linkUser(props.id!, body)
    const user = allUsers.value.find((u: any) => u.id === form.user)
    linkedUsers.value.push({ ...user, pivot: { department_type: form.department_type }, roles: [], permissions: [] })
    form.user = null
    form.department_type = null
    snackbar.add({ type: 'success', text: 'User added to department' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error adding user' })
  }
}

async function changeUserType(member: any, newType: string) {
  if (member.pivot?.department_type === newType) return
  try {
    updatingType.value = member.id
    await $api.departments.updateUserType(props.id!, { user_id: member.id, department_type: newType })
    const idx = linkedUsers.value.findIndex((u: any) => u.id === member.id)
    if (idx >= 0) {
      linkedUsers.value[idx] = {
        ...linkedUsers.value[idx],
        pivot: { ...linkedUsers.value[idx].pivot, department_type: newType },
      }
      await reloadDepartment()
    }
    snackbar.add({ type: 'success', text: 'Member type updated' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error updating member type' })
  } finally {
    updatingType.value = null
  }
}

async function unlinkUser(member: any) {
  const ok = await confirm({
    title: 'Remove user?',
    confirmationText: 'Remove',
    content: `Remove "${member.name}" from this department? They will lose all department roles and permissions.`,
    dialogProps: { persistent: true, maxWidth: 420 },
    confirmationButtonProps: { color: 'error' },
  })
  if (!ok) return
  try {
    await $api.departments.unlinkUser(props.id!, { user_id: member.id })
    linkedUsers.value = linkedUsers.value.filter((u: any) => u.id !== member.id)
    snackbar.add({ type: 'success', text: 'User removed from department' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error removing user' })
  }
}

async function openEditPermissionsModal(member: any) {
  editPermissionsModal.value = {
    show: true,
    user: member,
    selectedIds: [],
    rolePermissionIds: [],
    loading: true,
    saving: false,
    saved: false,
  }
  try {
    await loadScopePermissions()
    const userDetail = (await $api.users.getUserById(member.id)) as any
    editPermissionsModal.value.selectedIds = userDetail.permissions?.map((p: any) => p.id) ?? []
    // Collect all permission IDs granted via roles
    const rolePermIds = (userDetail.roles ?? [])
      .flatMap((r: any) => (r.permissions ?? []).map((p: any) => p.id))
    editPermissionsModal.value.rolePermissionIds = [...new Set(rolePermIds)] as number[]
  } catch (e) {
    console.error(e)
  } finally {
    editPermissionsModal.value.loading = false
  }
}

let permDebounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => editPermissionsModal.value.selectedIds,
  (ids) => {
    if (!editPermissionsModal.value.user || !editPermissionsModal.value.show || editPermissionsModal.value.loading) return
    if (permDebounceTimer) clearTimeout(permDebounceTimer)
    permDebounceTimer = setTimeout(async () => {
      try {
        editPermissionsModal.value.saving = true
        editPermissionsModal.value.saved = false
        await $api.users.updateUserPermissions(editPermissionsModal.value.user.id, {
          permissions: ids,
          department_id: props.id,
        })
        const idx = linkedUsers.value.findIndex((u: any) => u.id === editPermissionsModal.value.user.id)
        if (idx >= 0) {
          linkedUsers.value[idx].permissions = scopePermissions.value.filter((p: any) => ids.includes(p.id))
        }
        editPermissionsModal.value.saved = true
        setTimeout(() => { editPermissionsModal.value.saved = false }, 2000)
      } catch (e) {
        console.error(e)
        snackbar.add({ type: 'error', text: 'Error saving permissions' })
      } finally {
        editPermissionsModal.value.saving = false
      }
    }, 600)
  },
  { deep: true }
)

onMounted(async () => {
  allUsers.value = (await $api.users.getAllUsers()) as any[]
})
</script>
