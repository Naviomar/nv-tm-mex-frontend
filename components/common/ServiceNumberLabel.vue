<template>
  <div class="flex flex-col justify-center gap-0">
    {{ service.reference_number }}
    <div
      v-if="service.reference_number != service.ref_num_source"
      class="bg-gray-200 dark:bg-gray-800 p-1 rounded-sm text-xs"
    >
      <v-icon size="small" color="warning">mdi-arrow-right-bottom</v-icon>
      {{ service.ref_num_source }}
    </div>
    <div v-if="service.tracker_ref" class="bg-pink-200 dark:bg-pink-800 p-1 rounded-sm text-xs">
      <v-icon size="small" color="warning">mdi-arrow-right-bottom</v-icon>
      Tracker #{{ service.tracker_ref?.tracker_number }}
    </div>
    <div v-if="service.referencia_cl" class="bg-gray-200 dark:bg-gray-800 p-1 rounded text-xs">
      <v-icon size="small" color="warning">mdi-arrow-right-bottom</v-icon>
      {{ service.referencia_cl.reference_number }}
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  service: {
    type: Object as PropType<any>,
    required: true,
  },
})
</script>
