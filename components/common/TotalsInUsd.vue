<template>
  <div v-if="totalInUsd != null">
    <div class="flex gap-2 justify-between">
      <v-icon color="primary" class="cursor-pointer" @click="dialog = true"> mdi-information </v-icon>
      <div :class="{ 'text-red-500': isNegative }">
        <span>{{ currencyName }} {{ isNegative ? '-' : '' }}{{ formatToCurrency(totalInUsd) }}</span>
      </div>
    </div>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">Conversion details</v-card-title>
        <v-card-text>
          <div>
            <span>Total in USD: {{ formatToCurrency(totalInUsd) }}</span>
            <span>&nbsp;{{ currencyName }}</span>
          </div>
          <v-list density="compact">
            <v-list-subheader inset>Totals by currency</v-list-subheader>
            <v-list-item v-for="(amount, currencyId) in props.amounts" :key="`total-${currencyId}`">
              <v-list-item-title>
                {{ formatToCurrency(amount) }} ({{ getCurrencyName(Number(currencyId)) }})
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  amounts: { type: Object as PropType<{ [currencyId: string]: number }>, default: () => ({}) },
  isNegative: { type: Boolean, default: false },
})

const exchangeRatesStore = useExchangeRatesStore()
const usdCurrencyId = 2 // Assuming USD is represented by currency_id 2
const dialog = ref(false)

// Reactive total USD amount
const totalInUsd = ref<number | null>(null)

const calculateTotalInUsd = async () => {
  let total = 0
  for (const [currencyId, amount] of Object.entries(props.amounts)) {
    const originCurrencyId = Number(currencyId)
    if (originCurrencyId === usdCurrencyId) {
      total += amount // Add USD amounts directly
    } else {
      const exchangeRate = await exchangeRatesStore.getExchangeRate(originCurrencyId, usdCurrencyId)
      total += amount * exchangeRate // Convert other currencies to USD
    }
  }
  totalInUsd.value = parseFloat(total.toFixed(2)) // Round to 2 decimals
}

// Recalculate whenever amounts change
watch(() => props.amounts, calculateTotalInUsd, { immediate: true })

const currencyName = computed(() => getCurrencyName(usdCurrencyId)) // USD currency name
</script>
