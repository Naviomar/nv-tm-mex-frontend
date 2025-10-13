<template>
  <div>
    <v-card>
      <v-card-text>
        <div class="flex gap-4 mb-2">
          <v-btn color="primary" size="small" @click="onClickCreateUser">Add user</v-btn>
          <v-btn color="purple" size="small" @click="$router.push('/system/departments')">Departments</v-btn>
        </div>
        <div>
          <div @keyup.enter="onClickFilters">
            <h1 class="text-xl font-bold">Filters</h1>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <v-text-field label="Name" density="compact" v-model="filters.name" />
              </div>
              <div>
                <v-text-field label="Email address" density="compact" v-model="filters.email" />
              </div>
              <div>
                <v-autocomplete
                  v-model="filters.active"
                  label="Active / Inactive"
                  density="compact"
                  :items="[
                    { name: 'Active', value: 1 },
                    { name: 'Inactive', value: 0 },
                  ]"
                  item-title="name"
                  item-value="value"
                />
              </div>
            </div>
            <div class="flex justify-end gap-4">
              <v-btn color="secondary" @click="onClickResetFilters">Reset</v-btn>
              <v-btn color="primary" @click="onClickSearch">Search</v-btn>
            </div>
          </div>
          <h1 class="text-xl font-bold">Users</h1>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Actions</th>
                <th class="text-left">Name</th>
                <th class="text-left">Email</th>
                <th class="text-left">Role(s)</th>
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

                    <EditButton :item="user" @click="editUserClick(user)" />

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
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadintStore = useLoadingStore()
const clipboard = useCopyToClipboard()

const users = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})
const filters = ref<any>({ name: '', email: '', active: null })
const showDeleteDialog = ref(false)
const userToDelete = ref<any>(null)
// let usersPaged = ref<any>({})

const onClickResetFilters = async () => {
  filters.value = { name: '', email: '', active: null }
  if (users.value != null) {
    users.value.current_page = 1
  }

  await getUsers()
}

const onClickCreateUser = async () => {
  await navigateTo('/system/users/create', { replace: true })
}

const onClickFilters = async () => {
  // set current page to 1
  users.value.current_page = 1
  await getUsers()
}

const onClickSearch = async () => {
  users.value.current_page = 1
  await getUsers()
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

async function getUsers() {
  try {
    loadintStore.start()
    const response = await $api.users.getUsers({
      query: { page: users.value.current_page.toString(), limit: '50', ...filters.value },
    })

    users.value = response
  } catch (e: any) {
    console.error('error', e)
  } finally {
    setTimeout(() => {
      loadintStore.stop()
    }, 250)
  }
}

await getUsers()
</script>
