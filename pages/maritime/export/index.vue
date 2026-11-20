<template>
  <v-container fluid>
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-xl font-bold">Export - Maritime</h1>
        <ReferenceSeriesFilter :series="series" prefix="EM" :bypassed="seriesBypassed" />
      </div>
      <div class="flex justify-end gap-3">
        <v-btn to="/maritime/export/add" color="success"> <v-icon>mdi-plus</v-icon> New export reference </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <MaritimeExportTable :series-years="series.years" @update:series-bypassed="seriesBypassed = $event" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
// Series (EM26, EM27...) the catalog lists; by default the years in use now, and it moves with the calendar
const series = useReferenceSeries('sea-export')
const seriesBypassed = ref(false)

definePageMeta({
  title: 'Export - Maritime',
  layout: 'default',
})
</script>
