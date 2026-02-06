<template>
  <div class="perspective-distant">
    <div
      class="transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving"
    >
      <div class="">
        <h5 class="font-semibold leading-none text-center" v-if="!hasPendingRequest && !hasGrantedRequest">{{ label }}</h5>
      </div>

      <div class="pt-0">
        <div class="flex justify-around gap-2 mb-0">
          <button
            v-if="!hasPendingRequest && !hasGrantedRequest"
            class="font-bold text-xs p-1 rounded-lg chip-sand cursor-pointer"
            @click="confirmRequestAuthorization"
          >
            <v-icon>mdi-shield-lock-outline</v-icon>
          </button>

          <div
            v-if="hasPendingRequest && !hasGrantedRequest"
            class="text-center text-xs leading-none p-1 rounded-lg chip-peach"
          >
            <v-icon>mdi-shield-lock-outline</v-icon> <span class="italic">Authorization Pending</span>
          </div>
        </div>

        <div v-if="hasGrantedRequest" class="text-center text-xs leading-none">
          <slot name="auth"></slot>
          <div class="italic mt-1">
            <v-icon size="small">mdi-shield-check</v-icon> Authorized until
            {{ formatDateString(activeAuthorization?.expires_at) }}
          </div>
        </div>
      </div>
    </div>

    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card class="chip-velvet">
        <v-card-title class="text-h6">
          <v-icon>mdi-shield-lock-outline</v-icon> Request Process Authorization
        </v-card-title>
        <v-card-text>
          <div class="leading-none">Are you sure you want to request authorization to execute this process?</div>
          <div class="text-xs">{{ processName }}{{ requestKey }}</div>
          <v-textarea v-model="form.reason" label="Reason" counter rows="3" clearable />
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn color="error" @click="showConfirmDialog = false">Cancel</v-btn>
            <v-btn color="success" @click="onRequestAuthorizationClick">Request</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

// Props
const props = defineProps({
  processName: { type: String, required: true },
  requestKey: { type: String, required: true },
  label: { type: String, required: true },
  displayName: { type: String, default: '' },
  refresh: { type: Boolean, default: false },
})

// States
const showConfirmDialog = ref<any>(false)
const userRequests = ref<any>([])
const requestForProcess = ref<any>([])
const form = ref({ reason: '' })

// Compute whether there are pending/granted requests
const processNameKey = computed(() => {
  if (props.requestKey == null) {
    return props.processName
  }
  return `${props.processName}:${props.requestKey}`
})
const hasPendingRequest = computed(() => requestForProcess.value.length > 0)
const hasGrantedRequest = computed(() =>
  userRequests.value.some(
    (req: any) => req.process_name_key === processNameKey.value && req.status === 'granted' && req.is_granted
  )
)

const activeAuthorization = computed(() =>
  userRequests.value.find(
    (req: any) => req.process_name_key === processNameKey.value && req.status === 'granted' && req.is_granted
  )
)

// Request Authorization
const confirmRequestAuthorization = () => {
  showConfirmDialog.value = true
}

const onRequestAuthorizationClick = async () => {
  try {
    if (!form.value.reason.trim()) {
      snackbar.add({ type: 'error', text: 'Please provide a reason for the authorization request' })
      return
    }

    loadingStore.loading = true

    const body = {
      process_name: props.processName,
      request_key: props.requestKey,
      display_name: props.displayName,
      reason: form.value.reason,
    }
    await $api.authProcessRequests.requestAuthorization(body)

    snackbar.add({ type: 'success', text: 'Authorization request sent' })
    showConfirmDialog.value = false
    await fetchUserRequests()
  } catch (e) {
    console.error(e)
  } finally {
    loadingStore.stop()
  }
}

// Fetch Authorization Data
const fetchUserRequests = async () => {
  try {
    loadingStore.loading = true

    const response = await $api.authProcessRequests.getUserRequests()
    const responseByResource = await $api.authProcessRequests.getRequestsByResource({
      process_name: props.processName,
      request_key: props.requestKey,
    })
    userRequests.value = response
    requestForProcess.value = responseByResource
  } catch (e) {
    console.error(e)
  } finally {
    loadingStore.stop()
  }
}

// Auto-fetch data
onMounted(fetchUserRequests)

// Refresh when needed
watch(
  () => props.refresh,
  async (newVal) => {
    if (newVal) await fetchUserRequests()
  },
  { immediate: true }
)
</script>
