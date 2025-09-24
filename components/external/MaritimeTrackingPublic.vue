<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center -mt-10">
    <div class="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6">
      <!-- Header -->
      <div class="text-center mb-6">
        <v-icon class="text-blue-500 text-5xl">mdi-ferry</v-icon>
        <h1 class="text-2xl font-bold text-gray-800 mt-2">Maritime Tracking</h1>
      </div>

      <!-- Search Bar -->
      <div class="flex items-center space-x-2">
        <input
          v-model="trackingNumber"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter BL or Container Number..."
        />
        <button
          @click="searchTracking"
          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </div>

      <!-- General Tracking Information -->
      <!-- General Tracking Information -->
      <div v-if="trackingInfo && Object.keys(trackingInfo).length" class="mt-6 bg-gray-50 p-4 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">General Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-gray-800">BL House:</span>
            <span class="text-gray-600">{{
              trackingInfo.house_bls?.map((bl: any) => bl.name).join(', ') || 'N/A'
            }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-gray-800">Reference:</span>
            <span class="text-gray-600">{{ trackingInfo.reference_number || 'N/A' }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-gray-800">Vessel:</span>
            <span class="text-gray-600">{{ trackingInfo.voyage_discharge?.short_name || 'N/A' }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-gray-800">ETD:</span>
            <span class="text-gray-600">{{ trackingInfo.voyage_discharge?.eta_date || 'N/A' }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-gray-800">Origin:</span>
            <span class="text-gray-600">{{ trackingInfo.origin?.name || 'N/A' }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-gray-800">POL (Port of Loading):</span>
            <span class="text-gray-600">{{ trackingInfo.pol?.name || 'N/A' }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-gray-800">POD (Port of Discharge):</span>
            <span class="text-gray-600">{{ trackingInfo.pod?.name || 'N/A' }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-gray-800">Destination:</span>
            <span class="text-gray-600">{{ trackingInfo.destination?.name || 'N/A' }}</span>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-0 py-2 text-sm">
          <span class="font-semibold text-gray-800">Containers:</span>
          <span class="text-gray-600">{{
            trackingInfo.containers?.map((cntr: any) => cntr.container_number).join(', ') || 'N/A'
          }}</span>
        </div>
      </div>

      <!-- Tracking Results -->
      <div v-if="trackingEvents.length" class="mt-6">
        <!-- Here i need to show general information of trackingNumber like: BL House, Reference, Vessel, ETD, Origin, POL, POD, Destination  -->
        <h2 class="text-lg font-semibold text-gray-700 mb-4">Tracking Timeline</h2>
        <div class="border-l-4 border-blue-500 space-y-4">
          <div v-for="event in trackingEvents" :key="event.id" class="relative">
            <div class="absolute -left-3.5 w-6 h-6 bg-blue-500 rounded-full"></div>
            <p class="ml-4 font-semibold text-gray-800">{{ event.event?.name }}</p>
            <p class="ml-4 text-gray-600 text-sm">
              <v-chip size="x-small" color="blue-lighten-4" variant="flat">{{
                event.type === 'bl' ? 'BL' : 'Container'
              }}</v-chip>
              {{ event.event_description }}
            </p>
            <p v-if="event.containers.length > 0" class="ml-4 text-gray-500 text-xs">
              Containers:
              {{ event.containers.map((cntr: any) => cntr.reference_container?.container_number).join(',') }}
            </p>
            <p class="ml-4 text-gray-500 text-xs">{{ formatDateOnlyString(event.event_date) }}</p>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <p v-if="searched && !trackingEvents.length" class="mt-6 text-gray-500 text-center">
        No tracking information found.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const route = useRoute()

const trackingNumber = ref('')
const trackingInfo = ref<any>({})
const trackingEvents = ref<any>([])
const searched = ref(false)

const searchTracking = async () => {
  try {
    // if no tracking number entered or less than 4 characters
    if (!trackingNumber.value || trackingNumber.value.length < 4) {
      snackbar.add({ type: 'warning', text: 'Please enter a valid tracking number' })
      return
    }

    loadingStore.start()

    searched.value = true
    trackingInfo.value = {}
    trackingEvents.value = []

    const body = {
      trackingNumber: trackingNumber.value,
    }
    const response = await $api.seaTrackings.publicSearch(body)

    trackingInfo.value = response.trackingInfo
    trackingEvents.value = response.trackingEvents

    // Simulate API Call
    // setTimeout(() => {
    //   if (trackingNumber.value === '123456') {
    //     trackingEvents.value = [
    //       { id: 1, status: 'Departed from Port', location: 'Shanghai, China', timestamp: '2024-02-01T10:30:00Z' },
    //       { id: 2, status: 'Arrived at Intermediate Port', location: 'Singapore', timestamp: '2024-02-05T15:00:00Z' },
    //       { id: 3, status: 'In Transit', location: 'Pacific Ocean', timestamp: '2024-02-10T08:45:00Z' },
    //       { id: 4, status: 'Arrived at Destination', location: 'Los Angeles, USA', timestamp: '2024-02-15T12:20:00Z' },
    //     ]

    //     trackingInfo.value = {
    //       blHouse: 'N/A',
    //       reference: 'N/A',
    //       vessel: 'N/A',
    //       etd: 'N/A',
    //       origin: 'N/A',
    //       pol: 'N/A',
    //       pod: 'N/A',
    //       destination: 'N/A',
    //     }
    //   }
    // }, 1000)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 300)
  }
}

const formatDate = (timestamp: any) => {
  return new Date(timestamp).toLocaleString()
}

onMounted(async () => {
  if (route.query.trackingNumber) {
    trackingNumber.value = route.query.trackingNumber as string
    await searchTracking()
  }
})
</script>
