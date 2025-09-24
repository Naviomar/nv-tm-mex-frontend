<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field density="compact" label="Name" />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getFreightForwardersGroups"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">F.F. Group</th>
              <th class="text-left">Freight forwarder(s)</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(ffg, index) in freightForwardersGroups.data"
              :key="`ffg-${index}`"
              :class="{
                'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                'bg-red-100! dark:bg-red-900!': ffg.deleted_at,
              }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="ffg" @click="viewFreightForwardersGroups(ffg)" />
                  <EditButton v-if="false" :item="ffg" />
                  <TrashButton :item="ffg" @click="showConfirmDelete(ffg)" />
                </div>
              </td>
              <td>{{ ffg.name }}</td>
              <td>
                <div v-if="!ffg.freights.length">No freight forwarder groups</div>
                <v-chip
                  v-for="(ff, index) in ffg.freights"
                  :key="`ff-${index}`"
                  color="primary"
                  text-color="white"
                  class="mr-2"
                >
                  {{ ff.name }}
                </v-chip>
              </td>
              <td>{{ formatDateString(ffg.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="freightForwardersGroups.current_page"
          :length="freightForwardersGroups.last_page"
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

const freightForwardersGroups = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const viewFreightForwardersGroups = async (freightForwardersGroup: any) => {
  router.push(`/configuration/freight-forwarders/groups/${freightForwardersGroup.id}`)
}

const onClickPagination = async (page: number) => {
  freightForwardersGroups.value.current_page = page
  await getFreightForwardersGroups()
}

const showConfirmDelete = async (freightForwardersGroup: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this Freight Forwarders Group.',
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
      const response = await $api.freightForwardersGroups.delete(freightForwardersGroup.id)
      snackbar.add({ type: 'success', text: 'Freight Forwarders Group deleted' })
      await getFreightForwardersGroups()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getFreightForwardersGroups = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.freightForwardersGroups.getFreightForwardersGroups({
      query: {
        page: freightForwardersGroups.value.current_page,
        perPage: freightForwardersGroups.value.perPage,
         ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    freightForwardersGroups.value = response as any
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

await getFreightForwardersGroups()

const clearFilters = async () => {
  filters.value = {
    name: '',
  }
  await getFreightForwardersGroups()
}
</script>
