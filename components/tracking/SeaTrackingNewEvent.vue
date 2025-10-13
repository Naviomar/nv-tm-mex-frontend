<template>
  <div>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <v-card>
        <v-card-title>
          <div class="flex justify-between">
            <div class="flex gap-2">
              <v-icon>mdi-magnify</v-icon>
              <h3>Search Maritime Service</h3>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="grid grid-cols-1 gap-4 mb-4">
              <v-text-field v-model="filters.mbl" hide-details density="compact" label="Master BL" />
              <v-text-field v-model="filters.hbl" hide-details density="compact" label="House BL" />
              <v-text-field v-model="filters.containerNumber" hide-details density="compact" label="Container number" />
            </div>
            <div class="grid grid-cols-1">
              <div class="flex gap-2">
                <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
                <v-btn color="primary" @click="onClickSearchService"> Search </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
      <v-card v-if="hasReferencia">
        <v-card-title>
          <div class="flex justify-between">
            <div class="flex gap-2">
              <v-icon>mdi-ferry</v-icon>
              <h3>Service Found</h3>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 gap-2">
            <div>
              <strong>Reference Number:</strong>
              {{ serviceInfo.referencia.reference_number }}
            </div>
            <div>
              <strong>Master BL:</strong>
              {{ serviceInfo.referencia.master_bls?.map((mbl: any) => mbl.name).join(', ') }}
            </div>
            <div>
              <strong>House BLs:</strong>
              {{ serviceInfo.referencia.house_bls?.map((hbl: any) => hbl.name).join(', ') }}
            </div>
            <div>
              <strong>Vessel discharge:</strong>
              {{ serviceInfo.referencia.voyage_discharge?.name }}
            </div>
            <div>
              <strong>Origin:</strong>
              {{ serviceInfo.referencia.origin?.name }}
            </div>
            <div>
              <strong>POL:</strong>
              {{ serviceInfo.referencia.pol?.name }}
            </div>
            <div>
              <strong>POD:</strong>
              {{ serviceInfo.referencia.pod?.name }}
            </div>
            <div>
              <strong>Destination:</strong>
              {{ serviceInfo.referencia.destination?.name }}
            </div>
            <div>
              <strong>Containers:</strong>
              {{ serviceInfo.referencia.containers?.map((container: any) => container.container_number).join(', ') }}
            </div>
            <v-btn color="primary" @click="viewInPublicTracking">
              <v-icon>mdi-open-in-new</v-icon>
              View in public tracking
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
    <div class="grid grid-cols-1 gap-4">
      <v-card>
        <v-card-title>
          <div class="flex justify-between">
            <div class="flex gap-2">
              <v-icon>mdi-radar</v-icon>
              <h3>Events</h3>
            </div>
            <div v-if="hasReferencia && !eventForm.show">
              <v-btn color="amber" size="small" @click="showNewEventForm">Add new event</v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div v-if="eventForm.show" class="mb-8">
            <strong>Event form</strong>
            <div class="grid grid-cols-4 gap-2">
              <v-autocomplete
                v-model="eventForm.type"
                hide-details
                density="compact"
                label="Type"
                :items="[
                  { name: 'BL', value: 'bl' },
                  { name: 'Container', value: 'container' },
                ]"
                item-title="name"
                item-value="value"
                class="h-10"
              />
              <v-text-field
                v-model="eventForm.event_date"
                type="date"
                hide-details
                density="compact"
                label="Event date"
                class="h-10"
              />
              <v-select
                v-model="eventForm.event_id"
                hide-details
                density="compact"
                label="Event"
                :items="catalogs.events"
                item-title="name"
                item-value="id"
                class="h-10"
              />
              <v-textarea
                v-model="eventForm.event_description"
                hide-details
                density="compact"
                label="Details"
                :rows="3"
              />
            </div>
            <div class="grid grid-cols-2 gap-2 mb-2">
              <div v-if="eventForm.type === 'container'">
                <strong>Containers</strong>
                <v-autocomplete
                  v-model="eventForm.containers"
                  hide-details
                  density="compact"
                  label="Select containers"
                  :items="referenciaContainers"
                  item-title="container_number"
                  item-value="id"
                  class="h-10"
                  multiple
                />
              </div>
            </div>
            <div class="flex gap-2">
              <v-btn color="secondary" @click="clearEventForm"> Cancel </v-btn>
              <v-btn color="primary" @click="saveEvent"> {{ eventForm.id ? 'Save changes' : 'Add event' }} </v-btn>
            </div>
          </div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left" width="50">Actions</th>
                <th class="text-left">Type</th>
                <th class="text-left">Event date</th>
                <th class="text-left">Event</th>
                <th class="text-left">Details</th>
                <th class="text-left">is manual?</th>
                <th class="text-left">Created at</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="serviceInfo.tracking?.length <= 0">
                <td colspan="7" class="text-center">No events found</td>
              </tr>
              <tr
                v-for="(event, index) in serviceInfo.tracking"
                :key="`event-${index}`"
                :id="`sea-tracking-${event.id}`"
                :class="{ 'bg-red-100! dark:bg-red-900!': event.deleted_at }"
              >
                <td>
                  <div class="flex gap-2">
                    <EditButton :item="event" @click="editEvent(event)" />
                    <TrashButton :item="event" @click="showConfirmDelete(event)" />
                  </div>
                </td>
                <td>
                  {{ event.type }}

                  <div v-if="event.type === 'container'">
                    <strong>Containers:</strong>
                    {{
                      event.containers
                        ?.map((container: any) => container.reference_container?.container_number)
                        .join(', ')
                    }}
                  </div>
                </td>
                <td>{{ event.event_date }}</td>
                <td>{{ event.event?.name }}</td>
                <td>{{ event.event_description }}</td>
                <td>{{ event.is_manual ? 'Yes' : 'No' }}</td>
                <td>
                  <UserInfoBadge :item="event">
                    {{ formatDateString(event.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const publicTrackingUrl = `${config.public.appUrl}/public/tracking/maritime`

const serviceInfo = ref<any>({
  referencia: null,
  tracking: null,
})

const catalogs = ref({
  events: [],
})

const filters = ref<any>({
  referenciaId: null,
  mbl: null,
  hbl: null,
  containerNumber: null,
})

const eventForm = ref<any>({
  id: null,
  type: null,
  event_date: null,
  event_id: null,
  event_description: null,
  is_manual: false,
  containers: [],
  show: false,
})

const showNewEventForm = () => {
  clearEventForm()
  eventForm.value.show = true
}

const clearEventForm = () => {
  eventForm.value = {
    id: null,
    type: null,
    event_date: null,
    event_id: null,
    event_description: null,
    is_manual: false,
    containers: [],
    show: false,
  }
}

const hasReferencia = computed(() => !!serviceInfo.value.referencia)
const referenciaContainers = computed(() => serviceInfo.value.referencia?.containers || [])
const firstHouseBl = computed(() => serviceInfo.value.referencia?.house_bls?.[0]?.name)

const viewInPublicTracking = () => {
  navigateTo(`${publicTrackingUrl}?trackingNumber=${firstHouseBl.value}`, {
    external: true,
    open: {
      target: '_blank',
    },
  })
}

const editEvent = (event: any) => {
  eventForm.value = {
    id: event.id,
    type: event.type,
    event_date: event.event_date,
    event_id: event.event_id,
    event_description: event.event_description,
    containers: event.containers?.map((container: any) => container.reference_container_id),
    show: true,
  }
}

const showConfirmDelete = async (seaTracking: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete it.',
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
      const response = await $api.seaTrackings.delete(seaTracking.id)
      snackbar.add({ type: 'success', text: 'Sea tracking event deleted' })
      await findSeaTracking()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const saveEvent = async () => {
  try {
    if (!eventForm.value.type || !eventForm.value.event_date || !eventForm.value.event_id) {
      snackbar.add({ type: 'warning', text: 'You must fill all fields' })
      return
    }

    // if type is container, check if containers are selected
    if (eventForm.value.type === 'container' && !eventForm.value.containers.length) {
      snackbar.add({ type: 'warning', text: 'You must select at least one container' })
      return
    }

    loadingStore.start()

    const body = {
      ...eventForm.value,
      referencia_id: serviceInfo.value.referencia.id,
      // remove containers if type is not container
      containers: eventForm.value.type === 'container' ? eventForm.value.containers : [],
    }
    await $api.seaTrackings.upsert(body)

    snackbar.add({ type: 'success', text: 'Event added' })
    clearEventForm()
    await findSeaTracking()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickSearchService = async () => {
  // clear route query params
  await router.replace(route.path)
  filters.value.referenciaId = null
  await findSeaTracking()
}

const findSeaTracking = async () => {
  try {
    if (!filters.value.mbl && !filters.value.hbl && !filters.value.containerNumber && !filters.value.referenciaId) {
      snackbar.add({ type: 'warning', text: 'You must fill at least one field' })
      return
    }
    serviceInfo.value = {
      referencia: null,
      tracking: null,
    }

    loadingStore.start()
    const response = await $api.seaTrackings.getByService(filters.value)

    serviceInfo.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.seaTrackings.getCatalogs()
    catalogs.value = response as any
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
    referenciaId: null,
    mbl: null,
    hbl: null,
    containerNumber: null,
  }

  // clear route query params
  await router.replace(route.path)
}

onMounted(async () => {
  await getCatalogs()
  // if query param seaTrackingId is present, search by it
  if (route.query.referenciaId) {
    filters.value = {
      referenciaId: route.query.referenciaId,
    }
    await findSeaTracking()

    const focusEventId = route.query.seaTrackingId
    if (focusEventId) {
      const el = document.getElementById(`sea-tracking-${focusEventId}`)
      if (el) {
        // add blink class
        el.classList.add('animate-pulse')
        el.classList.add('bg-blue-100!')
        el.classList.add('dark:bg-blue-500!')
        setTimeout(() => {
          el.classList.remove('animate-pulse')
          el.classList.remove('bg-blue-100!')
          el.classList.remove('dark:bg-blue-500!')
        }, 15000)
      }
    }
  }
})
</script>
