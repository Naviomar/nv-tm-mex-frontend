<template>
  <v-container fluid>
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-xl font-bold">Import - Maritime</h1>
        <ReferenceSeriesFilter :series="series" prefix="IM" :bypassed="seriesBypassed" />
      </div>
      <div class="flex md:flex-row flex-col justify-end gap-3">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn color="primary" v-bind="props">
              <div class="flex items-center gap-2">
                <v-icon>mdi-timer-alert-outline</v-icon> 
                Demurrages 
                <v-icon right>mdi-chevron-down</v-icon>
              </div>
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/maritime/import/demurrages/search">
              <template v-slot:prepend>
                <v-icon>mdi-magnify</v-icon>
              </template>
              <v-list-item-title>Search import references</v-list-item-title>
            </v-list-item>
            <v-list-item to="/invoices/lines/demurrage-detentions">
              <template v-slot:prepend>
                <v-icon>mdi-cash-clock</v-icon>
              </template>
              <v-list-item-title>Demurrage & Detentions request payments</v-list-item-title>
            </v-list-item>
            <v-list-item to="/invoices/suppliers/cfdis/create">
              <template v-slot:prepend>
                <v-icon>mdi-plus</v-icon>
              </template>
              <v-list-item-title>Add new supplier CFDI</v-list-item-title>
            </v-list-item>
            <v-list-item to="/maritime/import/demurrages/reports">
              <template v-slot:prepend>
                <v-icon>mdi-chart-bell-curve</v-icon>
              </template>
              <v-list-item-title>Demurrage Reports</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn to="/maritime/import/add" color="success"> <v-icon>mdi-plus</v-icon> New import reference </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <MaritimeImportTable :series-years="series.years" @update:series-bypassed="seriesBypassed = $event" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
// Series (IM26, IM27...) the catalog lists; by default the years in use now, and it moves with the calendar
const series = useReferenceSeries('sea-import')
const seriesBypassed = ref(false)

definePageMeta({
  title: 'Import - Maritime',
  layout: 'default',
})
</script>
