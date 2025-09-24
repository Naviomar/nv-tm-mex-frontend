<template>
  <div>
    <v-btn @click="openDialog" color="primary" size="small">
      <div class="flex items-center gap-2">
        <v-icon size="large">mdi-package-variant-closed-check</v-icon>
        Proof of Delivery
      </div>
    </v-btn>
    <v-dialog v-model="form.showDialog" max-width="600">
      <v-card>
        <v-card-title>
          <span class="headline">Proof of Delivery - service #{{ serviceName }}</span>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Attachments</th>
                <th class="text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="proofDeliveries.length === 0">
                <td colspan="2" class="text-center">No proof of delivery uploaded</td>
              </tr>
              <tr v-for="(proofDelivery, index) in proofDeliveries" :key="`proof-${index}`">
                <td>
                  <ButtonDownloadS3Object :s3Path="proofDelivery.attachment" />
                </td>
                <td>
                  <UserInfoBadge :item="proofDelivery">
                    {{ formatDateString(proofDelivery.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
          <div class="flex flex-col gap-2 py-4">
            <v-file-input v-model="form.files" label="Upload files" density="compact" multiple hide-details />
            <v-btn color="blue-darken-1" @click="onUploadProofClick">Upload</v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" @click="form.showDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const props = defineProps({
  service: {
    type: Object as any,
    required: true,
  },
})

const serviceName = computed(() => props.service?.reference_number)

const form = reactive({
  showDialog: false,
  files: [] as File[],
})

const proofDeliveries = ref<any>([])

const openDialog = () => {
  form.showDialog = true
}

const onUploadProofClick = async () => {
  try {
    if (form.files.length === 0) {
      snackbar.add({ type: 'error', text: 'Please select a file' })
      return
    }

    const body = {
      attachments: form.files,
    }
    loadingStore.start()
    const response = (await $api.referencias.intermodalUploadProofDelivery(props.service.id, body)) as any
    proofDeliveries.value = response || []

    snackbar.add({ type: 'success', text: 'Proof of delivery uploaded' })
    form.files = []
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

// watch service
watch(
  () => props.service,
  async (service) => {
    if (service) {
      proofDeliveries.value = service.proof_deliveries || []
    }
  },
  { immediate: true }
)
</script>
