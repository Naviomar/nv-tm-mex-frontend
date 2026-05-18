<template>
  <div class="perspective-distant">
    <div
      class=""
    >
      <div class="pt-0 flex flex-col ">
        
        <div class="flex flex-col justify-around gap-2 mb-0">
          <div v-if="!hasPendingRequest && !hasGrantedRequest" class="transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving">
            
            <div
              class="font-bold text-center text-xs p-1 rounded-lg chip-sand cursor-pointer"
              @click="confirmRequestAuthorization"
            >
              <v-icon>mdi-shield-lock-outline</v-icon> <br><span class="italic" v-if="!hasPendingRequest && !hasGrantedRequest">{{ label }}</span>
            </div>
          </div>
          <div  v-if="hasPendingRequest && !hasGrantedRequest" class=" cursor-pointer transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving">
            <div
             
              class="font-bold text-center text-xs p-1 rounded-lg cursor-pointer bg-red-100 text-red-700 hover: bg-red-200"
              @click="confirmDeleteRequestAuthorization"
            >
              <v-icon>mdi-shield-remove-outline</v-icon> <br><span class="italic">Cancel Authorization</span>
              
            </div>
          </div>

          <div v-if="hasPendingRequest && !hasGrantedRequest" class="transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving">
            <div
              
              class="text-center text-xs leading-none p-1 rounded-lg chip-peach"
            >
              <v-icon>mdi-shield-lock-outline</v-icon> <span class="italic">Authorization Pending</span>
            </div>
          </div>
        </div>

        <div  v-if="hasGrantedRequest" class="transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving">
          <div class="text-center text-xs leading-none">
            <slot name="auth"></slot>
            <div class="italic mt-1">
              <v-icon size="small">mdi-shield-check</v-icon> Authorized until
              {{ formatDateString(activeAuthorization?.expires_at) }}
            </div>
          </div>
        </div>

      </div>
    </div>

    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card class="">
        <v-card-title class="text-h6">
          <v-icon>mdi-shield-lock-outline</v-icon> Request Process Authorization
        </v-card-title>
        <v-card-text>
          <div class="leading-none">Are you sure you want to request authorization to execute this process?</div>
          <div class="text-sm font-semibold mt-1">{{ friendlyDisplayName }}</div>
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

    <v-dialog v-model="showConfirmDelReqDialog" max-width="400">
      <v-card class="chip-velvet">
        <v-card-title class="text-h6">
          <v-icon>mdi-shield-lock-outline</v-icon> Cancel Process Auth
        </v-card-title>
        <v-card-text class="bg-surface-light pt-2">
          <div class="leading-none">Are you sure you want to cancel request authorization to execute this process?</div>
          <div class="text-sm font-semibold mt-1"></div>
          <v-textarea label="Reason" v-model="form.reason_deleted" counter rows="3" clearable />
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn color="error" @click="showConfirmDelReqDialog = false">Close</v-btn>
            <v-btn color="success" @click="onRequestCancelAuthorizationClick">Cancel</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>


  </div>

</template>

<script setup lang="ts">
import { getProcessDisplayName } from '~/utils/data/system'
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

// Resolve a human-readable name: combine label + displayName, or fall back to processResources map
const friendlyDisplayName = computed(() => {
  // If displayName is provided, combine with label for a complete description
  if (props.displayName) {
    return `${props.label} — ${props.displayName}`
  }
  // Otherwise use the utility function which resolves from processResources
  return getProcessDisplayName(props.processName, props.requestKey, null)
})

// States
const showConfirmDialog = ref<any>(false)
const showConfirmDelReqDialog = ref<any>(false)
const userRequests = ref<any>([])
const requestForProcess = ref<any>([])
const form = ref({ reason: '', reason_deleted: '' })

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

///Del Request
const confirmDeleteRequestAuthorization = () => {
  showConfirmDelReqDialog.value = true
}
// Request Authorization
const confirmRequestAuthorization = () => {
  showConfirmDialog.value = true
}

const onRequestCancelAuthorizationClick = async () => {
  console.log("reason:",form.value)
  try {
    if (!form.value.reason_deleted.trim()) {
      snackbar.add({ type: 'error', text: 'Please provide a reason for the cancelation authorization request' })
      return
    }

    loadingStore.loading = true

    const body = {
      process_name: props.processName,
      request_key: props.requestKey,
      display_name: friendlyDisplayName.value,
      reason: form.value.reason_deleted,
    }
    const reason_deleted = {reason_deleted: form.value.reason_deleted.trim()}
    
    if(requestForProcess.value){
        for(var i = 0; i<requestForProcess.value.length; i++){
          await $api.authProcessRequests.cancelAuth(requestForProcess.value[i].id, reason_deleted)
        }
    }
    
    snackbar.add({ type: 'success', text: 'Authorization request was canceled' })
    showConfirmDelReqDialog.value = false
    form.value.reason = ''
    loadingStore.stop()
    await fetchUserRequests()
  } catch (e) {
    console.error(e)
    loadingStore.stop()
  }
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
      display_name: friendlyDisplayName.value,
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
console.log("entre await:",props)
  try {
    loadingStore.loading = true

    const response = await $api.authProcessRequests.getUserRequests()
    const responseByResource = await $api.authProcessRequests.getRequestsByResource({
      process_name: props.processName,
      request_key: props.requestKey,
    })
    console.log("response:",response)
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
