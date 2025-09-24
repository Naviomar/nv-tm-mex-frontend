<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-4 mb-4">
        <div class="col-span-3">
          <v-text-field v-model="filters.name" density="compact" label="Name" hide-details />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.country_id"
            density="compact"
            label="Country"
            :items="countries"
            item-value="id"
            item-title="name"
            hide-details
          />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            hide-details
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
              <th class="text-left">Country</th>
              <th class="text-left">Name</th>
              <th class="text-left">Code</th>
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(airport, index) in airports.data"
              :key="`airport-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': airport.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="airport" @click="viewAirport(airport)" />
                  <EditButton :item="airport" @click="editAirport(airport)" />
                  <TrashButton :item="airport" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ airport.country?.name }}</td>
              <td>{{ airport.name }}</td>
              <td>{{ airport.code }}</td>

              <td>
                <UserInfoBadge :item="airport">
                  {{ formatDateString(airport.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="airports.current_page"
          :length="airports.last_page"
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
const router = useRouter()
const loadingStore = useLoadingStore()

const filters = ref({
  name: '',
  country_id: null,
  deleted_status: null,
})

const airports = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const countries = ref<any>([])

const onClickFilters = async () => {
  // set current page to 1
  airports.value.current_page = 1
  await getAirports()
}

const onClickPagination = async (page: number) => {
  airports.value.current_page = page
  await getAirports()
}

const editAirport = (airport: any) => {
  router.push(`/configuration/airports/edit-${airport.id}`)
}

const viewAirport = (airport: any) => {
  router.push(`/configuration/airports/view-${airport.id}`)
}

const showConfirmDelete = async (airport: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this airport.',
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
      const response = await $api.airports.delete(airport.id)
      snackbar.add({ type: 'success', text: 'Airport deleted' })
      await getAirports()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getAirports = async () => {
  try {
    loadingStore.start()
    const response = await $api.airports.getAirports({
      query: {
        page: airports.value.current_page,
        perPage: airports.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    airports.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCountries = async () => {
  const response = (await $api.countries.getAll()) as any
  countries.value = response as any
}

const clearFilters = async () => {
  filters.value = {
    name: '',
    country_id: null,
    deleted_status: null,
  }
  await getAirports()
}

onMounted(async () => {
  await getCountries()
  await getAirports()
})
</script>
