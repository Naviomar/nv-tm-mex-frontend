<script setup lang="ts"></script>
<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Sea traffics</div>
        <v-btn color="primary" to="/configuration/sea-traffics/add"> Add sea traffic </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <SeaTrafficsTable />
    </div>
  </v-container>
</template>
