<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center gap-3">
        <v-avatar color="primary" size="40" rounded="lg">
          <v-icon size="22" color="white">mdi-shield-account</v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold">Department Roles</div>
          <div class="text-caption text-grey-darken-1">Manage sub-roles and permissions for this department</div>
        </div>
      </div>
      <v-btn color="primary" prepend-icon="mdi-shield-plus" size="small" @click="openCreateDialog">
        Create Sub-Role
      </v-btn>
    </div>

    <!-- Link Existing Role -->
    <v-card variant="flat" class="mb-4 rounded-lg" bg-color="grey-lighten-5">
      <v-card-title class="text-subtitle-1 font-weight-bold py-4">
        <v-icon class="mr-2" color="primary">mdi-link-variant</v-icon>
        Link Existing Role to Department
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="5">
            <v-autocomplete
              v-model="linkForm.roleId"
              :items="allRoles"
              item-title="name"
              item-value="id"
              label="Select role"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="linkForm.roleType"
              :items="roleTypes"
              item-title="label"
              item-value="value"
              label="Role type"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-btn color="primary" :disabled="!linkForm.roleId || !linkForm.roleType" @click="linkExistingRole">
              <v-icon start>mdi-link</v-icon>
              Link Role
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Roles list -->
    <div v-if="roles.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <v-card
        v-for="role in roles"
        :key="role.id"
        variant="flat"
        class="role-card rounded-lg"
        :class="{ 'role-card--admin': role.role_type === 'admin' }"
      >
        <v-card-text class="pa-3">
          <div class="d-flex align-start justify-space-between">
            <div class="d-flex align-center gap-2">
              <v-avatar size="32" :color="role.role_type === 'admin' ? 'amber-darken-2' : 'primary'">
                <v-icon size="18" color="white">
                  {{ role.role_type === 'admin' ? 'mdi-shield-crown' : 'mdi-shield-account' }}
                </v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ role.name }}</div>
                <div class="text-caption text-grey-darken-1">
                  {{ role.permissions?.length ?? 0 }} permissions
                </div>
              </div>
            </div>
            <v-chip
              size="x-small"
              :color="role.role_type === 'admin' ? 'amber-darken-2' : 'primary'"
              variant="tonal"
            >
              {{ role.role_type === 'admin' ? 'Admin' : 'Member' }}
            </v-chip>
          </div>
          <v-divider class="my-2" />
          <div class="d-flex gap-1 justify-end">
            <v-tooltip text="Assign to user" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="x-small"
                  variant="tonal"
                  color="success"
                  icon="mdi-account-plus"
                  @click="openAssignDialog(role)"
                />
              </template>
            </v-tooltip>
            <v-tooltip v-if="role.role_type === 'member'" text="Edit permissions" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  icon="mdi-key-variant"
                  @click="openEditRoleDialog(role)"
                />
              </template>
            </v-tooltip>
            <v-tooltip v-if="role.role_type === 'member'" text="Unlink role from department" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="x-small"
                  variant="tonal"
                  color="error"
                  icon="mdi-link-off"
                  @click="unlinkRole(role)"
                />
              </template>
            </v-tooltip>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-alert v-else type="info" variant="tonal" density="compact" class="mb-4">
      No roles linked to this department yet.
    </v-alert>

    <!-- Assign Role to User Section -->
    <v-card variant="flat" class="rounded-lg" bg-color="blue-grey-lighten-5">
      <v-card-text class="pa-4">
        <div class="d-flex align-center gap-2 mb-4">
          <v-avatar color="success" size="32" rounded="lg">
            <v-icon size="18" color="white">mdi-account-key</v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold">Assign Role to User</div>
            <div class="text-caption text-grey-darken-1">Grant a department role to a linked member</div>
          </div>
        </div>
        <v-row dense align="center">
          <v-col cols="12" md="5">
            <v-autocomplete
              v-model="assignForm.userId"
              :items="props.linkedUsers"
              item-title="email"
              item-value="id"
              label="Select user"
              density="compact"
              variant="outlined"
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
          <v-col cols="12" md="5">
            <v-autocomplete
              v-model="assignForm.roleId"
              :items="roles"
              item-title="name"
              item-value="id"
              label="Select role"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            >
              <template #item="{ props: aProps, item }">
                <v-list-item v-bind="aProps">
                  <template #prepend>
                    <v-icon :color="item.raw.role_type === 'admin' ? 'amber-darken-2' : 'primary'" size="small">
                      {{ item.raw.role_type === 'admin' ? 'mdi-shield-crown' : 'mdi-shield-account' }}
                    </v-icon>
                  </template>
                  <v-list-item-subtitle>{{ item.raw.role_type }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn
              color="success"
              variant="flat"
              block
              :disabled="!assignForm.userId || !assignForm.roleId"
              :loading="saving"
              @click="assignRole"
            >
              Assign
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Dialog: Create Member Role -->
    <v-dialog v-model="createDialog.show" max-width="1200" persistent scrollable>
      <v-card class="rounded-lg">
        <v-toolbar color="primary" density="comfortable" class="rounded-t-lg">
          <v-toolbar-title>
            <v-icon class="mr-2">mdi-shield-plus</v-icon>
            Create Member Role
          </v-toolbar-title>
          <v-spacer />
          <span class="text-white text-caption mr-3">{{ createDialog.selectedPermissionIds.length }} selected</span>
          <v-btn icon @click="createDialog.show = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text style="max-height: 75vh; overflow-y: auto" class="pa-4">
          <v-text-field
            v-model="createDialog.name"
            label="Role Name *"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-shield"
            class="mb-4"
            :rules="[(v) => !!v || 'Role name is required']"
          />
          <div class="text-caption text-grey-darken-1 mb-2">
            Select permissions from the admin scope for this role:
          </div>
          <PermissionsGrid
            v-if="scopePermissions.length > 0"
            :permissions="scopePermissions"
            v-model="createDialog.selectedPermissionIds"
          />
          <v-alert v-else type="warning" variant="tonal" density="compact">
            No admin scope permissions available. Please have IT link an admin role to this department first.
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="createDialog.show = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" :disabled="!createDialog.name" @click="saveNewRole">
            Create Role
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Edit Role Permissions -->
    <v-dialog v-model="editDialog.show" max-width="1200" persistent scrollable>
      <v-card class="rounded-lg">
        <v-toolbar color="primary" density="comfortable" class="rounded-t-lg">
          <v-toolbar-title>
            <v-icon class="mr-2">mdi-key-variant</v-icon>
            Edit Permissions: {{ editDialog.role?.name }}
          </v-toolbar-title>
          <v-spacer />
          <div v-if="editDialog.saving" class="d-flex align-center mr-3 text-white text-caption">
            <v-progress-circular indeterminate size="14" width="2" color="white" class="mr-1" />
            Saving...
          </div>
          <div v-else-if="editDialog.saved" class="d-flex align-center mr-3 text-white text-caption">
            <v-icon size="14" class="mr-1">mdi-check</v-icon>
            Saved
          </div>
          <span class="text-white text-caption mr-3">{{ editDialog.selectedPermissionIds.length }} selected</span>
          <v-btn icon @click="editDialog.show = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text style="max-height: 75vh; overflow-y: auto" class="pa-4">
          <PermissionsGrid
            v-if="scopePermissions.length > 0"
            :permissions="scopePermissions"
            v-model="editDialog.selectedPermissionIds"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog: Assign Role to User (from role row button) -->
    <v-dialog v-model="assignDialog.show" max-width="500" persistent>
      <v-card class="rounded-lg">
        <v-toolbar color="success" density="comfortable" class="rounded-t-lg">
          <v-toolbar-title>
            <v-icon class="mr-2">mdi-account-plus</v-icon>
            Assign Role: {{ assignDialog.role?.name }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="assignDialog.show = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-autocomplete
            v-model="assignDialog.userId"
            :items="props.linkedUsers"
            item-title="email"
            item-value="id"
            label="Select user"
            density="compact"
            variant="outlined"
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
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="assignDialog.show = false">Cancel</v-btn>
          <v-btn color="success" variant="flat" :loading="saving" :disabled="!assignDialog.userId" @click="assignRoleFromDialog">
            Assign
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()

const props = defineProps<{
  departmentId: string
  linkedUsers: any[]
}>()

const emit = defineEmits<{
  (e: 'roles-changed'): void
}>()

const roles = ref<any[]>([])
const scopePermissions = ref<any[]>([])
const saving = ref(false)
const allRoles = ref<any[]>([])

const roleTypes = [
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
]

const linkForm = ref({
  roleId: null as number | null,
  roleType: 'admin' as string,
})

const createDialog = ref({
  show: false,
  name: '',
  selectedPermissionIds: [] as number[],
})

const editDialog = ref({
  show: false,
  role: null as any,
  selectedPermissionIds: [] as number[],
  saving: false,
  saved: false,
})

const assignDialog = ref({
  show: false,
  role: null as any,
  userId: null as number | null,
})

const assignForm = ref({
  userId: null as number | null,
  roleId: null as number | null,
})

function getInitials(name: string): string {
  return (name ?? '')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

async function loadRoles() {
  try {
    roles.value = (await $api.departments.getDepartmentRoles(props.departmentId)) as any[]
  } catch (e) {
    console.error(e)
  }
}

async function loadScopePermissions() {
  try {
    scopePermissions.value = (await $api.departments.getAdminScopePermissions(props.departmentId)) as any[]
  } catch (e) {
    console.error(e)
  }
}

async function openCreateDialog() {
  await loadScopePermissions()
  createDialog.value = { show: true, name: '', selectedPermissionIds: [] }
}

async function openEditRoleDialog(role: any) {
  await loadScopePermissions()
  editDialog.value = {
    show: true,
    role,
    selectedPermissionIds: role.permissions?.map((p: any) => p.id) ?? [],
    saving: false,
    saved: false,
  }
}

function openAssignDialog(role: any) {
  assignDialog.value = { show: true, role, userId: null }
}

async function saveNewRole() {
  if (!createDialog.value.name) return
  try {
    saving.value = true
    await $api.departments.createMemberRole(props.departmentId, {
      name: createDialog.value.name,
      permission_ids: createDialog.value.selectedPermissionIds,
    })
    snackbar.add({ type: 'success', text: 'Role created and linked to department' })
    createDialog.value.show = false
    await loadRoles()
    emit('roles-changed')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error creating role' })
  } finally {
    saving.value = false
  }
}

let editRoleDebounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => editDialog.value.selectedPermissionIds,
  (ids) => {
    if (!editDialog.value.role || !editDialog.value.show) return
    if (editRoleDebounceTimer) clearTimeout(editRoleDebounceTimer)
    editRoleDebounceTimer = setTimeout(async () => {
      try {
        editDialog.value.saving = true
        editDialog.value.saved = false
        await $api.departments.syncRolePermissions(props.departmentId, {
          role_id: editDialog.value.role.id,
          permission_ids: ids,
        })
        await loadRoles()
        emit('roles-changed')
        editDialog.value.saved = true
        setTimeout(() => { editDialog.value.saved = false }, 2000)
      } catch (e) {
        console.error(e)
        snackbar.add({ type: 'error', text: 'Error updating role permissions' })
      } finally {
        editDialog.value.saving = false
      }
    }, 600)
  },
  { deep: true }
)

async function linkExistingRole() {
  if (!linkForm.value.roleId || !linkForm.value.roleType) return
  try {
    saving.value = true
    await $api.departments.linkRole(props.departmentId, {
      role_id: linkForm.value.roleId,
      role_type: linkForm.value.roleType,
    })
    snackbar.add({ type: 'success', text: 'Role linked' })
    linkForm.value = { roleId: null, roleType: 'admin' }
    await loadRoles()
    emit('roles-changed')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error linking role' })
  } finally {
    saving.value = false
  }
}

async function unlinkRole(role: any) {
  const result = await confirm({
    title: 'Unlink Role?',
    confirmationText: 'Unlink',
    content: `Remove "${role.name}" from this department? The role itself will not be deleted.`,
    dialogProps: { persistent: true, maxWidth: 400 },
    confirmationButtonProps: { color: 'error' },
  })
  if (!result) return
  try {
    saving.value = true
    await $api.departments.unlinkRole(props.departmentId, { role_id: role.id })
    snackbar.add({ type: 'success', text: 'Role unlinked from department' })
    await loadRoles()
    emit('roles-changed')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error unlinking role' })
  } finally {
    saving.value = false
  }
}

async function assignRole() {
  if (!assignForm.value.userId || !assignForm.value.roleId) return
  try {
    saving.value = true
    await $api.departments.assignRoleToUser(props.departmentId, {
      user_id: assignForm.value.userId,
      role_id: assignForm.value.roleId,
    })
    snackbar.add({ type: 'success', text: 'Role assigned to user' })
    assignForm.value = { userId: null, roleId: null }
    emit('roles-changed')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error assigning role' })
  } finally {
    saving.value = false
  }
}

async function assignRoleFromDialog() {
  if (!assignDialog.value.userId || !assignDialog.value.role) return
  try {
    saving.value = true
    await $api.departments.assignRoleToUser(props.departmentId, {
      user_id: assignDialog.value.userId,
      role_id: assignDialog.value.role.id,
    })
    snackbar.add({ type: 'success', text: 'Role assigned to user' })
    assignDialog.value.show = false
    emit('roles-changed')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error assigning role' })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadRoles()
  allRoles.value = (await $api.users.getRoles()) as any[] ?? []
})

watch(() => props.departmentId, async () => {
  if (props.departmentId) await loadRoles()
}, { immediate: false })
</script>

<style scoped>
.role-card {
  border-left: 4px solid rgba(var(--v-theme-primary), 0.55);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.role-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.role-card--admin {
  border-left: 4px solid rgba(255, 143, 0, 0.55);
  background-color: rgba(255, 143, 0, 0.04);
}
</style>
