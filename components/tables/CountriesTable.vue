<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-3">
          <v-text-field v-model="filters.name" density="compact" label="Name" />
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
              <th class="text-left">Name</th>
              <th class="text-left">ISO Code 2</th>
              <th class="text-left">ISO Code 3</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(country, index) in countries.data"
              :key="`country-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': country.deleted_at }"
            >
              <td>
                <div class="flex items-center gap-2">
                  <ViewButton :item="country" @click="viewCountry(country)" />
                  <EditButton :item="country" @click="editCountry(country)" />
                  <div v-if="importantCountries.includes(country.id)">
                    <v-icon color="amber">mdi-star</v-icon>
                  </div>
                  <div v-if="!importantCountries.includes(country.id)">
                    <TrashButton :item="country" @click="showConfirmDelete" />
                  </div>
                </div>
              </td>
              <td>{{ country.name }}</td>
              <td>{{ country.code }}</td>
              <td>{{ country.code2 }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="countries.current_page"
          :length="countries.last_page"
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
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref({
  name: '',
  deleted_status: null,
})

const countries = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const importantCountries = [140, 44, 1, 90, 96, 65]

const onClickFilters = async () => {
  // set current page to 1
  countries.value.current_page = 1
  await getCountries()
}

const onClickPagination = async (page: number) => {
  countries.value.current_page = page
  await getCountries()
}

const editCountry = (country: any) => {
  router.push(`/configuration/countries/edit-${country.id}`)
}

const viewCountry = (country: any) => {
  router.push(`/configuration/countries/view-${country.id}`)
}

const showConfirmDelete = async (country: any) => {
  if (importantCountries.includes(country.id)) {
    snackbar.add({ type: 'error', text: 'You cannot delete this country' })
    return
  }
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate it.',
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
      await $api.countries.delete(country.id)
      snackbar.add({ type: 'success', text: 'Country deleted' })
      await getCountries()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getCountries = async () => {
  try {
    loadingStore.start()
    const response = await $api.countries.getCountries({
      query: {
        page: countries.value.current_page,
        perPage: countries.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    countries.value = response as any
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
    deleted_status: null,
  }
  await getCountries()
}

onMounted(async () => {
  await getCountries()
})
</script>
