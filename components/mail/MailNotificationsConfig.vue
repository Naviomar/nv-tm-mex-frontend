<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-2">
          <v-text-field density="compact" label="Name" v-model="filters.name" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Department"
            v-model="filters.departmentId"
            :items="catalogs.departments"
            item-title="name"
            item-value="id"
          />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getMailNotifications"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Departments</th>
              <th class="text-left">Name</th>
              <th class="text-left">Description</th>
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(mailNoty, index) in mailNotys.data"
              :key="`mail-noty-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': mailNoty.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <EditButton :item="mailNoty" @click="editMailNoty(mailNoty)" />
                </div>
              </td>
              <td>
                <div class="flex gap-1">
                  <v-chip
                    v-for="(department, index) in mailNoty.departments"
                    color="amber"
                    size="small"
                    :key="`department-${index}`"
                  >
                    {{ department.name }}
                  </v-chip>
                </div>
              </td>
              <td>{{ mailNoty.short_name }}</td>
              <td class="whitespace-nowrap">{{ mailNoty.description }}</td>
              <td class="whitespace-nowrap">{{ formatDateString(mailNoty.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="mailNotys.current_page"
          :length="mailNotys.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref<any>({
  name: '',
  deparmentId: null,
})

const catalogs = ref<any>({
  departments: [],
})

const mailNotys = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 25,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  mailNotys.value.current_page = page
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
        page: mailNotys.value.current_page,
        perPage: mailNotys.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    mailNotys.value = response as any
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
