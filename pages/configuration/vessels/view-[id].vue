<template>
  <v-container fluid>
    <v-btn
      color="slate"
      size="small"
      variant="outlined"
      to="/configuration/vessels"
      class="mb-4"
      @click="$router.back()"
      >Back</v-btn
    >
    <VesselDetails :id="id" />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Home',
  layout: 'default',
})

const route = useRoute()
const id = route.params.id!.toString()
</script>
