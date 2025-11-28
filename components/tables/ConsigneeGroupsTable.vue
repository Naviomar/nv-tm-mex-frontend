<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field density="compact" label="Name"></v-text-field>
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getConsigneeGroups"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name Group</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cg, index) in consigneeGroups.data" :key="`cg-${index}`">
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="cg" @click="viewFreightForwardersGroups" />
                  <TrashButton :item="cg" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ cg.name }}</td>
              <td>
                <UserInfoBadge :item="cg">
                  {{ formatDateString(cg.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="consigneeGroups.current_page"
          :length="consigneeGroups.last_page"
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
const router = useRouter()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref({
  name: '',
})

const consigneeGroups = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const viewFreightForwardersGroups = async (consigneeGroup: any) => {
  router.push(`/configuration/customers/groups/${consigneeGroup.id}`)
}

const onClickPagination = async (page: number) => {
  consigneeGroups.value.current_page = page
  await getConsigneeGroups()
}

const showConfirmDelete = async (consigneeGroup: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this Consignee Group.',
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
      const response = await $api.consigneeGroups.delete(consigneeGroup.id)
      snackbar.add({ type: 'success', text: 'Consignee Group deleted' })
      await getConsigneeGroups()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getConsigneeGroups = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.consigneeGroups.getConsigneesGroups({
      query: {
        page: consigneeGroups.value.current_page,
        perPage: consigneeGroups.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    consigneeGroups.value = response as any
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

await getConsigneeGroups()

const clearFilters = async () => {
  filters.value = {
    name: '',
  }
  await getConsigneeGroups()
}
</script>
