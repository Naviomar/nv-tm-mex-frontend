<template>
  <div v-if="showMissingEmails || showMissingExecutive" class="d-flex flex-column ga-2 mb-3">
    <v-alert
      v-if="showMissingEmails"
      type="warning"
      variant="tonal"
      density="compact"
      icon="mdi-email-alert-outline"
    >
      This customer has no emails registered. Notifications for this customer will not reach them.
    </v-alert>
    <v-alert
      v-if="showMissingExecutive"
      type="warning"
      variant="tonal"
      density="compact"
      icon="mdi-account-alert-outline"
    >
      This customer has no active executive assigned.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  consigneeInfo: any
}>()

const showMissingEmails = computed(() => {
  if (!props.consigneeInfo) return false
  return props.consigneeInfo.has_emails === false
})

const showMissingExecutive = computed(() => {
  if (!props.consigneeInfo) return false
  return !props.consigneeInfo.executive_active
})
</script>
