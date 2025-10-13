export const useExchangeRatesStore = defineStore('exchangeRates', {
    state: () => ({
        rates: [] as any[],
        date: null,
    }),
    getters: {
        dateRates(state) {
            return state.date
        },
        emptyRates(state) {
            return state.rates.length === 0
        },
    },
    actions: {
        async fetchExchangeRates($api: any) {
            try {
                const response = await $api.exchangeRates.getTodayRates()
                this.rates = response.rates
                this.date = response.date
            } catch (error) {
                console.error('Failed to fetch exchange rates:', error)
            }
        },
        getExchangeRate($originCurrencyId: number, $destinationCurrencyId: number) {
            if ($originCurrencyId === $destinationCurrencyId) return 1
            let rate = this.rates.find(
                (rate: any) =>
                    rate.origin_currency?.id === $originCurrencyId && rate.destination_currency?.id === $destinationCurrencyId)?.rate || 0

            // if rate not found try to find the inverse rate
            if (rate === 0) {
                rate = this.rates.find(
                    (rate: any) =>
                        rate.origin_currency?.id === $destinationCurrencyId && rate.destination_currency?.id === $originCurrencyId)?.rate || 0

                if (rate !== 0) {
                    rate = 1 / rate
                }
            }

            rate = parseFloat(rate) || 0; // Ensure rate is a number
            return parseFloat(rate.toFixed(4));
        },

        getUsdAmountToMxn($usdAmount: number) {
            const exRate = this.rates.find(
                (rate: any) => rate.origin_currency?.code === 'USD' && rate.destination_currency?.code === 'MXN'
            )?.rate || 0

            return $usdAmount * exRate
        }
    },
})