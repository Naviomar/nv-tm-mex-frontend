<template>
  <div class="grid grid-cols-3 gap-4">
    <div class="col-span-1">TO: Consignee emails *</div>
    <div class="col-span-2">
      <v-textarea
        v-model="formResend.consignee_emails"
        rows="3"
        placeholder="Enter emails separated by comma"
        hide-details
      />
      <CustomerEmailsWidget
        :customer-id="reference.consignee_id"
        :notifys="customerNotifys"
        :pod-id="reference.pod_id"
        :custom-agent-id="reference.custom_agent_id"
        @fetched-emails="setResendCustomerEmails"
      />
    </div>
    <div class="col-span-1">Additional notes</div>
    <div class="col-span-2">
      <v-textarea v-model="formResend.notes" density="compact" rows="4" placeholder="Notes" />
    </div>
    <div class="col-span-1"></div>
    <div class="col-span-2">
      <v-btn size="small" color="primary" @click="resendRevalidationClick">Resend revalidation</v-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { hasAtLeastOneValidEmail } = useEmailListValidation()

const props = defineProps({
  reference: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['updated'])

const selectedNames = ['SeaImportNotifyRevalidation']

const customerNotifys = computed(() => {
  return mailNotifications.filter((notify) => selectedNames.includes(notify.short_name))
})

const formResend = ref<any>({
  consignee_emails: '',
  notes: '',
})

const setResendCustomerEmails = (emails: string) => {
  formResend.value.consignee_emails = emails
}

const resendRevalidationClick = () => {
  if (!hasAtLeastOneValidEmail(formResend.value.consignee_emails)) {
    snackbar.add({ type: 'warning', text: 'Enter at least one valid email in Consignee emails' })
    return
  }
  resendRevalidation()
}

const resendRevalidation = async () => {
  try {
    loadingStore.start()
    await $api.referencias.resendRevalidation(props.reference.id, formResend.value)

    snackbar.add({ type: 'success', text: 'Revalidation resent successfully' })

    formResend.value = {
      consignee_emails: '',
      notes: '',
    }

    emits('updated')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
