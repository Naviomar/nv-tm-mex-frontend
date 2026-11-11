<template>
  <div class="flex flex-wrap items-center gap-1" role="group" aria-label="Reference series">
    <v-chip
      size="small"
      :variant="series.mode === 'all' ? 'tonal' : 'text'"
      :color="series.mode === 'all' ? 'primary' : undefined"
      class="series-chip"
      title="List the references of every year"
      @click="series.showAll()"
    >
      All
    </v-chip>

    <v-chip
      v-for="year in series.quickYears"
      :key="year"
      size="small"
      :variant="isOn(year) ? 'tonal' : 'text'"
      :color="isOn(year) ? 'primary' : undefined"
      class="series-chip"
      :title="`${label(year)}: references of ${year}`"
      @click="series.toggle(year)"
    >
      <v-icon v-if="isOn(year)" size="x-small" start>mdi-check</v-icon>{{ label(year) }}
    </v-chip>

    <v-menu :close-on-content-click="false" location="bottom start">
      <template #activator="{ props: menuProps }">
        <v-chip v-bind="menuProps" size="small" variant="text" class="series-chip" title="Other series">
          <v-icon size="small">mdi-dots-horizontal</v-icon>
        </v-chip>
      </template>
      <v-card min-width="200" max-height="360" class="overflow-y-auto">
        <v-list density="compact" class="py-1">
          <v-list-subheader>Older series</v-list-subheader>
          <v-list-item v-for="year in series.olderYears" :key="year" :title="label(year)" @click="series.toggle(year)">
            <template #prepend>
              <v-checkbox-btn :model-value="isOn(year)" density="compact" readonly tabindex="-1" />
            </template>
          </v-list-item>
        </v-list>
        <v-divider />
        <div class="pa-2 flex flex-col gap-1">
          <v-btn size="small" variant="text" :disabled="series.mode === 'auto'" prepend-icon="mdi-restore" @click="series.reset()">
            Default ({{ defaultLabel }})
          </v-btn>
        </div>
      </v-card>
    </v-menu>

    <span v-if="bypassed" class="text-xs opacity-60 ml-1">
      <v-icon size="x-small">mdi-magnify</v-icon> Searching all years
    </span>
  </div>
</template>

<script setup lang="ts">
// Subtle series selector (IM26 IM27 ...) for the title of a catalog; the state lives in useReferenceSeries
const props = defineProps<{
  series: ReturnType<typeof useReferenceSeries>
  prefix: string
  /** The catalog is searching by an identifier, so the series is not hiding anything */
  bypassed?: boolean
}>()

const label = (year: number) => `${props.prefix}${String(year).slice(-2)}`
const isOn = (year: number) => props.series.years.includes(year)
const defaultLabel = computed(() => props.series.defaults.map(label).join(', '))
</script>

<style scoped>
.series-chip {
  cursor: pointer;
  font-weight: 600;
}
</style>
