<template>
  <div>
    <div class="flex justify-end gap-3">
      <Can permission="voyages-create">
        <v-btn to="/configuration/voyages/add" color="success"><v-icon>mdi-plus</v-icon> Add new voyage </v-btn>
      </Can>
    </div>
    <div class="pt-4">
      <VoyageTable />
    </div>
  </div>
</template>
