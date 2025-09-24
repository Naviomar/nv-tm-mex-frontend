<template>
  <div>
    <div class="flex items-center">
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" class="ml-1 cursor-pointer">mdi-currency-usd</v-icon>
        </template>
        <span> Exchange rate: {{ exchangeRate }} </span>
      </v-tooltip>
      <span>USD {{ amount }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const amount = computed(() => {
  if (props.item.amount === null) {
    return 'N/A'
  }
  const total = props.item.amount * props.item.exchange_rate || 1
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total)
})

const exchangeRate = computed(() => {
  const rate = props.item.exchange_rate || 1
  // Si el exchange rate está invertido, lo invertimos para mostrarlo correctamente
  const displayRate = rate < 1 ? 1 / rate : rate
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(displayRate)
})
</script>
