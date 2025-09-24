<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Tracking Events</div>
        <v-btn color="primary" to="/configuration/tracking-events/add"> Add Tracking event </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <TrackingEventsTable />
    </div>
  </v-container>
</template>
<script setup lang="ts"></script>
