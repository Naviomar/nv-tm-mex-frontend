<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Destinations</div>
        <v-btn to="/configuration/national-destinations/add"> Add destinations </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <DestinationTable />
    </div>
  </v-container>
</template>

<script setup lang="ts"></script>
