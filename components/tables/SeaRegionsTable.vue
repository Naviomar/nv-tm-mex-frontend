<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-2">
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
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Code</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(seaRegion, index) in seaRegions.data"
              :key="`seaRegion-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': seaRegion.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="seaRegion" @click="viewSeaRegion(seaRegion)" />
                  <EditButton :item="seaRegion" @click="editSeaRegion(seaRegion)" />
                  <TrashButton :item="seaRegion" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ seaRegion.name }}</td>
              <td>{{ seaRegion.code }}</td>
              <td>
                <UserInfoBadge :item="seaRegion">
                  {{ formatDateString(seaRegion.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="seaRegions.current_page"
          :length="seaRegions.last_page"
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
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const router = useRouter()

const filters = ref<any>({
  name: '',
  deleted_status: null,
})

const seaRegions = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  seaRegions.value.current_page = page
  await getSeaRegions()
}

const onClickFilters = async () => {
  seaRegions.value.current_page = 1
  await getSeaRegions()
}

const viewSeaRegion = (searegion: any) => {
  router.push(`/configuration/sea-regions/view-${searegion.id}`)
}

const editSeaRegion = async (searegion: any) => {
  router.push(`/configuration/sea-regions/edit-${searegion.id}`)
}

const showConfirmDelete = async (seaRegion: any) => {
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
      const response = await $api.seaRegions.delete(seaRegion.id)
      snackbar.add({ type: 'success', text: 'Sea region deleted' })
      await getSeaRegions()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getSeaRegions = async () => {
  try {
    loadingStore.start()
    const response = await $api.seaRegions.getSeaRegions({
      query: {
        page: seaRegions.value.current_page,
        perPage: seaRegions.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    seaRegions.value = response as any
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
  await getSeaRegions()
}

onMounted(async () => {
  await getSeaRegions()
})
</script>
