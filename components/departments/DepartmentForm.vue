<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-5">
        <div>
          <InputText density="compact" name="name" label="Name *" />
        </div>
        <div>
          <InputText density="compact" name="description" label="Description *" />
        </div>

        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/system/departments"> Cancel </v-btn>
          <v-btn color="primary" @click="saveCharge"> Save </v-btn>
        </div>
        <div class="py-4">
          <v-btn size="small" color="brown" @click="showRoles = !showRoles">Importar permisos de un rol</v-btn>
          <div v-if="showRoles">
            <v-autocomplete
              v-model="selectedRole"
              :items="roles"
              item-title="name"
              item-value="id"
              label="Select role"
              density="compact"
            />
            <!-- Show permisions from selected rol -->
            <div v-if="selectedRole">
              <div class="mt-2 font-bold">
                {{ roles.find((r: any) => r.id === selectedRole)?.permissions.length }} Permissions in role "{{
                  roles.find((r: any) => r.id === selectedRole)?.name
                }}"
              </div>
              <v-text-field
                v-model="rolePermissionSearch"
                density="compact"
                label="Buscar permiso dentro del rol"
                prepend-inner-icon="mdi-magnify"
                class="mb-2"
                hide-details
              />
              <v-table density="compact" class="max-h-48 overflow-y-auto">
                <thead>
                  <tr>
                    <th class="text-left">Permission Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(permission, index) in filteredRolePermissions" :key="`role-perm-${index}`">
                    <td>{{ permission.name }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <v-btn size="small" color="primary" @click="importRolePermissions">Import all permissions from role</v-btn>
          </div>
        </div>

        <div class="mt-8 font-bold">Permissions</div>
        <div class="flex gap-2">
          <v-autocomplete
            v-model="form.permission"
            density="compact"
            :items="availablePermissions"
            item-title="name"
            item-value="id"
            label="Select permission"
          />
          <v-btn color="primary" size="small" @click="linkPermission">Add</v-btn>
        </div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="w-12 text-left">Actions</th>
              <th class="text-left">Permission Name</th>
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(permission, index) in linkedPermissions" :key="`perm-${index}`">
              <td>
                <div class="flex gap-2">
                  <div v-if="whoRolDelete() === 'true'"><TrashButton :item="permission" @click="unlinkPermission(permission)" /></div>
                </div>
              </td>
              <td>{{ permission.name }}</td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="permission">
                  {{ formatDateString(permission.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
      <div class="col-span-7">
        <div class="font-bold">Users</div>
        <div class="flex gap-4">
            <v-row>
              <v-col cols="12" md="3">
                  <div>
                      <v-autocomplete
                          name="givePerm"
                          v-model="form.give_perm"
                          :items="linkedPermissions"
                          item-title="name"
                          item-value="name"
                          label="Select permission"
                          density="compact"
                          multiple
                        />
                    </div>
                  </v-col>

                  <v-col cols="12" md="3">
                    <div> 
                        <v-autocomplete
                        name="userPerm"
                        v-model="form.user"
                        density="compact"
                        :items="availableUsers"
                        item-title="email"
                        item-value="id"
                        label="Select user"
                      />
                  </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div>
                      <v-autocomplete
                        name="department_type"
                        v-model="form.department_type"
                        density="compact"
                        :items="departmentTypes"
                        item-title="label"
                        item-value="value"
                        label="Type"
                        class="w-32"
                      />
                    </div>
                </v-col>

              </v-row>
          
          <v-btn color="primary" size="small" @click="linkUser">Add</v-btn>
        </div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Email</th>
              <th class="text-left">Type</th>
              <th class="text-left">Permissions</th>
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in linkedUsers" :key="`user-${index}`">
              <td>
                <div class="flex gap-2">
                  <TrashButton :item="user" @click="unlinkUser(user)" />
                </div>
              </td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.pivot?.department_type }}</td>
              <td><span v-bind="props" class="mdi mdi-account-details" size="large" @click="openEditPermissionsModal(user)"></span></td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="user">
                  {{ formatDateString(user.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-alert density="compact" type="warning" variant="outlined">
          Removing a user from this department will be detached from all notifications.
        </v-alert>
      </div>
    </div>
  </div>

  <!-- Modal: Edit Role Permissions -->
    <v-dialog v-model="editPermissionsModal.show" max-width="700" persistent scrollable>
      <v-card>
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title>
            <v-icon class="mr-2">mdi-key-variant</v-icon>
            Edit Permissions: 
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="editPermissionsModal.show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0" style="max-height: 60vh">
          <v-text-field
            
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
              class="border-b"
            >
              <v-list-item-title></v-list-item-title>
              <v-list-item
                 v-for="(data, index) in permissions_usr.permissions"
                :key="data"
                class="border-b"
              >
                {{ data.name }}
            
                <template #append>
                <TrashButton size="small" :item="permissions_usr" density="compact" variant="text"  @click="unlinkPermissionUsr(permissions_usr.id,data)" :can-restore="false" />

                
                </template>
              </v-list-item>
              
            </v-list-item>
            <v-list-item >
              <v-list-item-title class="text-center text-grey py-4">
                No permissions match your search
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <div class="text-caption text-grey">
            permission(s) selected
          </div>
          <v-spacer />
          <v-btn color="red" @click="editPermissionsModal.show = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="" >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { schema } from '~/forms/departmentForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { user } = useCheckUser()

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})

const catalogs = reactive({
  roles: [],
  permissions: [],
})

const permRol = computed(() => {
  const allRols = user.value?.roles
  var permisos = [];
  ///todos los roles
  for(var r = 0; r < allRols?.length; r++){
    const perRolls = allRols[r].permissions
    for(var ar = 0; ar < perRolls?.length; ar++){
      permisos.push(perRolls[ar])
    }
  }
  return permisos
})

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const [roles, permissions] = await Promise.all([$api.users.getRoles(), $api.users.getPermissions()])
    catalogs.roles = roles
    catalogs.permissions = permissions
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const linkedUsers = ref<any>([])
const users = ref<any>([])
const linkedPermissions = ref<any>([])
const permissions = ref<any>([])
const roles = ref<any>([])
const showRoles = ref(false)
const selectedRole = ref<number | null>(null)
const rolePermissionSearch = ref('')

function whoRolDelete() {
  var canDelete = 'false';
  var allRolDel = user.value?.roles
  var idRolDel = 0
  for(var i=0; i<allRolDel.length; i++){
    idRolDel = allRolDel[i].id
    if(idRolDel === 1){
      canDelete = 'true';
    }
  }
  return canDelete;
}

const form = reactive({
  user: null,
  department_type: null,
  permission: null,
  give_perm: null
})
const availablePermissions = computed(() => {
  return permissions.value.filter((perm: any) => {
    return !linkedPermissions.value.some((linked: any) => linked.id === perm.id)
  })
})
const departmentTypes = [
  { label: 'Member', value: 'member' },
  { label: 'Coordinator', value: 'coordinator' },
]

watch(
  () => props.id,
  async (id) => {
    if (id) {
      const response = (await $api.departments.getById(id)) as any
      setValues(response)
      linkedUsers.value = response.users
      linkedPermissions.value = response.permissions || []
    }
  },
  { immediate: true }
)

const filteredRolePermissions = computed(() => {
  const role = roles.value.find((r: any) => r.id === selectedRole.value)
  if (!role) return []
  if (!rolePermissionSearch.value) return role.permissions
  return role.permissions.filter((perm: any) =>
    perm.name.toLowerCase().includes(rolePermissionSearch.value.toLowerCase())
  )
})

const importRolePermissions = async () => {
  if (!selectedRole.value) {
    snackbar.add({ type: 'warning', text: 'Please select a role' })
    return
  }
  const role = roles.value.find((r: any) => r.id === selectedRole.value)
  if (!role) {
    snackbar.add({ type: 'error', text: 'Role not found' })
    return
  }
  const body = {
    role_id: role.id,
  }
  await $api.departments.importRolePermissions(props.id!, body)
  // add permissions to linkedPermissions that are not already linked
  role.permissions.forEach((perm: any) => {
    if (!linkedPermissions.value.some((p: any) => p.id === perm.id)) {
      linkedPermissions.value.push(perm)
    }
  })
  snackbar.add({ type: 'success', text: 'Permissions imported' })
}

const linkPermission = async () => {
  if (!form.permission) {
    snackbar.add({ type: 'warning', text: 'Please select a permission' })
    return
  }
  const body = {
    permission_id: form.permission,
  }
  await $api.departments.linkPermission(props.id!, body)
  const permission = permissions.value.find((p: any) => p.id === form.permission)
  linkedPermissions.value.push(permission)
  form.permission = null
  snackbar.add({ type: 'success', text: 'Permission linked' })
}

const unlinkPermission = async (permission: any) => {
  const body = {
    permission_id: permission.id,
  }
  await $api.departments.unlinkPermission(props.id!, body)
  linkedPermissions.value = linkedPermissions.value.filter((p: any) => p.id !== permission.id)
  snackbar.add({ type: 'success', text: 'Permission unlinked' })
}

const editPermissionsModal = ref({
  show: false,
})

const permissions_usr = ref<any>([])
function openEditPermissionsModal(user: any) {
  editPermissionsModal.value.show = true
  const perm_usr = $api.users.getUserById(user.id)
    .then((myPromise) => {
      return myPromise
  });

  const permUsr = async () => {
    return permissions_usr.value = await perm_usr;  
  };
  permUsr()
}

function unlinkPermissionUsr(user: any, data: any){
  try{
      const name_permission = data.name
      const deletePermi = $api.users.deleteUserPermission(user,name_permission)
      const last_perm_usr = deletePermi
        .then((myPromisePerm) => {
          if(myPromisePerm.length<1){
            const user_obj = {id : user}
              unlinkUser(user_obj)
          }
      });
      editPermissionsModal.value.show = false
      return snackbar.add({ type: 'success', text: 'Permission deleted success' })
  }catch (e) {
    console.error(e)
  }
}

const availableUsers = computed(() => {
  // users that are not linked
  return users.value.filter((user: any) => {
    return !linkedUsers.value.some((linkedUser: any) => linkedUser.id === user.id)
  })
})

const { handleSubmit, setValues } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  if (props.id) {
    await $api.departments.update(props.id, values)
    snackbar.add({ type: 'success', text: 'Department updated' })
    router.push('/system/departments')
    return
  }

  if (!props.id) {
    await $api.departments.create(values)
    snackbar.add({ type: 'success', text: 'Department created' })
    router.push('/system/departments')
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Please fill all required fields' })
}

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)

const linkUser = async () => {
  if (!form.user) {
    snackbar.add({ type: 'warning', text: 'Please select a user' })
    return
  }
  if (!form.department_type) {
    snackbar.add({ type: 'warning', text: 'Please select a type' })
    return
  }
  if (!form.give_perm) {
    snackbar.add({ type: 'warning', text: 'Please select at least one permisson' })
    return
  }
  const body = {
    user_id: form.user,
    department_type: form.department_type,
    give_perm: form.give_perm,
  }
  const response = await $api.departments.linkUser(props.id!, body)
  // find user by id
  const user = users.value.find((u: any) => u.id === form.user)
  linkedUsers.value.push({ ...user, pivot: { department_type: form.department_type , give_perm: form.give_perm} })
  form.user = null
  form.department_type = null
  form.give_perm = null

  snackbar.add({ type: 'success', text: 'User linked' })
}

const unlinkUser = async (user: any) => {
  const body = {
    user_id: user.id,
  }
  await $api.departments.unlinkUser(props.id!, body)
  // remove user from linkedUsers
  linkedUsers.value = linkedUsers.value.filter((u: any) => u.id !== user.id)
  snackbar.add({ type: 'success', text: 'User unlinked' })
}

onMounted(async () => {
  await getCatalogs()

})

users.value = await $api.users.getAllUsers()
permissions.value = await $api.users.getPermissions()
roles.value = await $api.users.getRoles()
</script>
