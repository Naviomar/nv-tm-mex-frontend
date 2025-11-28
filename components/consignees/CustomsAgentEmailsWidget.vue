<template>
  <div>
    <v-btn color="primary" size="small" variant="flat" class="mb-4" @click="getEmails">Get customs agent emails</v-btn>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const emits = defineEmits(['fetchedEmails'])

const getEmails = async () => {
  try {
    loadingStore.start()
    const response = await $api.customAgents.getEmails(props.id.toString())
    if (response.length === 0) {
      snackbar.add({ type: 'warning', text: 'Customs agent has no emails' })
      return
    }

    emits('fetchedEmails', response)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(() => {
  getEmails()
})
</script>
