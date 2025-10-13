<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-3">
          <v-text-field density="compact" label="Name / Prefix" v-model="filters.name" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
          />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Logo</th>
              <th class="text-left">Name</th>
              <th class="text-left">Prefix</th>
              <th class="text-left">Code</th>
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(airline, index) in airlines.data"
              :key="`airline-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': airline.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="airline" @click="viewAirline(airline)" />
                  <EditButton :item="airline" @click="editAirline(airline)" />
                  <TrashButton :item="airline" @click="showConfirmDelete" />
                </div>
              </td>
              <td>
                <v-img :src="airline.logo_url" height="50" contain class="rounded-lg"></v-img>
              </td>
              <td>{{ airline.name }}</td>
              <td>{{ airline.prefix }}</td>
              <td>{{ airline.code }}</td>
              <td>
                <UserInfoBadge :item="airline">
                  {{ formatDateString(airline.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="airlines.current_page"
          :length="airlines.last_page"
          rounded="circle"
          density="comfortable"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '@/utils/data/systemData'
import UserInfoBadge from '../common/UserInfoBadge.vue'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingStore = useLoadingStore()

const filters = ref({
  name: '',
  deleted_status: '',
})

const airlines = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickFilters = async () => {
  // set current page to 1
  airlines.value.current_page = 1
  await getAirlines()
}

const onClickPagination = async (page: number) => {
  airlines.value.current_page = page
  await getAirlines()
}

const showConfirmDelete = async (airline: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this airline.',
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
      const response = await $api.airlines.delete(airline.id)
      snackbar.add({ type: 'success', text: 'Airline deleted successfully' })
      await getAirlines()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const editAirline = (airline: any) => {
  router.push(`/configuration/airlines/edit-${airline.id}`)
}

const viewAirline = (airline: any) => {
  router.push(`/configuration/airlines/view-${airline.id}`)
}

const getAirlines = async () => {
  try {
    loadingStore.start()
    const response = await $api.airlines.getAirlines({
      query: {
        page: airlines.value.current_page,
        perPage: airlines.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    airlines.value = response as any
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
    deleted_status: '',
  }
  await getAirlines()
}

onMounted(async () => {
  await getAirlines()
})
</script>
