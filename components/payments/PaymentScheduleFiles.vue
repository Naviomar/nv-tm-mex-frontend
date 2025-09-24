<template>
  <div>
    <v-btn @click="openDialog" color="primary" size="small">
      <div class="flex items-center gap-2">
        <v-icon size="large">mdi-attachment</v-icon>
        Attachments
      </div>
    </v-btn>
    <v-dialog v-model="form.showDialog" max-width="600">
      <v-card>
        <v-card-title v-if="false">
          <span class="headline">#{{ props.linePayScheduleId }}</span>
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
              <tr v-if="attachments.length === 0">
                <td colspan="2" class="text-center">No attachments.</td>
              </tr>
              <tr v-for="(attach, index) in attachments" :key="`proof-${index}`">
                <td>
                  <ButtonDownloadS3Object :s3Path="attach.attachment" />
                </td>
                <td>
                  <UserInfoBadge :item="attach">
                    {{ formatDateString(attach.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
          <div class="flex flex-col gap-2 py-4">
            <v-file-input v-model="form.files" label="Upload files" density="compact" multiple hide-details />
            <v-btn color="blue-darken-1" @click="onUploadFileClick">Upload</v-btn>
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
  linePayScheduleId: {
    type: [String, Number],
    required: true,
  },
})

const form = reactive({
  showDialog: false,
  files: [] as File[],
})

const attachments = ref<any>([])

const openDialog = () => {
  form.showDialog = true
}

const onUploadFileClick = async () => {
  try {
    if (form.files.length === 0) {
      snackbar.add({ type: 'error', text: 'Please select a file' })
      return
    }

    const body = {
      attachments: form.files,
    }
    loadingStore.start()
    const response = (await $api.linePayments.addAttachment(props.linePayScheduleId, body)) as any
    attachments.value = response || []

    snackbar.add({ type: 'success', text: 'Attachment uploaded' })
    form.files = []
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
const getAttachments = async () => {
  try {
    loadingStore.start()
    const response = (await $api.linePayments.getAttachments(props.linePayScheduleId)) as any
    attachments.value = response || []
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

watch(
  () => props.linePayScheduleId,
  async (linePayScheduleId) => {
    if (linePayScheduleId) {
      await getAttachments()
    }
  },
  { immediate: true }
)
</script>
