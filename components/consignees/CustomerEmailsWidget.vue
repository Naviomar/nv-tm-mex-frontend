<template>
  <div>
    <div class="flex items-center gap-2">
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" class="ml-1 cursor-pointer">mdi-information-outline</v-icon>
        </template>
        <div class="font-bold">Emails filtered by</div>
        <div v-for="(mailNotify, index) in notifys" :key="`notify-${index}`">
          {{ mailNotify.short_name }}
        </div>
      </v-tooltip>
      <v-btn color="primary" size="small" variant="flat" @click="getCustomerEmails">Get customer emails</v-btn>
      <div v-if="ccEmails.length > 0">
        <div class="font-bold">CC:</div>
        <div v-for="(email, index) in ccEmails" :key="`cc-email-${index}`">
          <v-chip color="amber" size="small">{{ email.email }}</v-chip>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  customerId: {
    type: [String, Number],
    required: true,
  },
  notifys: {
    type: Array as PropType<any[]>,
    required: true,
    default: () => [],
  },
})

const ccEmails = ref<any>([])

const emits = defineEmits(['fetchedEmails'])

const validateNotifys = () => {
  if (props.notifys.length === 0) {
    snackbar.add({ type: 'warning', text: 'No mail notifications selected.' })
  }
}

const getCustomerEmails = async () => {
  try {
    loadingStore.start()

    const body = {
      mail_notifications: props.notifys.map((notify) => notify.short_name),
    }
    const response = await $api.consignees.getEmailByMailNotifications(props.customerId.toString(), body)
    if (response.emails.length === 0) {
      snackbar.add({ type: 'warning', text: 'Customer has no emails' })
      return
    }

    const toEmails = response.emails.filter((email: any) => email.types[0].type === 'TO')
    ccEmails.value = response.emails.filter((email: any) => email.types[0].type === 'CC')

    emits('fetchedEmails', toEmails.map((email: any) => email.email).join(', '))
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(() => {
  validateNotifys()
  getCustomerEmails()
})
</script>
