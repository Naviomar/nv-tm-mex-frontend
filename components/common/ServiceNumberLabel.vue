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
    <ReferenceOriginBands
      :tracker-number="service.tracker_ref?.tracker_number"
      :chile-reference="service.referencia_cl?.reference_number"
    />
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
