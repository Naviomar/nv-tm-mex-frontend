<template>
  <v-card>
    <v-card-text>
      <div class="flex gap-5 mb-4">
        <v-btn color="primary" @click="onClickCreateRole">Create role</v-btn>
        <v-btn color="primary" @click="onClickCreatePermission">Create permission</v-btn>
      </div>

      <div>
        <div class="font-bold text-lg">Roles</div>
        <div>
          <div>
            <v-text-field
              v-model="filters.roleName"
              type="text"
              label="Filter by role name"
              density="compact"
              class="w-full md:w-1/3"
            />
          </div>
        </div>
        <v-table density="compact" fixed-header>
          <thead>
            <tr>
              <th width="50">Actions</th>
              <th>Role Name</th>
              <td>Attached permission(s)</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(role, index) in filterRoles" :key="`role-${index}`">
              <td>
                <div v-if="false">
                  <div v-if="index !== 0">
                    <v-chip color="red" text-color="white" small @click="confirmDeleteRole(role)"
                      ><v-icon>mdi-delete-outline</v-icon></v-chip
                    >
                  </div>
                </div>
              </td>
              <td>{{ role.name }}</td>
              <td>
                <div v-if="index == 0">Super Admin have all access.</div>
                <div v-if="index !== 0">
                  <v-chip v-for="(permission, index) in role.permissions" :key="`permission-${index}`">
                    <v-icon size="small" color="red" @click="confirmDeleteRolePermission(role, permission)"
                      >mdi-close</v-icon
                    >{{ permission.name }}
                  </v-chip>
                  <v-btn
                    color="primary"
                    density="compact"
                    variant="outlined"
                    size="small"
                    @click="showRoleAddPermission(role)"
                    >Add permission</v-btn
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination rounded="circle" density="compact"></v-pagination>
      </div>
      <div>
        <div class="font-bold text-lg">Permissions</div>
        <div>
          <v-text-field
            v-model="filters.permissionName"
            type="text"
            label="Filter by permission name"
            density="compact"
            class="w-full md:w-1/3"
          />
        </div>

        <v-table density="compact" fixed-header>
          <thead>
            <tr>
              <th width="50">Actions</th>
              <th>Permission Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(permission, index) in filterPermissions" :key="`permission-${index}`">
              <td>
                <v-chip v-if="false" color="red" text-color="white" small @click="confirmDeletePermission(permission)"
                  ><v-icon>mdi-delete-outline</v-icon></v-chip
                >
              </td>
              <td>{{ permission?.name }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination rounded="circle" density="compact"></v-pagination>
      </div>
      <v-dialog v-model="showDialogRole" fullscreen>
        <v-card>
          <v-toolbar color="primary">
            <v-btn icon @click="showDialogRole = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Create rol</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn variant="text" @click="saveRole"> Save </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-card-title>
            <span class="text-h5">Add role</span>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-1">
                <v-text-field v-model="role.name" label="Rol name" />
              </div>
              <div class="col-span-1">
                <v-autocomplete
                  v-model="role.permissions"
                  label="Permission(s)"
                  :items="permissions"
                  item-value="id"
                  item-title="name"
                  multiple
                  return-object
                />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showDialogPermission" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Create permission</span>
          </v-card-title>
          <v-card-text>
            <v-text-field label="Name" v-model="permission.name" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="showDialogPermission = false">Close</v-btn>
            <v-btn color="primary" @click="savePermission">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showFormRoleAddPermission.show" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Role {{ showFormRoleAddPermission.role?.name }}</span>
          </v-card-title>
          <v-card-text>
            <div>Add more permissions</div>
            <v-autocomplete
              v-model="showFormRoleAddPermission.permissions"
              label="Permission(s)"
              :items="roleAvailablePermissions"
              item-value="id"
              item-title="name"
              multiple
              return-object
            />
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="showFormRoleAddPermission.show = false">Close</v-btn>
            <v-btn color="primary" @click="saveRolePermissions">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const roles = ref<any[]>([])
const permissions = ref<any[]>([])

const permission = ref({ name: null })
const role = ref({ name: null, permissions: [] })

const filters = ref({
  roleName: '',
  permissionName: '',
})

let showDialogRole = ref(false)
let showDialogPermission = ref(false)
const showFormRoleAddPermission = ref({ show: false, role: null as any, permissions: [] as any })

const onClickCreateRole = async () => {
  showDialogRole.value = true
}

const onClickCreatePermission = async () => {
  showDialogPermission.value = true
}

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

const savePermission = async () => {
  try {
    loadingStore.start()
    await $api.users.createPermission(permission.value)

    snackbar.add({ type: 'success', text: 'Permission created' })

    permission.value = { name: null }
    await getRolesAndPermissions()
    showDialogPermission.value = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveRole = async () => {
  try {
    loadingStore.start()
    await $api.users.createRole(role.value)

    snackbar.add({ type: 'success', text: 'Role created' })

    role.value = { name: null, permissions: [] }
    await getRolesAndPermissions()
    showDialogRole.value = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveRolePermissions = async () => {
  try {
    if (!showFormRoleAddPermission.value.role || !showFormRoleAddPermission.value.permissions.length) {
      snackbar.add({ type: 'warning', text: 'Role not selected or permissions not selected' })
      return
    }
    loadingStore.start()

    await $api.users.addRolePermissions(showFormRoleAddPermission.value.role?.id, {
      permissions: showFormRoleAddPermission.value.permissions,
    })

    snackbar.add({ type: 'success', text: 'Role permission updated' })

    await getRolesAndPermissions()
    showFormRoleAddPermission.value = { show: false, role: null, permissions: [] }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const confirmDeleteRole = async (rol: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm this action.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.users.deleteRole(rol.id)
      snackbar.add({ type: 'success', text: 'Role deleted' })
      await getRolesAndPermissions()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const confirmDeleteRolePermission = async (role: any, permission: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm this action.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.users.deleteRolePermission(role.id, permission.id)
      snackbar.add({ type: 'success', text: 'Permission deleted' })
      await getRolesAndPermissions()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const confirmDeletePermission = async (permission: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm this action.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.users.deletePermission(permission.id)
      snackbar.add({ type: 'success', text: 'Permission deleted' })
      await getRolesAndPermissions()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const showRoleAddPermission = (role: any) => {
  showFormRoleAddPermission.value = { show: true, role, permissions: [] }
}

const getRolesAndPermissions = async () => {
  const [rolesApi, permissionsApi] = await Promise.all([$api.users.getRoles(), $api.users.getPermissions()])

  // console.log('roles', rolesApi)
  // console.log('permissions', permissionsApi)

  roles.value = rolesApi
  permissions.value = permissionsApi
  console.log('roles', roles.value)
}

const roleAvailablePermissions = computed(() => {
  if (!showFormRoleAddPermission.value.role) return []
  const rolePermissionsIds = showFormRoleAddPermission.value.role.permissions.map((p: any) => p.id)
  return permissions.value.filter((p: any) => !rolePermissionsIds.includes(p.id))
})

onMounted(async () => {
  await getRolesAndPermissions()
})
</script>
