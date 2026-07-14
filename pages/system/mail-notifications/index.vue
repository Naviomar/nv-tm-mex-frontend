<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div class="d-flex align-center gap-3">
        <v-btn color="slate" size="small" variant="outlined" icon="mdi-arrow-left" @click="$router.back()" />
        <v-icon size="28" color="primary">mdi-email-multiple-outline</v-icon>
        <div>
          <h3 class="text-h6 font-weight-bold" style="line-height: 1.2">Mail notifications</h3>
          <div class="text-caption text-medium-emphasis">
            Manage who receives each system notification, by department, user and port.
          </div>
        </div>
      </div>
      <v-btn color="primary" to="/system/mail-notifications/add">
        <v-icon size="18" class="mr-1">mdi-plus</v-icon>
        New notification
      </v-btn>
    </div>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="filters.name"
              label="Name"
              placeholder="Filter by name"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="filters.departmentId"
              :items="catalogs.departments"
              item-title="name"
              item-value="id"
              label="Department"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
        </v-row>
        <div class="d-flex justify-end gap-2 mt-4">
          <v-btn variant="outlined" color="slate" @click="clearFilters">
            <v-icon size="16" class="mr-1">mdi-filter-remove-outline</v-icon>
            Clear
          </v-btn>
          <v-btn color="primary" @click="getMailNotifications">
            <v-icon size="16" class="mr-1">mdi-magnify</v-icon>
            Search
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <p class="text-caption text-medium-emphasis mb-2 px-1">
      {{ mailNotys?.total ?? 0 }} notification{{ (mailNotys?.total ?? 0) === 1 ? '' : 's' }} found
    </p>

    <v-card>
      <v-table density="comfortable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Departments</th>
            <th>Description</th>
            <th>Recipients</th>
            <th>Status</th>
            <th>Created</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(mailNoty, index) in mailNotys?.data ?? []"
            :key="`mail-noty-${index}`"
            :class="{ 'deleted-row': mailNoty.deleted_at }"
          >
            <td>
              <div class="d-flex align-center gap-2 font-weight-medium">
                <v-icon size="16" color="medium-emphasis">mdi-email-outline</v-icon>
                {{ mailNoty.short_name }}
              </div>
            </td>
            <td>
              <template v-if="mailNoty.departments?.length">
                <v-chip
                  v-for="(department, dIndex) in mailNoty.departments"
                  :key="`department-${dIndex}`"
                  size="x-small"
                  variant="tonal"
                  class="mr-1"
                >
                  {{ department.name }}
                </v-chip>
              </template>
              <span v-else class="text-medium-emphasis">—</span>
            </td>
            <td class="text-truncate" style="max-width: 240px" :title="mailNoty.description">
              {{ mailNoty.description || '—' }}
            </td>
            <td>
              <v-chip size="small" color="primary" variant="tonal">
                <v-icon size="13" class="mr-1">mdi-account-multiple-outline</v-icon>
                {{ mailNoty.users_count }}
              </v-chip>
            </td>
            <td>
              <v-chip size="small" :color="mailNoty.deleted_at ? 'error' : 'success'" variant="tonal">
                {{ mailNoty.deleted_at ? 'Inactive' : 'Active' }}
              </v-chip>
            </td>
            <td class="text-medium-emphasis">{{ formatDateString(mailNoty.created_at) }}</td>
            <td class="text-right">
              <EditButton :item="mailNoty" permission="mail-notifications-edit" @click="editMailNoty(mailNoty)" />
            </td>
          </tr>
          <tr v-if="!mailNotys?.data?.length">
            <td colspan="7" class="text-center text-medium-emphasis pa-8">
              <v-icon size="28" class="d-block mx-auto mb-2">mdi-email-off-outline</v-icon>
              No mail notifications found
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <div v-if="mailNotys && mailNotys.last_page > 1" class="d-flex justify-center mt-6">
      <v-pagination
        :model-value="mailNotys.current_page"
        :length="mailNotys.last_page"
        :total-visible="7"
        density="compact"
        @update:model-value="onClickPagination"
      />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: `Mail notifications Administration`,
  layout: 'default',
})

interface ApiResponse {
  current_page: number
  data: MailNotification[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Link[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

interface MailNotification {
  id: number
  name: string
  description: string
  created_by: number
  updated_by: number | null
  deleted_by: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  short_name: string
  departments: any[]
  creator: User
  deletor: User | null
  users_count: number;
}

interface User {
  id: number
  name: string
  email: string
  email_verified_at: string
  two_factor_secret: string | null
  two_factor_recovery_codes: string | null
  two_factor_confirmed_at: string | null
  is_active: number
  avatar: string | null
  avatar_config: AvatarConfig
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: number | null
  updated_by: number | null
  avatar_url: string | null
}

interface AvatarConfig {
  eyes: number
  hair: number
  faceHair: number
  bodyColor: number
  backgroundColor: number
}

interface Link {
  url: string | null
  label: string
  active: boolean
}

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref<any>({
  name: '',
  departmentId: null,
})

const catalogs = ref<any>({
  departments: [],
})

const mailNotys = ref<ApiResponse | null>(null)

const onClickPagination = async (page: number) => {
  if (mailNotys.value) {
    mailNotys.value.current_page = page
  }

  await getMailNotifications()
}

const editMailNoty = async (department: any) => {
  router.push(`/system/mail-notifications/edit-${department.id}`)
}

const getMailNotifications = async () => {
  try {
    loadingStore.start()
    const response = await $api.mailNotifications.getMailNotifications({
      query: {
        page: mailNotys.value?.current_page,
        perPage: mailNotys.value?.per_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    mailNotys.value = response as ApiResponse
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const clearFilters = async () => {
  filters.value = {
    name: '',
    departmentId: null,
  }
  await getMailNotifications()
}

const getCatalogs = async () => {
  try {
    const response = await $api.mailNotifications.getCatalogs()
    catalogs.value = response
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  await getCatalogs()
  await getMailNotifications()
})
</script>
