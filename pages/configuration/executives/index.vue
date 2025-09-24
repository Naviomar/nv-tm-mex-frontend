<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Executives</h1>
    <div class="flex justify-end gap-3">
      <v-btn to="/configuration/executives/groups" color="secondary"><v-icon>mdi-plus</v-icon> groups </v-btn>
      <v-btn to="/configuration/executives/add" color="success"><v-icon>mdi-plus</v-icon> Add new executive </v-btn>
    </div>
    <div class="pt-4">
      <ExecutivesTable />
    </div>
  </v-container>
</template>
