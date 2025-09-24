<template>
  <v-container fluid>
    <v-btn @click="router.back()" variant="outlined" size="small" class="mb-4">Back</v-btn>
    <div class="">
      <div class="text-xl">Search vessels (destinations)</div>
      <div>Process to find voyage destinatios and register the initial day for demurrages to the vessel.</div>
    </div>
    <div class="pt-4">
      <VesselSetDemurrageInitDaySmart />
    </div>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()
</script>
