<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Voyages destinations</h1>
    <Can permission="port-logbook-view">
      <template #denied>
        <VoyagesDestinationsPanel />
      </template>
      <PortLogbookActiveBanner v-if="tab === 'voyages'" class="mt-3" @open="tab = 'logbook'" />
      <v-tabs v-model="tab" color="primary" class="mt-2">
        <v-tab value="voyages">Voyages</v-tab>
        <v-tab value="logbook"><v-icon start>mdi-anchor</v-icon> Port logbook</v-tab>
      </v-tabs>
      <v-window v-model="tab" class="pt-4" :touch="false">
        <v-window-item value="voyages"><VoyagesDestinationsPanel /></v-window-item>
        <v-window-item value="logbook"><PortLogbookPanel /></v-window-item>
      </v-window>
    </Can>
  </v-container>
</template>
<script setup lang="ts">
const tab = ref('voyages')
</script>
