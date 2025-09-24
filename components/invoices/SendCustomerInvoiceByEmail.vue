<template>
  <div>
    <v-btn
      color="secondary"
      size="small"
      variant="flat"
      class="mb-4"
      @click="emailProcess.showForm.value = !emailProcess.showForm.value"
      >Send invoice by email</v-btn
    >
    <div v-if="emailProcess.showForm.value" class="absolute z-10 min-w-96">
      <v-card color="orange-lighten-4">
        <v-card-title>Send {{ invoice_type }} invoice by email</v-card-title>
        <v-card-text>
          <div v-if="hasCfdiLinked">
            <v-autocomplete
              v-model="emailProcess.invoice_cfdi.value"
              :items="['invoice', 'cfdi']"
              label="Choose CFDI or system generated attachment"
            />
          </div>
          <div>Add emails comma separated</div>
          <v-textarea v-model="emailProcess.emails.value" :rows="3" label="Emails" hint="Comma separated" />

          <CustomerEmailsWidget
            :customer-id="invoice.consignee_id"
            :notifys="customerNotifys"
            @fetched-emails="emailProcess.setEmails"
          />
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn @click="emailProcess.showForm.value = false">Cancel</v-btn>
            <v-btn color="primary" @click="emailProcess.sendEmail">Send</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  invoice: {
    type: Object,
    required: true,
  },
  invoice_type: {
    type: String,
    required: true,
  },
})

const hasCfdiLinked = computed(() => !!props.invoice.uuid)

const notifyCustomerTm = ['ConsigneeInvoiceTm']
const notifyCustomerWm = ['ConsigneeInvoiceWm']

const customerNotifys = computed(() => {
  if (props.invoice_type === 'tm') {
    return mailNotifications.filter((notify) => notifyCustomerTm.includes(notify.short_name))
  }
  if (props.invoice_type === 'wm') {
    return mailNotifications.filter((notify) => notifyCustomerWm.includes(notify.short_name))
  }
  return []
})

const useEmail = () => {
  const showForm = ref(false)
  const emails = ref('')
  const invoice_cfdi = ref('invoice')

  const setEmails = (customerEmails: string) => {
    // if array split by comma
    if (Array.isArray(customerEmails)) {
      emails.value = customerEmails.join(', ')
      return
    }
    emails.value = customerEmails
  }

  const sendEmail = async () => {
    try {
      // validate emails are in comma separated format
      if (!validateCommaSeparatedEmails(emails.value)) {
        snackbar.add({ type: 'error', text: 'Invalid email format' })
        return
      }

      if (!invoice_cfdi.value) {
        snackbar.add({ type: 'error', text: 'Please select CFDI or system generated attachment' })
        return
      }

      loadingStore.start()
      const body = {
        emails: emails.value,
        invoice_id: props.id,
        invoice_class_name: props.invoice.class_name,
        invoice_type: props.invoice_type,
        invoice_cfdi: invoice_cfdi.value,
      }
      await $api.invoices.sendInvoiceByEmail(body)

      snackbar.add({ type: 'success', text: 'Email sent' })
      showForm.value = false
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }

  function validateCommaSeparatedEmails(emails: string) {
    if (!emails) return false
    // Regular expression for validating an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Split the input string by commas and trim each resulting email
    const emailArray = emails.split(',').map((email) => email.trim())

    // Validate each email and return false if any email is invalid
    for (let email of emailArray) {
      if (!emailRegex.test(email)) {
        return false
      }
    }

    // If all emails are valid, return true
    return true
  }

  return {
    showForm,
    emails,
    invoice_cfdi,
    sendEmail,
    setEmails,
  }
}

const emailProcess = useEmail()
</script>
