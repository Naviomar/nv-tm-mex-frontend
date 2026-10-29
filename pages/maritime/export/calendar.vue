<template>
  <v-container fluid>
    <h1 class="text-xl font-bold mb-3">Export - Maritime · Calendar</h1>
    <ReferenceCalendar kind="sea-export" />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Export - Maritime - Calendar',
  layout: 'default',
})
</script>
