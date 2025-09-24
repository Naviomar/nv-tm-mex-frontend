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
        <v-card-title>
          <span class="headline">Attachments - Request Refund #{{ serviceName }}</span>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="w-10">Actions</th>
                <th class="text-left">Attachments</th>
                <th class="text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="attachments.length === 0">
                <td colspan="3" class="text-center">No attachments</td>
              </tr>
              <tr v-for="(attach, index) in attachments" :key="`proof-${index}`">
                <td>
                  <TrashButton
                    :item="attach"
                    @click="checkUserAndExecute(attach.created_by, () => showConfirmDelete)"
                  />
                </td>
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
            <v-btn color="blue-darken-1" @click="() => checkUserAndExecute(reqRefund.created_by, onUploadClick)"
              >Upload</v-btn
            >
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
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const { checkUserAndExecute } = useCheckUser()

const props = defineProps({
  reqRefund: {
    type: Object as any,
    required: true,
  },
})

const emits = defineEmits(['refresh'])

const serviceName = computed(() => props.reqRefund?.id)

const form = reactive({
  showDialog: false,
  files: [] as File[],
})

const attachments = ref<any>([])

const openDialog = () => {
  form.showDialog = true
}

const showConfirmDelete = async (item: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
    content: 'Please confirm this action.',
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
      const body = {
        ...item,
      }
      await $api.refunds.removeAttachment(props.reqRefund.id.toString(), body)

      snackbar.add({ type: 'success', text: 'Attachment deleted' })
      // splice the item from the array
      attachments.value.splice(attachments.value.indexOf(item), 1)
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const onUploadClick = async () => {
  try {
    if (form.files.length === 0) {
      snackbar.add({ type: 'error', text: 'Please select a file' })
      return
    }

    const body = {
      attachments: form.files,
    }
    loadingStore.start()
    const response = (await $api.refunds.uploadAttachments(props.reqRefund.id, body)) as any
    attachments.value = response || []

    snackbar.add({ type: 'success', text: 'Attachment uploaded' })
    form.files = []
    emits('refresh')
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
  () => props.reqRefund,
  async (service) => {
    if (service) {
      attachments.value = service.attachments || []
    }
  },
  { immediate: true }
)
</script>
