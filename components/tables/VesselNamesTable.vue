<template>
  <div>
    <v-card>
      <v-card-title> Vessel names </v-card-title>
      <v-card-text>
        <div class="mb-2" @keyup.enter="onClickFilters">
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

          <div class="py-4">
            <VesselNameAddButtonForm @refresh="getVesselNames" />
          </div>
        </div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(vessel, index) in vessels.data"
              :key="`vessel-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': vessel.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <TrashButton :item="vessel" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ vessel.name }}</td>
              <td>
                <UserInfoBadge :item="vessel">
                  {{ formatDateString(vessel.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="vessels.current_page"
          :length="vessels.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '~/utils/data/systemData'
import { formatDateString } from '~~/utils/formatters'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingStore = useLoadingStore()
const showWarningEdit = ref(false)

const filters = ref({
  name: '',
  deleted_status: null,
})

const vessels = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  vessels.value.current_page = page
  await getVesselNames()
}

const onClickFilters = async () => {
  vessels.value.current_page = 1
  await getVesselNames()
}

const showConfirmDelete = async (vessel: any) => {
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
      const response = await $api.vessels.deleteVesselName(vessel.id)
      snackbar.add({ type: 'success', text: 'Vessel name deleted' })
      await getVesselNames()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getVesselNames = async () => {
  try {
    loadingStore.start()
    const response = await $api.vessels.getVesselNames({
      query: {
        page: vessels.value.current_page,
        perPage: vessels.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    vessels.value = response as any
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
  await getVesselNames()
}

onMounted(async () => {
  await getVesselNames()
})
</script>
