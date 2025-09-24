<template>
  <div>
    <v-btn @click="() => checkUserAndExecute(reqRefund.created_by, openDialog)" color="amber" size="small">
      <div class="flex items-center gap-2">
        <v-icon size="large">mdi-send</v-icon>
        Send notification
      </div>
    </v-btn>
    <v-dialog v-model="form.showDialog" max-width="600">
      <v-card>
        <v-card-title>
          <span class="headline">Notification form - Request Refund #{{ reqRefundId }}</span>
        </v-card-title>
        <div v-if="!hasAttachments">
          <v-card-text>
            <v-alert density="compact" type="warning" variant="outlined">
              <div>There are no attachments. Please add at least one to be able to send a notification.</div>
            </v-alert>
          </v-card-text>
        </div>
        <div v-if="hasAttachments">
          <v-card-text>
            <v-text-field
              v-model="form.emails"
              label="Emails *"
              placeholder="Emails separated by comma"
              density="compact"
              clearable
            />

            <v-textarea
              v-model="form.body"
              label="Message in body *"
              placeholder="Body"
              density="compact"
              :rows="3"
              clearable
            />
            <div>Note: Attachments also will be sent</div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" @click="form.showDialog = false">Close</v-btn>
            <v-btn color="blue-darken-1" @click="onSendClick">Send notification</v-btn>
          </v-card-actions>
        </div>
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

const reqRefundId = computed(() => props.reqRefund?.id)

const form = reactive({
  showDialog: false,
  emails: '',
  body: '',
})

const hasAttachments = computed(() => props.reqRefund?.attachments?.length > 0)

const openDialog = () => {
  form.showDialog = true
}

const onSendClick = async () => {
  try {
    if (!form.emails || !form.body) {
      snackbar.add({ type: 'error', text: 'Please fill all fields' })
      return
    }

    const body = {
      emails: form.emails,
      body: form.body,
    }

    loadingStore.start()
    const response = (await $api.refunds.resendNotification(props.reqRefund.id, body)) as any

    snackbar.add({ type: 'success', text: 'Notification sent' })
    form.showDialog = false
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
