<template>
  <v-container fluid>
    <div class="mb-4">
      <v-btn color="slate" size="small" variant="outlined" @click="$router.back()" class="mb-2">Back</v-btn>

      <SeaTrackingNewEvent />
    </div>
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

definePageMeta({
  title: 'Sea Tracking - TM',
  layout: 'default',
})
</script>
