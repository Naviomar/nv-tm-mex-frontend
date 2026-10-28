<template>
  <div class="space-y-6">
    <!-- Header Actions -->
    <div class="flex flex-wrap gap-3 items-center justify-between">
      <div class="flex gap-3">
        <v-btn v-if="hasPermission('roles-create')" color="primary" prepend-icon="mdi-shield-plus" @click="onClickCreateRole">
          Create Role
        </v-btn>
        <v-btn v-if="hasPermission('permissions-create')" color="secondary" variant="outlined" prepend-icon="mdi-key-plus" @click="onClickCreatePermission">
          Create Permission
        </v-btn>
      </div>
      <v-text-field
        v-model="filters.roleName"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search roles..."
        density="compact"
        hide-details
        clearable
        class="max-w-xs"
        variant="outlined"
      />
    </div>

    <!-- Roles Section -->
    <v-card>
      <v-card-title class="bg-primary text-white d-flex align-center">
        <v-icon class="mr-2">mdi-shield-account</v-icon>
        Roles ({{ filterRoles.length }})
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table density="comfortable" hover>
          <thead>
            <tr class="bg-grey-lighten-4">
              <th class="text-left" style="width: 250px">Role Name</th>
              <th class="text-left">Departments</th>
              <th class="text-center" style="width: 90px">Users</th>
              <th class="text-center" style="width: 120px">Permissions</th>
              <th class="text-center" style="width: 240px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in filterRoles" :key="`role-${role.id}`">
              <td>
                <div class="d-flex align-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-shield</v-icon>
                  <span class="font-weight-medium">{{ role.name }}</span>
                  <v-chip v-if="role.name === 'Super Admin'" size="x-small" color="amber" class="ml-2">Super</v-chip>
                </div>
              </td>
              <td>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="dept in role.department_links"
                    :key="`${role.id}-${dept.id}`"
                    size="x-small"
                    :color="dept.role_type === 'admin' ? 'amber-darken-2' : 'primary'"
                    variant="tonal"
                    :title="dept.role_type === 'admin' ? 'Admin role of this department' : 'Member role of this department'"
                  >
                    <v-icon start size="12">{{ dept.role_type === 'admin' ? 'mdi-shield-crown' : 'mdi-shield-account' }}</v-icon>
                    {{ dept.name }}
                  </v-chip>
                  <span v-if="!role.department_links?.length" class="text-caption text-medium-emphasis">No department</span>
                </div>
              </td>
              <td class="text-center">
                <v-chip size="small" :color="role.users_count > 0 ? 'info' : 'grey'" variant="tonal">
                  {{ role.users_count ?? 0 }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-chip size="small" :color="role.permissions?.length > 0 ? 'success' : 'grey'">
                  {{ role.permissions?.length || 0 }}
                </v-chip>
              </td>
              <td class="text-center">
                <div class="d-flex justify-center gap-1">
                  <v-tooltip text="Edit Permissions" location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="small"
                        variant="tonal"
                        color="primary"
                        icon="mdi-key-variant"
                        :disabled="!hasPermission('roles-edit')"
                        @click="openEditPermissionsModal(role)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip v-if="hasPermission('roles-create')" text="Duplicate role" location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="small"
                        variant="tonal"
                        color="secondary"
                        icon="mdi-content-copy"
                        @click="onClickDuplicateRole(role)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip :text="roleUsersTooltip(role)" location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="small"
                        variant="tonal"
                        color="info"
                        icon="mdi-account-group"
                        @click="showRoleUsers(role)"
                        :loading="loadingUsers === role.id"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip v-if="canDeleteRoles" text="Delete Role" location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        size="small"
                        variant="tonal"
                        color="error"
                        icon="mdi-delete"
                        :disabled="role.name === 'Super Admin'"
                        @click="confirmDeleteRole(role)"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>
            <tr v-if="filterRoles.length === 0">
              <td colspan="5" class="text-center py-8 text-grey">
                <v-icon size="48" color="grey-lighten-1">mdi-shield-off</v-icon>
                <div class="mt-2">No roles found</div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Permissions catalog -->
    <v-card>
      <v-card-title class="bg-secondary d-flex align-center">
        <v-icon class="mr-2">mdi-key</v-icon>
        Permissions catalog ({{ permissions.length }})
      </v-card-title>
      <v-card-text class="pa-4">
        <div class="text-caption text-medium-emphasis mb-3">
          Every permission in the system and what it allows. To change what a role grants use the
          <v-icon size="14">mdi-key-variant</v-icon> button above.
        </div>
        <RolePermissionsPanel :permissions="permissions" guide />
      </v-card-text>
    </v-card>

    <!-- Modal: Create Role -->
    <v-dialog v-model="showDialogRole" max-width="1100" persistent scrollable>
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>
            <v-icon class="mr-2">mdi-shield-plus</v-icon>
            Create New Role
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="showDialogRole = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pt-6">
          <v-text-field
            v-model="role.name"
            label="Role Name"
            variant="outlined"
            prepend-inner-icon="mdi-shield"
            :rules="[v => !!v || 'Role name is required']"
          />
          <div class="text-caption text-medium-emphasis mb-2">Permissions (optional, you can change them later)</div>
          <RolePermissionsPanel :permissions="permissions" v-model="role.permissions" />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showDialogRole = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveRole" :disabled="!role.name">
            Create Role
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal: Create Permission -->
    <v-dialog v-model="showDialogPermission" max-width="500" persistent>
      <v-card>
        <v-toolbar color="secondary" density="compact">
          <v-toolbar-title>
            <v-icon class="mr-2">mdi-key-plus</v-icon>
            Create New Permission
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="showDialogPermission = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pt-6">
          <v-text-field
            v-model="permission.name"
            label="Permission Name"
            variant="outlined"
            prepend-inner-icon="mdi-key"
            placeholder="e.g., users-create"
            :rules="[v => !!v || 'Permission name is required']"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showDialogPermission = false">Cancel</v-btn>
          <v-btn color="secondary" variant="flat" @click="savePermission" :disabled="!permission.name">
            Create Permission
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal: Edit Role Permissions -->
    <v-dialog v-model="editPermissionsModal.show" max-width="1200" persistent scrollable>
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>
            <v-icon class="mr-2">mdi-key-variant</v-icon>
            Edit Permissions: {{ editPermissionsModal.role?.name }}
          </v-toolbar-title>
          <v-spacer />
          <div v-if="savingPermissions" class="d-flex align-center mr-3 text-white text-caption">
            <v-progress-circular indeterminate size="14" width="2" color="white" class="mr-1" />
            Saving...
          </div>
          <div v-else-if="savedPermissions" class="d-flex align-center mr-3 text-white text-caption">
            <v-icon size="14" class="mr-1">mdi-check</v-icon>
            Saved
          </div>
          <span class="text-white text-caption mr-3">{{ editPermissionsModal.selectedIds.length }} selected</span>
          <v-btn icon @click="editPermissionsModal.show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text style="max-height: 75vh; overflow-y: auto" class="pa-4">
          <RolePermissionsPanel
            :permissions="permissions"
            v-model="editPermissionsModal.selectedIds"
            :affected-users="editPermissionsModal.role?.users_count"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal: View Role Users -->
    <v-dialog v-model="usersModal.show" max-width="600" scrollable>
      <v-card>
        <v-toolbar color="info" density="compact">
          <v-toolbar-title>
            <v-icon class="mr-2">mdi-account-group</v-icon>
            Users with role: {{ usersModal.role?.name }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="usersModal.show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0" style="max-height: 50vh">
          <v-list v-if="usersModal.users.length > 0" density="compact">
            <v-list-item v-for="user in usersModal.users" :key="user.id" class="border-b">
              <template #prepend>
                <v-avatar size="36" color="primary">
                  <span class="text-white text-caption">{{ getInitials(user.name) }}</span>
                </v-avatar>
              </template>
              <v-list-item-title>{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <div v-else class="text-center py-8 text-grey">
            <v-icon size="48" color="grey-lighten-1">mdi-account-off</v-icon>
            <div class="mt-2">No users have this role</div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <div class="text-caption text-grey">
            {{ usersModal.users.length }} user(s) found
          </div>
          <v-spacer />
          <v-btn variant="text" @click="usersModal.show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const roles = ref<any[]>([])
const permissions = ref<any[]>([])

const permission = ref({ name: '' })
const role = ref<{ name: string; permissions: any[] }>({ name: '', permissions: [] })

const filters = ref({
  roleName: '',
})

const showDialogRole = ref(false)
const showDialogPermission = ref(false)
const loadingUsers = ref<number | null>(null)
const savingPermissions = ref(false)
const savedPermissions = ref(false)

// Edit Permissions Modal
const editPermissionsModal = ref({
  show: false,
  role: null as any,
  selectedIds: [] as number[],
  search: '',
})

// Users Modal
const usersModal = ref({
  show: false,
  role: null as any,
  users: [] as any[],
})

const filterRoles = computed(() => {
  if (!filters.value.roleName) return roles.value
  return roles.value.filter((role) => {
    return role.name.toLowerCase().includes(filters.value.roleName.toLowerCase())
  })
})

const { hasPermission } = useCheckUser()

const canDeleteRoles = computed(() => hasPermission('roles-delete'))

const roleUsersTooltip = (role: any) => `View Users (${role.users_count ?? 0})`

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const onClickCreateRole = () => {
  role.value = { name: '', permissions: [] }
  showDialogRole.value = true
}

const onClickDuplicateRole = (source: any) => {
  role.value = {
    name: `${source.name} (copy)`,
    permissions: (source.permissions ?? []).map((p: any) => p.id),
  }
  showDialogRole.value = true
}

const onClickCreatePermission = () => {
  permission.value = { name: '' }
  showDialogPermission.value = true
}

const openEditPermissionsModal = (roleData: any) => {
  editPermissionsModal.value = {
    show: true,
    role: roleData,
    selectedIds: roleData.permissions?.map((p: any) => p.id) || [],
    search: '',
  }
}


const showRoleUsers = async (roleData: any) => {
  try {
    loadingUsers.value = roleData.id
    const users = await $api.users.getRoleUsers(roleData.id)
    usersModal.value = {
      show: true,
      role: roleData,
      users: users || [],
    }
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading users' })
  } finally {
    loadingUsers.value = null
  }
}

const savePermission = async () => {
  try {
    loadingStore.start()
    await $api.users.createPermission(permission.value)
    snackbar.add({ type: 'success', text: 'Permission created successfully' })
    permission.value = { name: '' }
    await getRolesAndPermissions()
    showDialogPermission.value = false
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error creating permission' })
  } finally {
    loadingStore.stop()
  }
}

const saveRole = async () => {
  try {
    loadingStore.start()
    await $api.users.createRole({
      name: role.value.name,
      permissions: role.value.permissions,
    })
    snackbar.add({ type: 'success', text: 'Role created successfully' })
    role.value = { name: '', permissions: [] }
    await getRolesAndPermissions()
    showDialogRole.value = false
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error creating role' })
  } finally {
    loadingStore.stop()
  }
}

const sameIds = (a: number[], b: number[]) => a.length === b.length && new Set([...a, ...b]).size === a.length

let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => editPermissionsModal.value.selectedIds,
  (ids) => {
    if (!editPermissionsModal.value.role || !editPermissionsModal.value.show) return
    // Opening the dialog also replaces selectedIds: don't save when nothing changed.
    if (sameIds(ids, (editPermissionsModal.value.role.permissions ?? []).map((p: any) => p.id))) {
      if (saveDebounceTimer) clearTimeout(saveDebounceTimer)
      return
    }
    if (saveDebounceTimer) clearTimeout(saveDebounceTimer)
    saveDebounceTimer = setTimeout(async () => {
      try {
        savingPermissions.value = true
        savedPermissions.value = false
        await $api.users.syncRolePermissions(editPermissionsModal.value.role.id, ids)
        savedPermissions.value = true
        editPermissionsModal.value.role.permissions = permissions.value.filter((p: any) => ids.includes(p.id))
        await getRolesAndPermissions()
        setTimeout(() => { savedPermissions.value = false }, 2000)
      } catch (e) {
        console.error(e)
        snackbar.add({ type: 'error', text: 'Error updating permissions' })
      } finally {
        savingPermissions.value = false
      }
    }, 600)
  },
  { deep: true }
)

const confirmDeleteRole = async (rol: any) => {
  const result = await confirm({
    title: 'Delete Role?',
    confirmationText: 'Delete',
    content: `Are you sure you want to delete the role "${rol.name}"? This action cannot be undone.`,
    dialogProps: { persistent: true, maxWidth: 400 },
    confirmationButtonProps: { color: 'error' },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.users.deleteRole(rol.id)
      snackbar.add({ type: 'success', text: 'Role deleted successfully' })
      await getRolesAndPermissions()
    } catch (e) {
      console.error(e)
      snackbar.add({ type: 'error', text: 'Error deleting role' })
    } finally {
      loadingStore.stop()
    }
  }
}

const getRolesAndPermissions = async () => {
  try {
    const [rolesApi, permissionsApi] = await Promise.all([
      $api.users.getRoles(),
      $api.users.getPermissions(),
    ])
    roles.value = rolesApi || []
    permissions.value = permissionsApi || []
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading data' })
  }
}

onMounted(async () => {
  loadingStore.start()
  await getRolesAndPermissions()
  loadingStore.stop()
})
</script>
