<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Airports</div>
        <v-btn color="primary" to="/configuration/airports/add"> Add airport </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <AirportsTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Config Airports',
  layout: 'default',
})
</script>
