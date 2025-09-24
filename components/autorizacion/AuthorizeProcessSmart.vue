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
        <div class="flex justify-around gap-2 mb-2">
          <button
            v-if="!hasPendigRequest && !hasGrantedRequest"
            class="align-middle select-none font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 px-3 rounded-lg bg-yellow-600 text-white"
            @click="confirmRequestAuthorization"
          >
            <v-icon>mdi-shield-lock-outline</v-icon><span class="font-sans">Request Authorization</span>
          </button>
          <div v-if="hasPendigRequest && !hasGrantedRequest" class="text-center text-xs text-yellow-900">
            <v-icon>mdi-shield-lock-outline</v-icon><span class="italic">Authorization Pending</span>
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
    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card color="red-lighten-5">
        <v-card-title class="text-h6">
          <v-icon>mdi-shield-lock-outline</v-icon><span class="italic">Request Authorization</span>
        </v-card-title>
        <v-card-text>
          <p class="text-h6">Are you sure you want to request authorization for this resource?</p>
          <v-textarea
            v-model="form.request_reason"
            label="Reason"
            hint="Please provide a reason for the authorization request"
            counter
            rows="3"
            clearable
          ></v-textarea>

          <v-file-input v-model="form.files" label="Add supporting documents" multiple clearable />
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn color="error" @click="showConfirmDialog = false">Cancel</v-btn>
            <v-btn color="success" @click="requestAuthorization">Request</v-btn>
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
})

const showConfirmDialog = ref(false)
const userAuthRequests = ref<any>([])
const requestsByResource = ref<any>([])
const form = ref<any>({ request_reason: '', files: [] })

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

const confirmRequestAuthorization = () => {
  showConfirmDialog.value = true
}

const requestAuthorization = async () => {
  try {
    if (form.value.request_reason == null || form.value.request_reason === '') {
      snackbar.add({ type: 'error', text: 'Please provide a reason for the authorization request' })
      return
    }
    loadingStore.loading = true
    const body = {
      resource: props.resource,
      resource_id: props.resourceId,
      request_reason: form.value.request_reason,
      files: form.value.files,
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

watch(
  () => props.refresh,
  async () => {
    if (props.refresh) {
      await getUserAuthRequests()
    }
  },
  { immediate: true }
)
</script>
