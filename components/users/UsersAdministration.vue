<template>
  <div>
    <v-card>
      <v-card-text>
        <div class="flex gap-4 mb-2">
          <v-btn color="primary" size="small" @click="onClickCreateUser">Add user</v-btn>
          <v-btn color="purple" size="small" @click="$router.push('/system/departments')">Departments</v-btn>
        </div>
        <div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <v-text-field
              v-model="filters.search"
              placeholder="Search name or email"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              class="md:col-span-2"
            />
            <v-select
              v-if="roles.length"
              v-model="filters.role_id"
              :items="roles"
              item-title="name"
              item-value="id"
              label="Role"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
            <v-select
              v-if="departments.length"
              v-model="filters.department_id"
              :items="departments"
              item-title="name"
              item-value="id"
              label="Department"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </div>
          <div class="flex items-center justify-between mb-2">
            <v-btn-toggle v-model="filters.active" mandatory density="compact" variant="outlined" color="primary" divided>
              <v-btn value="1">Active</v-btn>
              <v-btn value="0">Inactive</v-btn>
              <v-btn value="all">All</v-btn>
            </v-btn-toggle>
            <span class="text-caption text-medium-emphasis">
              <v-progress-circular v-if="searching" indeterminate size="14" width="2" class="mr-1" />{{ users.total ?? 0 }} user(s)
            </span>
          </div>
          <h1 class="text-xl font-bold">Users</h1>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Actions</th>
                <th class="text-left">Name</th>
                <th class="text-left">Email</th>
                <th class="text-left">Role(s)</th>
                <th class="text-left">Access</th>
                <th class="text-left">Departments</th>
                <th class="text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(user, index) in users.data"
                :key="`user-${index}`"
                :class="{
                  'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                  'bg-red-100! dark:bg-red-900!': user.is_active === 0,
                }"
              >
                <td>
                  <div class="flex items-center gap-2">
                    <ViewButton :item="user" @click="onClickUserView(user)" />

                    <EditButton :item="user" permission="users-edit" @click="editUserClick(user)" />

                    <v-tooltip v-if="hasPermission('users-edit')" text="Permissions">
                      <template v-slot:activator="{ props: tooltipProps }">
                        <v-btn
                          color="deep-purple"
                          size="x-small"
                          variant="elevated"
                          v-bind="tooltipProps"
                          icon="mdi-key-variant"
                          @click="onClickUserPermissions(user)"
                        ></v-btn>
                      </template>
                    </v-tooltip>

                    <v-tooltip v-if="hasPermission('users-manage-notifications')" text="Notifications">
                      <template v-slot:activator="{ props: tooltipProps }">
                        <v-btn
                          color="teal"
                          size="x-small"
                          variant="elevated"
                          v-bind="tooltipProps"
                          icon="mdi-email-multiple-outline"
                          @click="onClickUserNotifications(user)"
                        ></v-btn>
                      </template>
                    </v-tooltip>

                    <v-menu v-if="can({ any: ['users-security-manage', 'users-clone', 'users-remove-notifications'] })">
                      <template v-slot:activator="{ props: menuProps }">
                        <v-btn color="blue-grey" size="x-small" variant="elevated" icon="mdi-shield-account-variant-outline" title="Security, clone, notifications" v-bind="menuProps" />
                      </template>
                      <v-list density="compact">
                        <v-list-item v-if="hasPermission('users-security-manage')" prepend-icon="mdi-shield-lock-outline" title="Access security" @click="openUserDialog('security', user)" />
                        <v-list-item v-if="hasPermission('users-clone')" prepend-icon="mdi-account-multiple-plus-outline" title="Clone to another user" @click="openUserDialog('clone', user)" />
                        <v-list-item v-if="hasPermission('users-remove-notifications')" prepend-icon="mdi-bell-remove-outline" title="Remove from all notifications" @click="openUserDialog('notifications', user)" />
                      </v-list>
                    </v-menu>

                    <Can permission="users-delete">
                      <div v-if="user.is_active === 0">
                        <v-chip color="red" text-color="white" size="small" @click="onClickDeleteUser(user)"
                          ><v-icon>mdi-delete-empty-outline</v-icon>Inactive</v-chip
                        >
                      </div>
                      <div v-if="user.is_active === 1">
                        <v-chip color="green" text-color="white" size="small" @click="onClickDeleteUser(user)">
                          <v-icon>mdi-delete-outline</v-icon>Active</v-chip
                        >
                      </div>
                      <template #denied>
                        <v-chip :color="user.is_active ? 'green' : 'red'" text-color="white" size="small">
                          {{ user.is_active ? 'Active' : 'Inactive' }}
                        </v-chip>
                      </template>
                    </Can>
                  </div>
                </td>
                <td>{{ user.name }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <v-icon class="cursor-pointer" @click="clipboard.copyToClipboard(user.email)">
                      mdi-content-copy
                    </v-icon>
                    {{ user.email }}
                  </div>
                </td>
                <td>
                  <v-chip v-for="(role, index) in user.roles" :key="`role-${index}`" color="primary" size="small">
                    {{ role.name }}
                  </v-chip>
                </td>
                <td>
                  <v-chip
                    v-if="user.is_data_restricted"
                    color="warning"
                    size="small"
                    variant="outlined"
                  >
                    <v-icon start size="x-small">mdi-shield-lock</v-icon>
                    Restricted
                  </v-chip>
                  <v-chip
                    v-else
                    color="success"
                    size="small"
                    variant="outlined"
                  >
                    <v-icon start size="x-small">mdi-shield-check</v-icon>
                    Full
                  </v-chip>
                </td>
                <td>
                  <v-chip
                    v-for="(department, index) in user.departments"
                    :key="`department-${index}`"
                    color="primary"
                    size="small"
                  >
                    {{ department.name }}
                  </v-chip>
                </td>
                <td class="whitespace-nowrap">
                  <UserInfoBadge :item="user">
                    {{ formatDateString(user.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
          <v-pagination
            v-model="users.current_page"
            :length="users.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          ></v-pagination>
          <!-- <pre>{{ pagination }}</pre> -->
          <!-- <pre>{{ usersPaged }}</pre> -->
        </div>
        <v-dialog v-model="showDeleteDialog" max-width="500">
          <v-card>
            <v-card-title>Confirm this action</v-card-title>
            <v-card-text>Do you want to inactive the following user: {{ userToDelete?.name }}? </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="onClickConfirmDeleteUser">Aceptar</v-btn>
              <v-btn color="secondary" @click="showDeleteDialog = false">Cancelar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="permissionsDialog.show" max-width="980" scrollable>
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <div>
                <v-icon color="primary" class="mr-2">mdi-key-variant</v-icon>
                Permissions — {{ permissionsDialog.user?.name || permissionsDialog.user?.email }}
              </div>
              <v-btn icon="mdi-close" size="small" variant="text" @click="permissionsDialog.show = false" />
            </v-card-title>
            <v-card-text style="max-height: 78vh">
              <UserAccessPanel
                v-if="permissionsDialog.show && permissionsDialog.user"
                :user-id="permissionsDialog.user.id"
              />
            </v-card-text>
          </v-card>
        </v-dialog>

        <v-dialog v-model="userDialog.show" max-width="980" scrollable>
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <div>
                <v-icon color="primary" class="mr-2">{{ userDialogMeta[userDialog.kind].icon }}</v-icon>
                {{ userDialogMeta[userDialog.kind].title }} — {{ userDialog.user?.name || userDialog.user?.email }}
              </div>
              <v-btn icon="mdi-close" size="small" variant="text" @click="userDialog.show = false" />
            </v-card-title>
            <v-card-text style="max-height: 78vh">
              <template v-if="userDialog.show && userDialog.user">
                <UserSecurityPanel v-if="userDialog.kind === 'security'" :user-id="userDialog.user.id" />
                <UserCloneWizard v-else-if="userDialog.kind === 'clone'" :source-user-id="userDialog.user.id" @done="getUsers" />
                <UserNotificationsRemoval v-else :user-id="userDialog.user.id" />
              </template>
            </v-card-text>
          </v-card>
        </v-dialog>

        <v-dialog v-model="showNotificationsDialog" max-width="1200" scrollable>
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <div>
                <v-icon color="primary" class="mr-2">mdi-email-multiple-outline</v-icon>
                Notifications — {{ userForNotifications?.name || userForNotifications?.email }}
              </div>
              <v-btn icon="mdi-close" size="small" variant="text" @click="showNotificationsDialog = false" />
            </v-card-title>
            <v-card-text style="max-height: 75vh">
              <UserMailNotificationsPanel v-if="userForNotifications" :user-id="userForNotifications.id" />
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const clipboard = useCopyToClipboard()
const { hasPermission, can } = useCheckUser()

const users = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})
const defaultFilters = () => ({ search: '', role_id: null, department_id: null, active: '1' })
const filters = ref<any>(defaultFilters())
const roles = ref<any[]>([])
const departments = ref<any[]>([])
const showDeleteDialog = ref(false)
const userToDelete = ref<any>(null)
const showNotificationsDialog = ref(false)
const userForNotifications = ref<any>(null)
const permissionsDialog = ref({ show: false, user: null as any })
const userDialog = ref({ show: false, kind: 'security' as 'security' | 'clone' | 'notifications', user: null as any })
const userDialogMeta = {
  security: { title: 'Access security', icon: 'mdi-shield-lock-outline' },
  clone: { title: 'Clone user', icon: 'mdi-account-multiple-plus-outline' },
  notifications: { title: 'Remove from notifications', icon: 'mdi-bell-remove-outline' },
}

function openUserDialog(kind: 'security' | 'clone' | 'notifications', user: any) {
  userDialog.value = { show: true, kind, user }
}
// let usersPaged = ref<any>({})


const onClickUserPermissions = (user: any) => {
  permissionsDialog.value = { show: true, user }
}

const onClickCreateUser = async () => {
  await navigateTo('/system/users/create', { replace: true })
}



const onClickDeleteUser = async (user: any) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const onClickConfirmDeleteUser = async () => {
  showDeleteDialog.value = false
  await $api.users.deleteUser(userToDelete.value.id)
  await getUsers()
}

const onClickPagination = async (page: number) => {
  users.value.current_page = page
  await getUsers()
}

function onClickUserView(user: any) {
  return navigateTo(`/system/users/${user.id}`)
}

function editUserClick(user: any) {
  return navigateTo(`/system/users/edit/${user.id}/`)
}

function onClickUserNotifications(user: any) {
  userForNotifications.value = user
  showNotificationsDialog.value = true
}

// Cada búsqueda cancela la anterior: solo cuenta la última, así una respuesta lenta no pisa a una más nueva.
let controller: AbortController | null = null
const searching = ref(false)

async function getUsers() {
  controller?.abort()
  const current = (controller = new AbortController())
  searching.value = true
  try {
    const response = await $api.users.getUsers({
      signal: current.signal,
      query: {
        page: users.value.current_page,
        limit: 50,
        // Solo los filtros con valor: un null/'' viaja como parámetro vacío.
        ...Object.fromEntries(Object.entries(filters.value).filter(([, v]) => v !== null && v !== '' && v !== undefined)),
      },
    })
    if (controller === current) users.value = response
  } catch (e: any) {
    if (e?.name !== 'AbortError' && e?.cause?.name !== 'AbortError') console.error('error', e)
  } finally {
    if (controller === current) searching.value = false
  }
}

// Búsqueda al escribir (con espera) y al cambiar cualquier filtro; siempre desde la página 1.
const searchNow = () => {
  users.value.current_page = 1
  getUsers()
}
useDebouncedSearch(() => filters.value.search, searchNow)
watch(() => [filters.value.role_id, filters.value.department_id, filters.value.active], searchNow)

onMounted(async () => {
  // Opcionales: si el usuario no puede ver roles o departamentos, ese filtro no aparece.
  const [r, d] = await Promise.allSettled([
    $api.users.getRoles({ onResponseError: () => {} }),
    $api.departments.getAllDepartments({ onResponseError: () => {} }),
  ])
  if (r.status === 'fulfilled') roles.value = Array.isArray(r.value) ? r.value : (r.value as any)?.data ?? []
  if (d.status === 'fulfilled') departments.value = Array.isArray(d.value) ? d.value : (d.value as any)?.data ?? []
})

await getUsers()
</script>
