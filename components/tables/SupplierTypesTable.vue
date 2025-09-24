<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6 gap-2">
        <div class="col-span-2">
          <v-text-field v-model="filters.name" density="compact" label="Name" @keyup.enter="onClickSearch" />
        </div>
        <div class="col-span-1">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            @keyup.enter="onClickSearch"
            hide-details
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
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Has cap Limit</th>
              <th class="text-left">Cap Limit</th>
              <th class="text-left">Count</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(supplier, index) in supplierTypes.data"
              :key="`supplier-type-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': supplier.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="supplier" @click="view(supplier)" />
                  <EditButton :item="supplier" @click="edit(supplier)" />
                  <TrashButton :item="supplier" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ supplier.name }}</td>
              <td>{{ supplier.has_cap_limit ? 'Yes' : 'No' }}</td>
              <td>{{ supplier.has_cap_limit === 0 ? formatToCurrency(supplier.cap_limit) : '-' }}</td>
              <td>{{ supplier.suppliers_count }}</td>
              <td>{{ formatDateString(supplier.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="supplierTypes.current_page"
          :length="supplierTypes.last_page"
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

const filters = ref<any>({
  name: '',
  deleted_status: null,
})

const supplierTypes = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickSearch = async () => {
  supplierTypes.value.current_page = 1
  await getSupplierTypes()
}

const onClickPagination = async (page: number) => {
  supplierTypes.value.current_page = page
  await getSupplierTypes()
}

const view = (supplierType: any) => {
  router.push(`/configuration/suppliers/types/view-${supplierType.id}`)
}

const edit = async (supplierType: any) => {
  router.push(`/configuration/suppliers/types/edit-${supplierType.id}`)
}

const showConfirmDelete = async (supplierType: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Ok',
    content: 'Please confirm you want to delete or activate this supplier type.',
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
      const response = await $api.supplierTypes.delete(supplierType.id)
      snackbar.add({ type: 'success', text: 'Supplier deleted' })
      await getSupplierTypes()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getSupplierTypes = async () => {
  try {
    loadingStore.start()
    const response = await $api.supplierTypes.getPaged({
      query: {
        page: supplierTypes.value.current_page,
        perPage: supplierTypes.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    supplierTypes.value = response as any
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
  await getSupplierTypes()
}

onMounted(async () => {
  await getSupplierTypes()
})
</script>
