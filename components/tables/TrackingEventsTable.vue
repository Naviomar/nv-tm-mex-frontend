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
              <th class="text-left">Type</th>
              <th class="text-left">Name</th>
              <th class="text-left">Description</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(trackingEvent, index) in trackingEvents.data"
              :key="`track-event-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': trackingEvent.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <EditButton :item="trackingEvent" @click="editBank(trackingEvent)" />
                  <TrashButton :item="trackingEvent" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ trackingEvent.type }}</td>
              <td>{{ trackingEvent.name }}</td>
              <td>{{ trackingEvent.description }}</td>
              <td>
                <UserInfoBadge :item="trackingEvent">
                  {{ formatDateString(trackingEvent.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="trackingEvents.current_page"
          :length="trackingEvents.last_page"
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

const loadingStore = useLoadingStore()

const filters = ref({
  name: '',
})

const trackingEvents = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  trackingEvents.value.current_page = page
  await getTrackingEvents()
}

const onClickFilters = async () => {
  trackingEvents.value.current_page = 1
  await getTrackingEvents()
}

const editBank = (trackingEvent: any) => {
  router.push(`/configuration/tracking-events/edit-${trackingEvent.id}`)
}

const showConfirmDelete = async (trackingEvent: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate it.',
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
      await $api.trackingEvents.delete(trackingEvent.id)
      snackbar.add({ type: 'success', text: 'Tracking event deleted' })
      await getTrackingEvents()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getTrackingEvents = async () => {
  try {
    loadingStore.start()
    const response = await $api.trackingEvents.getPaged({
      query: {
        page: trackingEvents.value.current_page,
        perPage: trackingEvents.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    trackingEvents.value = response as any
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
  }
  await getTrackingEvents()
}

onMounted(async () => {
  await getTrackingEvents()
})
</script>
