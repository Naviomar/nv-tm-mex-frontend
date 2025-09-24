<script setup lang="ts"></script>
<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Sea regions</div>
        <v-btn color="primary" to="/configuration/sea-regions/add"> Add sea region </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <SeaRegionsTable />
    </div>
  </v-container>
</template>
