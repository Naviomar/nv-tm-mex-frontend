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
        <v-pagination
          v-model="servicesContracts.current_page"
          :length="servicesContracts.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Line</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(serviceContract, index) in servicesContracts.data"
              :key="`serviceContract-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': serviceContract.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="serviceContract" @click="viewServiceContract(serviceContract)" />
                  <EditButton :item="serviceContract" @click="editServiceContract(serviceContract)" />
                  <TrashButton :item="serviceContract" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ serviceContract.name }}</td>
              <td>{{ serviceContract.line?.name }}</td>

              <td>
                <UserInfoBadge :item="serviceContract">
                  {{ formatDateString(serviceContract.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="servicesContracts.current_page"
          :length="servicesContracts.last_page"
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
  deleted_status: null,
})

const servicesContracts = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  servicesContracts.value.current_page = page
  await getServicesContracts()
}

const onClickFilters = async () => {
  servicesContracts.value.current_page = 1
  await getServicesContracts()
}

const viewServiceContract = (serviceContract: any) => {
  router.push(`/configuration/services-contracts/view-${serviceContract.id}`)
}

const editServiceContract = async (serviceContract: any) => {
  router.push(`/configuration/services-contracts/edit-${serviceContract.id}`)
}

const showConfirmDelete = async (serviceContract: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this Service Contract.',
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
      loadingStore.loading = true
      const response = await $api.servicesContracts.delete(serviceContract.id)
      snackbar.add({ type: 'success', text: 'Service Contract deleted' })
      await getServicesContracts()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getServicesContracts = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.servicesContracts.getServicesContacts({
      query: {
        page: servicesContracts.value.current_page,
        perPage: servicesContracts.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    servicesContracts.value = response as any
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
  await getServicesContracts()
}

onMounted(async () => {
  await getServicesContracts()
})
</script>
