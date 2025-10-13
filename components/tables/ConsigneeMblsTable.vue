<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field v-model="filters.name" density="compact" label="Name" />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getConsigneeMbls"> Search </v-btn>
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
              <th class="text-left">Init demurrages?</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(consigneeMbl, index) in consigneeMbls.data"
              :key="`port-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': consigneeMbl.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <EditButton :item="consigneeMbl" @click="editItem(consigneeMbl)" />
                  <TrashButton :item="consigneeMbl" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ consigneeMbl.name }}</td>
              <td>{{ consigneeMbl.has_demurrages === 1 ? 'Yes' : 'No' }}</td>
              <td>
                <UserInfoBadge :item="consigneeMbl">
                  {{ formatDateString(consigneeMbl.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="consigneeMbls.current_page"
          :length="consigneeMbls.last_page"
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
})

const consigneeMbls = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickFilters = async () => {
  // set current page to 1
  consigneeMbls.value.current_page = 1
  await getConsigneeMbls()
}

const onClickPagination = async (page: number) => {
  consigneeMbls.value.current_page = page
  await getConsigneeMbls()
}

const editItem = async (consigneeMbl: any) => {
  await navigateTo(`/configuration/consignees-mbl/edit-${consigneeMbl.id}`)
}

const showConfirmDelete = async (consigneeMbl: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this consigneeMbl.',
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
      const response = await $api.consigneeMbls.delete(consigneeMbl.id)
      snackbar.add({ type: 'success', text: 'Consignee MBL updated' })
      await getConsigneeMbls()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getConsigneeMbls = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.consigneeMbls.getConsigneeMbls({
      query: {
        page: consigneeMbls.value.current_page,
        perPage: consigneeMbls.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    consigneeMbls.value = response as any
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

await getConsigneeMbls()

const clearFilters = async () => {
  filters.value = {
    name: '',
  }
  await getConsigneeMbls()
}
</script>
