<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-2">
          <v-text-field v-model="filters.name" density="compact" label="Name" />
        </div>
        <div>
          <v-autocomplete
            v-model="filters.country"
            label="Countries"
            :items="countries.data"
            density="compact"
            item-title="name"
            item-value="id"
            hide-details
          />
        </div>
        <div class="col-span-1">
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
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(destination, index) in destinations.data"
              :key="`destination-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': destination.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="destination" @click="viewDestination(destination)" />
                  <EditButton :item="destination" @click="editDestination(destination)" />
                  <TrashButton :item="destination" @click="showConfirmDelete" />
                </div>
              </td>
              <td>
                <div v-if="destination.is_foreign === 1">Outside Mexico</div>
                <div v-if="destination.is_foreign === 0">
                  {{ destination.country?.name }}
                </div>
              </td>
              <td>{{ destination.name }}</td>

              <td>
                <UserInfoBadge :item="destination">
                  {{ formatDateString(destination.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="destinations.current_page"
          :length="destinations.last_page"
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
const confirm = $notifications.useConfirm()
const router = useRouter()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const filters = ref<any>({
  name: '',
  country: '',
  deleted_status: null,
})

const destinations = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const countries = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  destinations.value.current_page = page
  await getDestinations()
}

const onClickFilters = async () => {
  // set current page to 1
  destinations.value.current_page = 1
  await getDestinations()
}

const getCountries = async () => {
  try {
    loadingStore.start()
    const response = await $api.countries.getAll({
      query: {
        page: countries.value.current_page,
        perPage: countries.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    countries.value.data = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const showConfirmDelete = async (destination: any) => {
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
      const response = await $api.destinations.delete(destination.id)

      if (response) {
        snackbar.add({
          type: 'success',
          text: `${destination.name} ${destination.deleted_at == null ? 'deleted' : 'restored'}`,
        })
        await getDestinations()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const editDestination = (destination: any) => {
  router.push(`/configuration/destinations/edit-${destination.id}`)
}

const viewDestination = (destination: any) => {
  router.push(`/configuration/destinations/view-${destination.id}`)
}

const getDestinations = async () => {
  try {
    loadingStore.start()
    const response = await $api.destinations.getDestinations({
      query: {
        page: destinations.value.current_page,
        perPage: destinations.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    destinations.value = response as any
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
    country: '',
  }
  await getDestinations()
}

onMounted(async () => {
  getCountries()
  await getDestinations()
})
</script>
