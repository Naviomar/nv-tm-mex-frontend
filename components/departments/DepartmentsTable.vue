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
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            @keyup.enter="getDepartments"
            hide-details
          />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getDepartments"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left"># Users</th>
              <th class="text-left">Name</th>
              <th class="text-left">Description</th>
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(department, index) in departments.data"
              :key="`department-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': department.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <EditButton :item="department" @click="editDepartments(department)" />
                  <TrashButton :item="department" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ department.users_count }}</td>
              <td>{{ department.name }}</td>
              <td>{{ department.description }}</td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="department">
                  {{ formatDateString(department.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="departments.current_page"
          :length="departments.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '@/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref<any>({
  name: '',
  airlineId: null,
  deleted_status: null,
})

const departments = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 25,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  departments.value.current_page = page
  await getDepartments()
}

const viewDepartments = (department: any) => {
  router.push(`/system/departments/view-${department.id}`)
}

const editDepartments = async (department: any) => {
  router.push(`/system/departments/edit-${department.id}`)
}

const showConfirmDelete = async (department: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or restore it.',
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
      await $api.departments.delete(department.id)
      snackbar.add({ type: 'success', text: 'Department deleted' })
      await getDepartments()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getDepartments = async () => {
  try {
    loadingStore.start()
    const response = await $api.departments.getDepartments({
      query: {
        page: departments.value.current_page,
        perPage: departments.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    departments.value = response as any
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
    airlineId: null,
    deleted_status: null,
  }
  await getDepartments()
}

onMounted(async () => {
  await getDepartments()
})
</script>
