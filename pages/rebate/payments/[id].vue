<template>
  <v-container fluid>
    <RebateModuleLinks />
    <RebatePaymentDetail :batch-id="batchId" />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Rebate payment', layout: 'default' })

const route = useRoute()
const batchId = computed(() => Number(route.params.id))
</script>
