<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-2" @click="$router.back()">
      <v-icon>mdi-arrow-left</v-icon> Back
    </v-btn>
    <AirOperationProformas :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: `View Maritime Export Reference`,
  layout: 'default',
})
</script>
