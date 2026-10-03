<template>
  <v-tooltip location="top">
    <template #activator="{ props: tooltipProps }">
      <v-chip v-bind="tooltipProps" size="x-small" :color="meta.color" variant="tonal" :prepend-icon="meta.icon">
        {{ chargeName }}
      </v-chip>
    </template>
    <div class="text-xs">
      <div class="font-bold">{{ meta.label }}</div>
      <div>{{ chargeName }}</div>
      <div v-if="link.amount != null">
        Linked: {{ formatToCurrency(link.amount) }} {{ getCurrencyName(link.currency_id) }}
      </div>
    </div>
  </v-tooltip>
</template>
<script setup lang="ts">
// Liga de un concepto de proveedor con un concepto de venta (sell rate / cargo) o con un costo de FF Note.
const props = defineProps({
  link: { type: Object, required: true },
})

const isFfNote = computed(() => (props.link.chargeable_type || '').includes('FfNote'))

const chargeName = computed(() => props.link.chargeable?.charge?.name || `#${props.link.chargeable_id}`)

const meta = computed(() =>
  isFfNote.value
    ? { label: 'FF Note cost (TM debit)', color: 'orange-darken-2', icon: 'mdi-note-text-outline' }
    : { label: 'Sell concept', color: 'primary', icon: 'mdi-tag-outline' },
)
</script>
