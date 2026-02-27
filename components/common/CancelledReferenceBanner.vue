<template>
  <v-alert
    v-if="isCancelled"
    type="error"
    variant="elevated"
    prominent
    class="mb-4"
    icon="mdi-cancel"
  >
    <div class="flex items-center gap-2">
      <span class="text-lg font-bold">REFERENCE CANCELLED</span>
      <span v-if="referenceNumber">— {{ referenceNumber }}</span>
    </div>
    <div class="text-sm mt-1">This reference has been cancelled. No changes are allowed.</div>
  </v-alert>
</template>
<script setup lang="ts">
const props = defineProps({
  deletedAt: {
    type: String,
    default: null,
  },
  referenceNumber: {
    type: String,
    default: '',
  },
})

const isCancelled = computed(() => !!props.deletedAt)
</script>
