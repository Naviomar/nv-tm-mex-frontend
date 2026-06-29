<template>
  <div>
    <!-- Basic info form -->
    <v-card variant="outlined" class="mb-4">
      <v-card-text>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <InputText density="compact" name="name" label="Name *" />
          <InputText density="compact" name="description" label="Description" />
        </div>
        <div class="flex gap-3">
          <v-btn color="secondary" variant="outlined" to="/system/departments">Cancel</v-btn>
          <v-btn color="primary" @click="saveCharge">Save</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs: only shown when editing an existing department -->
    <template v-if="props.id">
      <v-tabs v-model="activeTab" color="primary" class="mb-4">
        <v-tab value="members">
          <v-icon start>mdi-account-group</v-icon>
          Members
        </v-tab>
        <v-tab value="roles">
          <v-icon start>mdi-shield-account</v-icon>
          Roles
          <v-chip size="x-small" class="ml-2">{{ linkedRoles.length }}</v-chip>
        </v-tab>
        <v-tab value="permissions">
          <v-icon start>mdi-key</v-icon>
          Permissions
          <v-chip size="x-small" class="ml-2">{{ linkedPermissions.length }}</v-chip>
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- ====== MEMBERS TAB ====== -->
        <v-window-item value="members">
          <DepartmentAdminForm :id="props.id" />
        </v-window-item>

        <!-- ====== ROLES TAB ====== -->
        <v-window-item value="roles">
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1 font-weight-bold">
              <v-icon class="mr-2" color="primary">mdi-link-variant</v-icon>
              Link Existing Role to Department
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" md="5">
                  <v-autocomplete
                    v-model="roleForm.role_id"
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
                    v-model="roleForm.role_type"
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
                  <v-btn color="primary" :disabled="!roleForm.role_id || !roleForm.role_type" @click="linkRole">
                    <v-icon start>mdi-link</v-icon>
                    Link Role
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1 font-weight-bold">Linked Roles</v-card-title>
            <v-card-text class="pa-0">
              <v-table density="comfortable" hover>
                <thead>
                  <tr class="bg-grey-lighten-4">
                    <th style="width: 60px">Actions</th>
                    <th>Role Name</th>
                    <th>Type</th>
                    <th>Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="role in linkedRoles" :key="role.id">
                    <td>
                      <v-btn size="x-small" variant="tonal" color="error" icon="mdi-link-off" @click="unlinkRole(role)" />
                    </td>
                    <td class="font-weight-medium">{{ role.name }}</td>
                    <td>
                      <v-chip size="x-small" :color="role.pivot?.role_type === 'admin' ? 'amber-darken-2' : 'primary'" variant="tonal">
                        {{ role.pivot?.role_type === 'admin' ? 'Admin' : 'Member' }}
                      </v-chip>
                    </td>
                    <td>
                      <v-chip size="x-small" :color="(role.permissions?.length ?? 0) > 0 ? 'success' : 'grey'">
                        {{ role.permissions?.length ?? 0 }}
                      </v-chip>
                    </td>
                  </tr>
                  <tr v-if="linkedRoles.length === 0">
                    <td colspan="4" class="text-center py-6 text-grey text-caption">No roles linked yet</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- ====== PERMISSIONS TAB ====== -->
        <v-window-item value="permissions">
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1 font-weight-bold">
              <v-icon class="mr-2" color="primary">mdi-key-plus</v-icon>
              Add Permission to Department
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="form.permission"
                    density="compact"
                    :items="availablePermissions"
                    item-title="name"
                    item-value="id"
                    label="Select permission"
                    variant="outlined"
                    hide-details
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-btn color="primary" :disabled="!form.permission" @click="linkPermission">
                    <v-icon start>mdi-plus</v-icon>
                    Add
                  </v-btn>
                </v-col>
                <v-col cols="12" md="4">
                  <v-btn size="small" color="brown" variant="outlined" @click="showImportRoles = !showImportRoles">
                    <v-icon start>mdi-import</v-icon>
                    Import from Role
                  </v-btn>
                </v-col>
              </v-row>

              <div v-if="showImportRoles" class="mt-4 pa-3 border rounded">
                <v-row dense>
                  <v-col cols="12" md="8">
                    <v-autocomplete
                      v-model="selectedImportRole"
                      :items="allRoles"
                      item-title="name"
                      item-value="id"
                      label="Select role to import from"
                      density="compact"
                      variant="outlined"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-btn color="brown" :disabled="!selectedImportRole" @click="importRolePermissions">
                      <v-icon start>mdi-import</v-icon>
                      Import all
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>

          <PermissionsGrid
            v-if="linkedPermissions.length > 0"
            :permissions="linkedPermissions"
            :model-value="linkedPermissions.map((p: any) => p.id)"
            :readonly="true"
          />
          <v-alert v-else type="info" variant="tonal" density="compact">
            No permissions linked to this department yet.
          </v-alert>
        </v-window-item>
      </v-window>
    </template>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/departmentForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})

const activeTab = ref('members')
const linkedRoles = ref<any[]>([])
const linkedPermissions = ref<any[]>([])
const allRoles = ref<any[]>([])
const allPermissions = ref<any[]>([])
const showImportRoles = ref(false)
const selectedImportRole = ref<number | null>(null)

const roleForm = reactive({
  role_id: null as number | null,
  role_type: 'admin' as string,
})

const form = reactive({
  permission: null as number | null,
})

const roleTypes = [
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
]

const availablePermissions = computed(() =>
  allPermissions.value.filter((p: any) => !linkedPermissions.value.some((l: any) => l.id === p.id))
)

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
  await $api.departments.create(values)
  snackbar.add({ type: 'success', text: 'Department created' })
  router.push('/system/departments')
}

const saveCharge = handleSubmit(
  onSuccess,
  () => snackbar.add({ type: 'error', text: 'Please fill all required fields' })
)

async function loadDepartment(id: string) {
  try {
    loadingStore.start()
    const response = (await $api.departments.getById(id)) as any
    setValues(response)
    linkedPermissions.value = response.permissions ?? []
    linkedRoles.value = response.roles ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loadingStore.stop()
  }
}

watch(
  () => props.id,
  async (id) => { if (id) await loadDepartment(id) },
  { immediate: true }
)

async function linkRole() {
  if (!roleForm.role_id) return
  try {
    await $api.departments.linkRole(props.id!, { role_id: roleForm.role_id, role_type: roleForm.role_type })
    const role = allRoles.value.find((r: any) => r.id === roleForm.role_id)
    linkedRoles.value.push({ ...role, pivot: { role_type: roleForm.role_type } })
    roleForm.role_id = null
    snackbar.add({ type: 'success', text: 'Role linked' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error linking role' })
  }
}

async function unlinkRole(role: any) {
  try {
    await $api.departments.unlinkRole(props.id!, { role_id: role.id })
    linkedRoles.value = linkedRoles.value.filter((r: any) => r.id !== role.id)
    snackbar.add({ type: 'success', text: 'Role unlinked' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error unlinking role' })
  }
}

async function linkPermission() {
  if (!form.permission) return
  try {
    await $api.departments.linkPermission(props.id!, { permission_id: form.permission })
    const perm = allPermissions.value.find((p: any) => p.id === form.permission)
    linkedPermissions.value.push(perm)
    form.permission = null
    snackbar.add({ type: 'success', text: 'Permission linked' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error linking permission' })
  }
}

async function importRolePermissions() {
  if (!selectedImportRole.value) return
  try {
    await $api.departments.importRolePermissions(props.id!, { role_id: selectedImportRole.value })
    const role = allRoles.value.find((r: any) => r.id === selectedImportRole.value)
    if (role?.permissions) {
      role.permissions.forEach((p: any) => {
        if (!linkedPermissions.value.some((l: any) => l.id === p.id)) {
          linkedPermissions.value.push(p)
        }
      })
    }
    showImportRoles.value = false
    selectedImportRole.value = null
    snackbar.add({ type: 'success', text: 'Permissions imported' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error importing permissions' })
  }
}

onMounted(async () => {
  const [roles, perms] = await Promise.all([$api.users.getRoles(), $api.users.getPermissions()]) as any[]
  allRoles.value = roles ?? []
  allPermissions.value = perms ?? []
})
</script>
