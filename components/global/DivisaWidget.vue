<template>
  <div>
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn color="primary" size="small" prepend-icon="mdi-currency-usd" v-bind="props">Rates</v-btn>
      </template>

      <v-card :color="darkMode.isDark ? 'cardBackground' : ''" class="opacity-95" max-width="300">
        <v-card-title class="text-sm! font-bold!">Exchange rates @ {{ formatDateOnlyString(dateRates) }}</v-card-title>
        <v-card-text>
          <div class="flex justify-center">
            <v-row no-gutters>
              <v-col v-if="emptyRates" cols="12">
                <div class="flex items-center">No rates available</div>
                <v-btn color="primary" size="x-small" @click="onClickRefresh">Refresh</v-btn>
              </v-col>
              <v-col v-for="(rate, index) in exchangeRatesStore.rates" cols="12" :key="`rate-${index}`">
                <div class="flex items-center">
                  {{ rate.origin_currency?.code }} &#8594; {{ rate.destination_currency?.code }}:
                  {{ formatToCurrency(rate.rate) }}
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { useExchangeRatesStore } from '@/stores/useExchangeRatesStore'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const darkMode = useDarkMode()

// Initialize the store
const exchangeRatesStore = useExchangeRatesStore()

// Fetch exchange rates when the component is created
await exchangeRatesStore.fetchExchangeRates($api)

const dateRates = computed(() => exchangeRatesStore.dateRates)
const emptyRates = computed(() => exchangeRatesStore.emptyRates)

const onClickRefresh = async () => {
  await exchangeRatesStore.fetchExchangeRates($api)
  if (exchangeRatesStore.emptyRates) {
    snackbar.add({ type: 'warning', text: 'No exchange rates available' })
  }
}
</script>
