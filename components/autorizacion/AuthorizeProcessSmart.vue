<template>
  <div>
    <div class="relative flex flex-col text-gray-700 bg-zinc-50 shadow-md bg-clip-border rounded-sm">
      <div class="p-2">
        <h5 class="block antialiased font-semibold tracking-normal text-blue-gray-900">
          {{ label }}
        </h5>
        <p v-if="false" class="block text-xs antialiased font-light leading-relaxed text-inherit">
          Authorization module {{ resource }} {{ resourceId }}
        </p>
      </div>
      <div class="p-2 pt-0">
        <div class="flex flex-col justify-around gap-2 mb-2">
          <button
            v-if="!hasPendigRequest && !hasGrantedRequest"
            class="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-3 rounded-lg bg-yellow-600 text-white"
            @click="confirmRequestAuthorization"
          >
            <v-icon>mdi-shield-lock-outline</v-icon><span class="font-sans">Request Authorization</span>
          </button>

          <div  v-if="hasPendigRequest && !hasGrantedRequest" class=" cursor-pointer transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving">
            <div
             
              class="font-bold text-center text-xs p-1 rounded-lg cursor-pointer bg-red-100 text-red-700 hover: bg-red-200"
              @click="confirmDeleteRequestAuthorization"
            >
              <v-icon>mdi-shield-remove-outline</v-icon> <br><span class="italic">Cancel Authorization</span>
              
            </div>
          </div>
          <div  v-if="hasPendigRequest && !hasGrantedRequest" class=" cursor-pointer transform-3d relative border-2 border-yellow-500 border-dashed p-1 rounded-lg shadow shadow-yellow-500 hover:animate-dash-moving">
            <div  class="text-center text-xs text-yellow-900">
              <v-icon>mdi-shield-lock-outline</v-icon><span class="italic">Authorization Pending</span>
            </div>
          </div>
        </div>
        <div v-if="hasGrantedRequest" class="text-center text-xs text-green-900">
          <slot name="auth"></slot>
          <div class="italic mt-2">
            <v-icon>mdi-shield-check</v-icon>Authorized until {{ formatDateString(authorizationRequest?.expires_at) }}
          </div>
        </div>
      </div>
    </div>
    <v-dialog v-model="showConfirmDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6 gap-2 d-flex align-center">
          <v-icon>mdi-shield-lock-outline</v-icon>
          {{ tpl.title || 'Request Authorization' }}
        </v-card-title>
        <v-card-text>
          <p v-if="tpl.subtitle" class="text-sm text-medium-emphasis mb-3">{{ tpl.subtitle }}</p>
          <p v-else class="text-sm mb-2">Are you sure you want to request authorization for this resource?</p>

          <!-- Template elements in order -->
          <template v-for="el in tpl.elements" :key="el.id">
            <v-alert
              v-if="el.type === 'alert_block'"
              :type="(el as any).alert_type"
              variant="tonal"
              density="compact"
              class="mb-3"
            >
              {{ (el as any).alert_text }}
            </v-alert>

            <p v-else-if="el.type === 'text_block'" class="text-sm text-medium-emphasis mb-3">
              {{ (el as any).text }}
            </p>

            <div v-else-if="el.type === 'section'" class="text-caption text-uppercase font-weight-bold text-disabled mb-1 mt-2">
              {{ (el as any).title }}
            </div>
          </template>

          <v-textarea
            v-if="tpl.reason.show"
            v-model="form.request_reason"
            :label="tpl.reason.label"
            :rows="tpl.reason.rows ?? 3"
            counter
            clearable
          ></v-textarea>

          <v-file-input v-model="form.files" label="Add supporting documents" multiple clearable />
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn color="error" @click="showConfirmDialog = false">{{ tpl.buttons.cancel }}</v-btn>
            <v-btn color="success" @click="requestAuthorization">{{ tpl.buttons.submit }}</v-btn>
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
            <v-btn color="success" @click="requestCancelAuthorization">Cancel</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { authorizeResources } from '~/utils/data/system'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { getTemplate, loadCatalog } = useRequestTypeCatalog()
const showConfirmDelReqDialog = ref<any>(false)

const props = defineProps({
  resource: {
    type: String,
    required: true,
  },
  resourceId: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  refresh: {
    type: Boolean,
    default: false,
  },
  resourceData: {
    type: Object,
    default: null,
  },
})

const showConfirmDialog = ref(false)
// The resource code matches the auth_request_types code, so templates apply here too
const tpl = computed(() => getTemplate(props.resource))
const userAuthRequests = ref<any>([])
const requestsByResource = ref<any>([])
const form = ref<any>({ request_reason: '', files: [] , reason_deleted: ''})

const hasPendigRequest = computed(() => {
  return requestsByResource.value.length > 0
})

const hasGrantedRequest = computed(() => {
  return userAuthRequests.value.some(
    (request: any) =>
      request.resource === props.resource &&
      request.resource_id == props.resourceId &&
      request.is_authorized == 1 &&
      !request.expired
  )
})

const authorizationRequest = computed(() => {
  return userAuthRequests.value.find(
    (request: any) => request.resource === props.resource && request.resource_id == props.resourceId && !request.expired
  )
})

defineExpose({
  hasGrantedRequest,
  hasPendigRequest,
})

const confirmRequestAuthorization = () => {
  // Refresh the template catalog so recent template edits are reflected
  loadCatalog(true)
  showConfirmDialog.value = true
}

///Del Request
const confirmDeleteRequestAuthorization = () => {
  showConfirmDelReqDialog.value = true
}

const requestCancelAuthorization = async () => {
  try {
    if (form.value.reason_deleted == null || form.value.reason_deleted === '') {
      snackbar.add({ type: 'error', text: 'Please provide a reason for the cancelation authorization request' })
      return
    }
    loadingStore.loading = true
    const body: any = {
      resource: props.resource,
      resource_id: props.resourceId,
      reason_deleted: form.value.reason_deleted,
      files: form.value.files,
    }

    const reason_deleted = {reason_deleted: form.value.reason_deleted.trim()}
    
    if(requestsByResource.value){
        for(var i = 0; i<requestsByResource.value.length; i++){
          await $api.authRequests.cancelAuth(requestsByResource.value[i].id, reason_deleted)
        }
    }

    snackbar.add({ type: 'success', text: 'Authorization request was canceled' })

    showConfirmDelReqDialog.value = false
    form.value.reason = ''
    loadingStore.stop()
    await getUserAuthRequests()
  } catch (e) {
    console.error(e)
    loadingStore.stop()
  } 
}

const requestAuthorization = async () => {
  try {
    if (tpl.value.reason.show && tpl.value.reason.required && (form.value.request_reason == null || form.value.request_reason.trim() === '')) {
      snackbar.add({ type: 'error', text: 'Please provide a reason for the authorization request' })
      return
    }
    loadingStore.loading = true
    const body: any = {
      resource: props.resource,
      resource_id: props.resourceId,
      request_reason: form.value.request_reason,
      files: form.value.files,
    }
    if (props.resourceData) {
      body.resource_data = JSON.stringify(props.resourceData)
    }
    const response = await $api.authRequests.requestAuthorization(body)

    snackbar.add({ type: 'success', text: 'Authorization request sent' })

    showConfirmDialog.value = false
    await getUserAuthRequests()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error requesting authorization' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getUserAuthRequests = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.authRequests.getUserRequests()
    const responseByResource = await $api.authRequests.getRequestsByResource({ resource: props.resource, resource_id: Number(props.resourceId) })
    userAuthRequests.value = response
    requestsByResource.value = responseByResource
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getUserAuthRequests()
loadCatalog()

watch(
  () => props.refresh,
  async (newVal, oldVal) => {
    if (newVal !== oldVal) {
      await getUserAuthRequests()
    }
  },
)
</script>
