<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-2">
        <div class="col-span-2">
          <v-text-field v-model="filters.name" density="compact" label="Name" />
        </div>
        <div class="col-span-1">
          <v-text-field v-model="filters.taxNumber" density="compact" label="RFC" />
        </div>
        <div class="col-span-1">
          <v-autocomplete
            density="compact"
            label="Supplier Type"
            v-model="filters.supplier_type_id"
            :items="catalogs.supplierTypes"
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
              <th class="text-left w-20">Type</th>
              <th class="text-left w-40">RFC</th>
              <th class="text-left">Name</th>
              <th class="text-left">Credit days</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(supplier, index) in suppliers.data"
              :key="`supplier-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': supplier.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="supplier" @click="viewSupplier(supplier)" />
                  <EditButton :item="supplier" @click="editSupplier(supplier)" />
                  <TrashButton :item="supplier" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ supplier.supplier_type?.name }}</td>
              <td>{{ supplier.tax_number ?? '-' }}</td>
              <td>{{ supplier.name }}</td>
              <td>{{ supplier.credit_days }}</td>
              <td>
                <UserInfoBadge :item="supplier">
                  {{ formatDateString(supplier.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="suppliers.current_page"
          :length="suppliers.last_page"
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
  taxNumber: '',
  deleted_status: null,
})

const catalogs = ref<any>({
  supplierTypes: [],
})

const suppliers = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickFilters = async () => {
  suppliers.value.current_page = 1
  await getSuppliers()
}

const onClickPagination = async (page: number) => {
  suppliers.value.current_page = page
  await getSuppliers()
}

const viewSupplier = (supplier: any) => {
  router.push(`/configuration/suppliers/view-${supplier.id}`)
}

const editSupplier = async (supplier: any) => {
  router.push(`/configuration/suppliers/edit-${supplier.id}`)
}

const showConfirmDelete = async (supplier: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Ok',
    content: 'Please confirm you want to delete or activate this supplier.',
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
      const response = await $api.suppliers.delete(supplier.id)
      snackbar.add({ type: 'success', text: 'Supplier status updated' })
      await getSuppliers()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getSuppliers = async () => {
  try {
    loadingStore.start()
    const response = await $api.suppliers.getSuppliers({
      query: {
        page: suppliers.value.current_page,
        perPage: suppliers.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    suppliers.value = response as any
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
    taxNumber: '',
    deleted_status: null,
  }
  await getSuppliers()
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.suppliers.filterCatalogs()
    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getCatalogs()
  await getSuppliers()
})
</script>
