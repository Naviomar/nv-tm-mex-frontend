<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-2">
          <v-text-field v-model="filters.name" density="compact" label="Name" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.shipperConsignee"
            :items="options"
            item-title="name"
            item-value="value"
            density="compact"
            label="Shipper (POL) / Consignee (POD outside Mexico)"
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
              <th class="text-left">Country</th>
              <th class="text-left">Address</th>
              <th class="text-left">Type</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(shipper, index) in shippers.data"
              :key="`shipper-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': shipper.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton
                    :item="shipper"
                    @click="() => $router.push(`/configuration/shippers/view-${shipper.id}`)"
                  />
                  <EditButton
                    :item="shipper"
                    @click="() => $router.push(`/configuration/shippers/edit/${shipper.id}`)"
                  />
                  <TrashButton :item="shipper" @click="showConfirmDelete" />
                </div>
              </td>
              <td class="whitespace-nowrap">{{ shipper.name }}</td>
              <td>{{ shipper.country?.name }}</td>
              <td>{{ shipper.address }}</td>
              <td>
                <div v-if="shipper.is_shipper">
                  <v-chip color="primary" size="small">Shipper</v-chip>
                </div>
                <div v-if="shipper.is_consignee">
                  <v-chip color="secondary" size="small">Consignee</v-chip>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="shipper">
                  {{ formatDateString(shipper.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="shippers.current_page"
          :length="shippers.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref({
  name: '',
  shipperConsignee: null,
})

const options = ref([
  { name: 'Shipper', value: 'shipper' },
  { name: 'Consignee', value: 'consignee' },
  { name: 'All', value: 'all' },
])

const shippers = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page?: number) => {
  if (page) {
    shippers.value.current_page = page
  }
  await getShippers()
}

const onClickFilters = async () => {
  shippers.value.current_page = 1
  await getShippers()
}

const showConfirmDelete = async (shipper: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Ok',
    content: 'Please confirm you want to delete or activate this shipper.',
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
      const response = await $api.shippers.delete(shipper.id)
      snackbar.add({ type: 'success', text: 'Shipper deleted' })
      await getShippers()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getShippers = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.shippers.getShippers({
      query: {
        page: shippers.value.current_page,
        perPage: shippers.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    shippers.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

await getShippers()

const clearFilters = async () => {
  filters.value = {
    name: '',
    shipperConsignee: null,
  }
  await onClickPagination(1)
}
</script>
