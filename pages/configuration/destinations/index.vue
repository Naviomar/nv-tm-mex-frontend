<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Locations (Origins and destinations)</div>
        <Can permission="locations-create">
          <v-btn color="primary" to="/configuration/destinations/add"> Add location </v-btn>
        </Can>
      </div>
    </div>
    <div class="pt-4">
      <DestinationsTable />
    </div>
  </v-container>
</template>
