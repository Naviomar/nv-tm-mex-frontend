<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Voyages destinations</h1>
    <div class="flex justify-end gap-3">
      <v-btn to="/configuration/voyages/add" color="success"><v-icon>mdi-plus</v-icon> Add new voyage </v-btn>
    </div>
    <div class="pt-4">
      <VoyageTable />
    </div>
  </v-container>
</template>
<script setup lang="ts"></script>
