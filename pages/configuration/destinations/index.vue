<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Locations (Origins and destinations)</div>
        <v-btn color="primary" to="/configuration/destinations/add"> Add location </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <DestinationsTable />
    </div>
  </v-container>
</template>
