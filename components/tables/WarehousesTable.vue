<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
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
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(warehouse, index) in warehouses.data"
              :key="`warehouse-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': warehouse.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="warehouse" @click="viewWarehouse(warehouse)" />
                  <EditButton :item="warehouse" @click="editWarehouse(warehouse)" />
                  <TrashButton :item="warehouse" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ warehouse.name }}</td>
              <td>
                <UserInfoBadge :item="warehouse">
                  {{ formatDateString(warehouse.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="warehouses.current_page"
          :length="warehouses.last_page"
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

const catalogs = ref({
  airlines: [],
})

const warehouses = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  warehouses.value.current_page = page
  await getWarehouses()
}

const onClickFilters = async () => {
  warehouses.value.current_page = 1
  await getWarehouses()
}

const viewWarehouse = (warehouse: any) => {
  router.push(`/configuration/warehouses/view-${warehouse.id}`)
}

const editWarehouse = async (warehouse: any) => {
  router.push(`/configuration/warehouses/edit-${warehouse.id}`)
}

const showConfirmDelete = async (warehouse: any) => {
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
      const response = await $api.warehouses.delete(warehouse.id)
      snackbar.add({ type: 'success', text: 'Warehouse deleted' })
      await getWarehouses()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getWarehouses = async () => {
  try {
    loadingStore.start()
    const response = await $api.warehouses.getWarehouses({
      query: {
        page: warehouses.value.current_page,
        perPage: warehouses.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    warehouses.value = response as any
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
  await getWarehouses()
}

onMounted(async () => {
  await getWarehouses()
})
</script>
