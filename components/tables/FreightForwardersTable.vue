<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-3">
        <div class="col-span-1">
          <v-text-field density="compact" label="Name" v-model="filters.name" />
        </div>
        <div class="col-span-1">
          <v-text-field density="compact" label="Zip code" v-model="filters.zip" />
        </div>
        <div class="col-span-1">
          <v-text-field density="compact" label="State" v-model="filters.state" />
        </div>
        <div class="col-span-1">
          <v-text-field density="compact" label="RFC" v-model="filters.rfc" />
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
          <v-btn color="primary" @click="onClickSearch"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-pagination
          v-model="freightForwarders.current_page"
          :length="freightForwarders.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">F.F. group</th>
              <th class="text-left">Name</th>
              <th class="text-left">Address</th>
              <th class="text-left">Zip code</th>
              <th class="text-left">State</th>
              <th class="text-left">Tax number</th>
              <th class="text-left">RFC</th>
              <th class="text-left">Contact name</th>
              <th class="text-left">Contact phone</th>

              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(ff, index) in freightForwarders.data"
              :key="`ff-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': ff.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="ff" @click="viewFf(ff)" />
                  <EditButton :item="ff" @click="showWarningEditAction(ff)" />
                  <TrashButton :item="ff" @click="showConfirmDelete" />
                </div>
              </td>
              <td class="whitespace-nowrap">
                {{ ff.freight_group ? ff.freight_group.name : 'No group' }}
              </td>
              <td class="whitespace-nowrap">{{ ff.name }}</td>

              <td class="">{{ ff.address }}</td>
              <td>{{ ff.zip_code }}</td>
              <td>{{ ff.state }}</td>
              <td>{{ ff.tax_number }}</td>
              <td>{{ ff.tax_number }}</td>
              <td>{{ ff.contact_name }}</td>
              <td>{{ ff.contact_phone }}</td>

              <td class="whitespace-nowrap">
                <UserInfoBadge :item="ff">
                  {{ formatDateString(ff.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="freightForwarders.current_page"
          :length="freightForwarders.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
    <v-dialog v-model="showWarningEdit" max-width="500" persistent>
      <v-card>
        <v-card-title>Warning edit Freight</v-card-title>
        <v-card-text>
          Por favor, tenga en cuenta que al editar el nombre del agente de carga, se espera que esta acción sea
          realizada únicamente para corregir errores tipográficos. El nombre del agente de carga se utiliza en otros
          contextos de referencia
        </v-card-text>
        <v-card-actions>
          <div class="grow"></div>
          <v-btn color="error" @click="closeWarningEdit">Cancel</v-btn>
          <v-btn color="success" @click="acceptMessageWarningEdit">Accept</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '@/utils/data/systemData'
import { useTableFilters } from '~/composables/useTableFilters'

const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()

const loadingStore = useLoadingStore()
const router = useRouter()

// Initial filter values
const initialFilters = {
  name: '',
  zip: '',
  state: '',
  rfc: '',
  deleted_status: '',
}

// Use the table filters composable for URL persistence
const {
  filters,
  currentPage,
  syncToUrl,
  resetFilters: resetFiltersComposable,
  getFilteredUrl,
} = useTableFilters(initialFilters, {
  storageKey: 'freight-forwarders-filters',
})

const freightSelected = ref(null)
const showWarningEdit = ref(false)

const freightForwarders = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

// Expose backUrl for child components
const backUrl = computed(() => getFilteredUrl('/configuration/freight-forwarders'))
provide('catalogBackUrl', backUrl)

const onClickSearch = async () => {
  currentPage.value = 1
  freightForwarders.value.current_page = 1
  await syncToUrl()
  await getFreightForwarders()
}

const onClickFilters = async () => {
  currentPage.value = 1
  freightForwarders.value.current_page = 1
  await syncToUrl()
  await getFreightForwarders()
}

const onClickPagination = async (page: number) => {
  currentPage.value = page
  freightForwarders.value.current_page = page
  await syncToUrl()
  await getFreightForwarders()
}

const viewFf = (ff: any) => {
  snackbar.add({ type: 'info', text: 'View under construction' })
  // router.push(`/configuration/freight-forwarders/view-${ff.id}`)
}

const showWarningEditAction = (ff: any) => {
  showWarningEdit.value = true
  freightSelected.value = ff
}
const closeWarningEdit = () => {
  showWarningEdit.value = false
}

const showConfirmDelete = async (freightf: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this FreightForwarder.',
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
      await $api.freightForwarders.delete(freightf.id)
      snackbar.add({ type: 'success', text: 'Freight forwarder deleted' })
      await getFreightForwarders()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getFreightForwarders = async () => {
  try {
    loadingStore.start()
    const response = await $api.freightForwarders.getFreightForwarders({
      query: {
        page: currentPage.value,
        perPage: freightForwarders.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    freightForwarders.value = response as any
    freightForwarders.value.current_page = currentPage.value
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const clearFilters = async () => {
  await resetFiltersComposable()
  freightForwarders.value.current_page = 1
  await getFreightForwarders()
}

const acceptMessageWarningEdit = () => {
  const freight = freightSelected.value as any
  if (freight) router.push(`/configuration/freight-forwarders/edit-${freight.id}`)
}

onMounted(() => {
  freightForwarders.value.current_page = currentPage.value
  getFreightForwarders()
})
</script>
