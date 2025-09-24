<script setup lang="ts"></script>
<template>
  <v-container fluid>
    <div>
      <div class="flex justify-end gap-3">
        <v-btn color="success" to="/configuration/countries/add"> <v-icon>mdi-plus</v-icon>Add country </v-btn>
      </div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Countries</div>
      </div>
    </div>
    <div class="pt-4">
      <CountriesTable />
    </div>
  </v-container>
</template>
