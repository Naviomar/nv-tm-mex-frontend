<template>
  <div class="buy-sell">
    <div v-for="row in rows" :key="row.label" class="buy-sell__row">
      <span class="buy-sell__label">{{ row.label }}</span>
      <div class="buy-sell__track">
        <div class="buy-sell__bar" :class="`bg-${row.color}`" :style="{ width: `${row.pct}%` }" />
      </div>
      <span class="buy-sell__amount">{{ money(row.value) }}</span>
    </div>

    <div class="buy-sell__result">
      <v-icon size="14" color="error">mdi-trending-down</v-icon>
      <span class="text-error font-weight-bold">Pérdida {{ money(difference) }}</span>
      <span v-if="marginPct !== null" class="tm-muted">· margen {{ marginPct.toFixed(1) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  buy: number
  sell: number
  difference: number
  marginPct: number | null
}>()

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const money = (value: number) => formatter.format(value)

const rows = computed(() => {
  const max = Math.max(props.buy, props.sell, 1)
  return [
    { label: 'Compra', value: props.buy, color: 'error', pct: (props.buy / max) * 100 },
    { label: 'Venta', value: props.sell, color: 'success', pct: (props.sell / max) * 100 },
  ]
})
</script>

<style scoped>
.buy-sell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.buy-sell__row {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  align-items: center;
  gap: 8px;
  font-size: 0.74rem;
}

.buy-sell__label {
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.buy-sell__track {
  height: 8px;
  border-radius: 4px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  overflow: hidden;
}

.buy-sell__bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.buy-sell__amount {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  text-align: right;
  min-width: 82px;
}

.buy-sell__result {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.74rem;
  margin-top: 2px;
}
</style>
