<template>
  <v-container fluid>
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-xl font-bold">Import - Air</h1>
        <ReferenceSeriesFilter :series="series" prefix="IA" :bypassed="seriesBypassed" />
      </div>
      <div class="flex justify-end gap-3">
        <v-btn to="/air/import/add" color="success"> <v-icon>mdi-plus</v-icon> New import reference </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <AirImportTable :series-years="series.years" @update:series-bypassed="seriesBypassed = $event" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
// Series (IA26, IA27...) the catalog lists; by default the years in use now, and it moves with the calendar
const series = useReferenceSeries('air-import')
const seriesBypassed = ref(false)

definePageMeta({
  title: 'Import - Air',
  layout: 'default',
})
</script>
