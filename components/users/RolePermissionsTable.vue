<template>
  <div class="space-y-6">
    <!-- Header Actions -->
    <div class="flex flex-wrap gap-3 items-center justify-between">
      <div class="flex gap-3">
        <v-btn color="primary" prepend-icon="mdi-shield-plus" @click="onClickCreateRole">
          Create Role
        </v-btn>
        <v-btn color="secondary" variant="outlined" prepend-icon="mdi-key-plus" @click="onClickCreatePermission">
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
              <th class="text-center" style="width: 120px">Permissions</th>
              <th class="text-center" style="width: 200px">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(role, index) in filterRoles" :key="`role-${role.id}`">
              <td>
                <div class="d-flex align-center">
                  <v-icon size="small" color="primary" class="mr-2">mdi-shield</v-icon>
                  <span class="font-weight-medium">{{ role.name }}</span>
                  <v-chip v-if="index === 0" size="x-small" color="amber" class="ml-2">Super</v-chip>
                </div>
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
                        :disabled="index === 0"
                        @click="openEditPermissionsModal(role)"
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
                        :disabled="index === 0"
                        @click="confirmDeleteRole(role)"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>
            <tr v-if="filterRoles.length === 0">
              <td colspan="3" class="text-center py-8 text-grey">
                <v-icon size="48" color="grey-lighten-1">mdi-shield-off</v-icon>
                <div class="mt-2">No roles found</div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Permissions Section -->
    <v-card>
      <v-card-title class="bg-secondary d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-key</v-icon>
          Permissions ({{ filterPermissions.length }})
        </div>
        <v-text-field
          v-model="filters.permissionName"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search permissions..."
          density="compact"
          hide-details
          clearable
          class="max-w-xs"
          variant="solo"
          bg-color="white"
        />
      </v-card-title>
      <v-card-text class="pa-4">
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="perm in filterPermissions"
            :key="perm.id"
            size="small"
            variant="outlined"
            color="primary"
          >
            <v-icon start size="small">mdi-key-variant</v-icon>
            {{ perm.name }}
          </v-chip>
          <div v-if="filterPermissions.length === 0" class="text-center w-100 py-4 text-grey">
            No permissions found
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Modal: Create Role -->
    <v-dialog v-model="showDialogRole" max-width="600" persistent>
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
          <v-autocomplete
            v-model="role.permissions"
            label="Initial Permissions (optional)"
            :items="permissions"
            item-value="id"
            item-title="name"
            multiple
            chips
            closable-chips
            variant="outlined"
            prepend-inner-icon="mdi-key-variant"
          />
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
    <v-dialog v-model="editPermissionsModal.show" max-width="700" persistent scrollable>
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>
            <v-icon class="mr-2">mdi-key-variant</v-icon>
            Edit Permissions: {{ editPermissionsModal.role?.name }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="editPermissionsModal.show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0" style="max-height: 60vh">
          <v-text-field
            v-model="editPermissionsModal.search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search permissions..."
            density="compact"
            hide-details
            clearable
            class="ma-4"
            variant="outlined"
          />
          <v-list density="compact" class="py-0">
            <v-list-item
              v-for="perm in filteredEditPermissions"
              :key="perm.id"
              class="border-b"
            >
              <v-list-item-title>{{ perm.name }}</v-list-item-title>
              <template #append>
                <v-switch
                  :model-value="editPermissionsModal.selectedIds.includes(perm.id)"
                  color="primary"
                  hide-details
                  density="compact"
                  inset
                  @update:model-value="togglePermission(perm.id)"
                />
              </template>
            </v-list-item>
            <v-list-item v-if="filteredEditPermissions.length === 0">
              <v-list-item-title class="text-center text-grey py-4">
                No permissions match your search
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <div class="text-caption text-grey">
            {{ editPermissionsModal.selectedIds.length }} permission(s) selected
          </div>
          <v-spacer />
          <v-btn variant="text" @click="editPermissionsModal.show = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveRolePermissionsSync" :loading="savingPermissions">
            Save Changes
          </v-btn>
        </v-card-actions>
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
  permissionName: '',
})

const showDialogRole = ref(false)
const showDialogPermission = ref(false)
const loadingUsers = ref<number | null>(null)
const savingPermissions = ref(false)
const roleUserCounts = ref<Record<number, number>>({})

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

const filterPermissions = computed(() => {
  if (!filters.value.permissionName) return permissions.value
  return permissions.value.filter((permission) => {
    return permission.name.toLowerCase().includes(filters.value.permissionName.toLowerCase())
  })
})

const filteredEditPermissions = computed(() => {
  if (!editPermissionsModal.value.search) return permissions.value
  return permissions.value.filter((p) =>
    p.name.toLowerCase().includes(editPermissionsModal.value.search.toLowerCase())
  )
})

const { user } = useCheckUser()

const canDeleteRoles = computed(() => {
  const permissionName = 'roles-delete'
  const hasDirectPermission = user.value?.permissions?.some((p: any) => p.name === permissionName) ?? false
  const hasRolePermission = user.value?.roles?.some((role: any) =>
    role.permissions?.some((p: any) => p.name === permissionName)
  ) ?? false
  return hasDirectPermission || hasRolePermission
})

const roleUsersTooltip = (role: any) => {
  const count = roleUserCounts.value[role.id] ?? 0
  return `View Users (${count})`
}

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

const togglePermission = (permId: number) => {
  const idx = editPermissionsModal.value.selectedIds.indexOf(permId)
  if (idx >= 0) {
    editPermissionsModal.value.selectedIds.splice(idx, 1)
  } else {
    editPermissionsModal.value.selectedIds.push(permId)
  }
}

const showRoleUsers = async (roleData: any) => {
  try {
    loadingUsers.value = roleData.id
    const users = await $api.users.getRoleUsers(roleData.id)
    roleUserCounts.value[roleData.id] = users?.length || 0
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

const saveRolePermissionsSync = async () => {
  if (!editPermissionsModal.value.role) return
  try {
    savingPermissions.value = true
    await $api.users.syncRolePermissions(
      editPermissionsModal.value.role.id,
      editPermissionsModal.value.selectedIds
    )
    snackbar.add({ type: 'success', text: 'Permissions updated successfully' })
    await getRolesAndPermissions()
    editPermissionsModal.value.show = false
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error updating permissions' })
  } finally {
    savingPermissions.value = false
  }
}

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
    
    // Preload user counts for all roles
    roles.value.forEach(async (role) => {
      try {
        const users = await $api.users.getRoleUsers(role.id)
        roleUserCounts.value[role.id] = users?.length || 0
      } catch (e) {
        roleUserCounts.value[role.id] = 0
      }
    })
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
