<template>
  <div>
    <div v-if="isLocked">
      <v-btn
        v-if="hasDirectPermission"
        size="small"
        variant="tonal"
        color="purple"
        @click="showDialog"
      >
        Update Arrival Voyage
      </v-btn>
      <v-btn
        v-else
        size="small"
        variant="tonal"
        color="orange"
        @click="showDialog"
      >
        Request Authorization
      </v-btn>
    </div>

    <v-dialog v-model="dialog" max-width="700px">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <div class="flex items-center gap-2">
            <v-icon>mdi-ship-wheel</v-icon>
            <span>{{ hasDirectPermission ? 'Update Arrival Voyage' : 'Request Voyage Change Authorization' }}</span>
          </div>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-alert v-if="!hasDirectPermission" type="info" variant="tonal" class="mb-4">
            You need authorization to change locked voyages. Select the new voyage and provide a reason for the change.
          </v-alert>

          <div v-if="props.referencia?.voyage_discharge" class="mb-4 p-3 bg-grey-lighten-4 rounded">
            <div class="text-caption text-grey-darken-1 mb-1">Current Voyage</div>
            <div class="font-weight-medium">{{ props.referencia.voyage_discharge.name }}</div>
            <div v-if="props.referencia.voyage_discharge.internal_code" class="text-caption">
              Code: {{ props.referencia.voyage_discharge.internal_code }}
            </div>
          </div>

          <div class="mb-4">
            <div class="text-subtitle-2 mb-2">New Arrival Voyage</div>
            <AGlobalSearch
              v-model="newVoyage"
              :onSearch="searchImportVoyages"
              validate-key="update_voyage_discharge_id"
              label="Arrival voyage"
              prepend-inner-icon="mdi-ray-end-arrow"
              :return-object="true"
              :show-locked-indicator="true"
            />
          </div>

          <div v-if="!hasDirectPermission" class="mb-4">
            <v-textarea
              v-model="reason"
              label="Reason for change *"
              placeholder="Explain why this voyage change is needed..."
              rows="3"
              variant="outlined"
              density="compact"
              :rules="[v => !!v || 'Reason is required']"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn
            v-if="hasDirectPermission"
            color="purple"
            variant="flat"
            @click="saveChanges"
          >
            Update Voyage
          </v-btn>
          <v-btn
            v-else
            color="orange"
            variant="flat"
            @click="requestAuthorization"
          >
            Submit Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { hasPermission } = useCheckUser()

const props = defineProps({
  referencia: {
    type: [Object, null],
    required: true,
  },
})

const emits = defineEmits(['refresh'])

const dialog = ref(false)
const newVoyage = ref<any>(null)
const reason = ref('')

const hasDirectPermission = computed(() => hasPermission('sea-import-update-locked-arrival-voyage'))

const showDialog = () => {
  dialog.value = true
  newVoyage.value = null
  reason.value = ''
}

interface SearchParams {
  name?: string
  id?: number
  [key: string]: any // Allow additional keys, but we will filter them
}

const isLocked = computed(() => {
  return props.referencia?.voyage_discharge?.locked_at != null
})

const searchImportVoyages = async (search: SearchParams) => {
  try {
    const response = await $api.voyages.searchImportVoyages({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching voyages',
    })
  }
}

const saveChanges = async () => {
  try {
    if (!newVoyage.value) {
      snackbar.add({
        type: 'warning',
        text: 'Please select a voyage to update.',
      })
      return
    }

    loadingStore.start()
    const body = {
      voyage_discharge_id: typeof newVoyage.value === 'object' && newVoyage.value !== null ? newVoyage.value.id : newVoyage.value,
    }
    await $api.referencias.updateLockedArrivalVoyage(props.referencia!.id, body)
    snackbar.add({
      type: 'success',
      text: 'Arrival voyage updated successfully.',
    })
    dialog.value = false
    emits('refresh')
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error saving changes. Please try again later.',
    })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const requestAuthorization = async () => {
  try {
    if (!newVoyage.value) {
      snackbar.add({
        type: 'warning',
        text: 'Please select a voyage first.',
      })
      return
    }

    if (!reason.value || reason.value.trim() === '') {
      snackbar.add({
        type: 'warning',
        text: 'Please provide a reason for the voyage change.',
      })
      return
    }

    loadingStore.start()

    // Check if newVoyage is an object (from AGlobalSearch with returnObject) or just an ID
    let voyageData
    let voyageId

    if (typeof newVoyage.value === 'object' && newVoyage.value !== null) {
      // AGlobalSearch returned the full object
      voyageData = newVoyage.value
      voyageId = newVoyage.value.id
    } else {
      // It's just an ID, fetch the full details
      voyageId = newVoyage.value
      voyageData = await $api.voyages.getById(newVoyage.value)
    }

    const authRequest = {
      resource: 'sea-import-update-locked-voyage',
      resource_id: props.referencia!.id,
      resource_data: {
        reference_number: props.referencia!.reference_number,
        old_voyage_id: props.referencia!.voyage_discharge_id,
        old_voyage_name: props.referencia!.voyage_discharge?.name || '',
        old_voyage_internal_code: props.referencia!.voyage_discharge?.internal_code || '',
        new_voyage_id: voyageId,
        new_voyage_name: voyageData.name,
        new_voyage_internal_code: voyageData.internal_code || '',
        new_voyage_arrival_date: voyageData.arrival_date || '',
        new_voyage_eta_date: voyageData.eta_date || '',
        vessel_id: voyageData.vessel_id,
        pol_id: voyageData.pol_id,
        pod_id: voyageData.pod_id,
      },
      request_reason: reason.value,
      priority: 'medium',
    }

    await $api.authRequests.requestAuthorization(authRequest)
    snackbar.add({
      type: 'success',
      text: 'Authorization request submitted successfully. You will be notified when it is reviewed.',
    })
    dialog.value = false
    emits('refresh')
  } catch (error: any) {
    console.error('Error requesting authorization:', error)
    snackbar.add({
      type: 'error',
      text: error?.data?.message || 'Error submitting authorization request. Please try again later.',
    })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
