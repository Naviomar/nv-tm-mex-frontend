<template>
  <div>
    <v-btn color="primary" size="small" variant="flat" class="mb-4" @click="getFfEmails">Get F.F. agent emails</v-btn>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(['fetchedEmails'])

const getFfEmails = async () => {
  try {
    if (!props.id) {
      snackbar.add({ type: 'warning', text: 'F.F. agent ID is required.' })
      return
    }
    loadingStore.loading = true
    const response = await $api.freightForwarders.getFfEmails(props.id)
    if (response.emails.length === 0) {
      snackbar.add({ type: 'warning', text: 'F.F. agent has no emails' })
      return
    }

    emits('fetchedEmails', response.emails)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(() => {
  getFfEmails()
})
</script>
