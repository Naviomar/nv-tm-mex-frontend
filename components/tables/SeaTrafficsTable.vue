<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref({
  name: '',
})

const seaTraffics = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  
  seaTraffics.value.current_page = page
  await getSeaTraffics()
}

const showConfirmDelete = async (seaTraffic: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this seaTraffic.',
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
      const response = await $api.seaTraffics.delete(seaTraffic.id)
      snackbar.add({ type: 'success', text: 'Sea traffic deleted' })
      await getSeaTraffics()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getSeaTraffics = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.seaTraffics.getSeaTraffics({
      query: {
        page: seaTraffics.value.current_page,
        perPage: seaTraffics.value.perPage,
         ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })


    seaTraffics.value = response as any
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

await getSeaTraffics()

const clearFilters = async () => {
  filters.value = {
    name: '',
  }
  await getSeaTraffics()
}
</script>
<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field variant="outlined" density="compact" label="Name"></v-text-field>
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getSeaTraffics"> Search </v-btn>
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
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(seaTraffic, index) in seaTraffics.data" :key="`seaTraffic-${index}`">
              <td>
                <div v-if="seaTraffic.deleted_at">
                  <v-chip color="red" text-color="white" small @click="showConfirmDelete(seaTraffic)"
                    ><v-icon>mdi-delete-empty-outline</v-icon>Deleted</v-chip
                  >
                </div>
                <div v-if="!seaTraffic.deleted_at">
                  <v-chip color="green" text-color="white" small @click="showConfirmDelete(seaTraffic)">
                    <v-icon>mdi-delete-outline</v-icon>Active</v-chip
                  >
                </div>
              </td>
              <td>{{ seaTraffic.name }}</td>
              <td>{{ seaTraffic.created_at }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="seaTraffics.current_page"
          :length="seaTraffics.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
