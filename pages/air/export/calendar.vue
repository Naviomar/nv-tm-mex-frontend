<template>
  <v-container fluid>
    <h1 class="text-xl font-bold mb-3">Export - Air · Calendar</h1>
    <ReferenceCalendar kind="air-export" />
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Export - Air - Calendar',
  layout: 'default',
})
</script>
