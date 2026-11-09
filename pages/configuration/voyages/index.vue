<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Voyages destinations</h1>
    <Can permission="port-logbook-view">
      <PortLogbookActiveBanner class="mt-3" />
    </Can>
    <Can permission="port-logbook-view">
      <template #denied>
        <VoyagesDestinationsPanel />
      </template>
      <v-tabs v-model="tab" color="primary" class="mt-2">
        <v-tab value="voyages">Voyages</v-tab>
        <v-tab value="logbook"><v-icon start>mdi-anchor</v-icon> Port logbook</v-tab>
      </v-tabs>
      <v-window v-model="tab" class="pt-4">
        <v-window-item value="voyages"><VoyagesDestinationsPanel /></v-window-item>
        <v-window-item value="logbook">
          <div class="text-body-2 text-medium-emphasis mb-3">
            Events that affect or close port operations (hurricanes, closures, strikes, congestion...), with start and end dates.
          </div>
          <PortLogbookTable />
        </v-window-item>
      </v-window>
    </Can>
  </v-container>
</template>
<script setup lang="ts">
const tab = ref('voyages')
</script>
