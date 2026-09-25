<template>
  <v-dialog v-model="dialogVisible" max-width="880" scrollable>
    <v-card :color="darkMode.isDark ? 'cardBackground' : ''">
      <v-card-title class="d-flex align-center ga-3">
        <v-icon color="primary">mdi-chart-timeline-variant</v-icon>
        <span>Exchange rates history</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="dialogVisible = false"></v-btn>
      </v-card-title>
      <v-divider />

      <v-card-text class="pt-4">
        <div class="d-flex flex-wrap align-end ga-3 mb-3" @keyup.enter="onSearch">
          <v-text-field
            v-model="filters.fromDate"
            type="date"
            density="compact"
            label="Date"
            variant="outlined"
            clearable
            hide-details
            style="max-width: 200px"
          />
          <v-btn-toggle v-model="currencyFilter" color="primary" density="compact" variant="outlined" mandatory divided>
            <v-btn value="all" size="small">All</v-btn>
            <v-btn v-for="code in availableCurrencyCodes" :key="code" :value="code" size="small">
              {{ code }}
            </v-btn>
          </v-btn-toggle>
          <v-spacer />
          <div class="d-flex ga-2">
            <v-btn size="small" variant="outlined" color="secondary" @click="onClear">Clear</v-btn>
            <v-btn size="small" color="primary" @click="onSearch">Search</v-btn>
          </div>
        </div>

        <div v-if="isLoading" class="d-flex flex-column ga-3">
          <v-skeleton-loader v-for="n in 3" :key="`skeleton-${n}`" type="list-item-two-line" />
        </div>

        <div v-else-if="groupedRates.length === 0" class="text-center text-medium-emphasis py-10">
          <v-icon size="40" class="mb-2">mdi-currency-usd-off</v-icon>
          <div>No exchange rates found for the selected filters.</div>
        </div>

        <div v-else class="d-flex flex-column ga-4">
          <div v-for="group in groupedRates" :key="group.date">
            <div class="d-flex align-center ga-2 mb-2">
              <v-icon size="18" color="primary">mdi-calendar-month</v-icon>
              <span class="text-subtitle-2 font-weight-bold">{{ formatDateOnlyString(group.date) }}</span>
              <v-chip size="x-small" variant="tonal" color="primary">{{ group.rates.length }} rate(s)</v-chip>
            </div>
            <v-row dense>
              <v-col v-for="rate in group.rates" :key="`rate-${rate.id}`" cols="12" sm="6" md="4">
                <v-card
                  variant="tonal"
                  :color="getCurrencyColor(rate.origin_currency?.code)"
                  class="h-100"
                  rounded="lg"
                >
                  <v-card-text class="d-flex align-center justify-space-between py-3">
                    <div class="d-flex align-center ga-2">
                      <v-chip size="small" :color="getCurrencyColor(rate.origin_currency?.code)" variant="flat">
                        {{ rate.origin_currency?.code }}
                      </v-chip>
                      <v-icon size="16">mdi-arrow-right</v-icon>
                      <v-chip size="small" :color="getCurrencyColor(rate.destination_currency?.code)" variant="flat">
                        {{ rate.destination_currency?.code }}
                      </v-chip>
                    </div>
                    <div class="text-right">
                      <div class="font-weight-bold">{{ formatToCurrency(rate.rate) }}</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>

        <div v-if="!isLoading && groupedRates.length > 0" class="d-flex justify-center mt-4" style="max-width: 100%">
          <v-pagination
            v-model="pagination.current_page"
            :length="pagination.last_page"
            :total-visible="5"
            rounded="circle"
            density="comfortable"
            size="small"
            @update:model-value="fetchRates"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialogVisible = defineModel<boolean>({ default: false })

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const darkMode = useDarkMode()

const isLoading = ref(false)
const rates = ref<any[]>([])
const currencyFilter = ref('all')
const pagination = ref({ current_page: 1, last_page: 1, perPage: 25 })
const filters = ref({
  fromDate: '',
})

const currencyColors: Record<string, string> = {
  USD: 'blue',
  EUR: 'purple',
  GBP: 'green',
  MXN: 'amber-darken-2',
}

const getCurrencyColor = (code?: string) => currencyColors[code ?? ''] ?? 'grey'

const availableCurrencyCodes = computed(() => {
  const codes = new Set<string>()
  rates.value.forEach((rate) => {
    if (rate.origin_currency?.code) codes.add(rate.origin_currency.code)
  })
  return Array.from(codes).sort()
})

const filteredRates = computed(() => {
  if (currencyFilter.value === 'all') return rates.value
  return rates.value.filter((rate) => rate.origin_currency?.code === currencyFilter.value)
})

const groupedRates = computed(() => {
  const groups = new Map<string, any[]>()
  filteredRates.value.forEach((rate) => {
    const key = rate.date
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(rate)
  })
  return Array.from(groups.entries())
    .map(([date, rates]) => ({ date, rates }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
})

const fetchRates = async () => {
  try {
    isLoading.value = true
    const response: any = await $api.exchangeRates.getPaged({
      query: {
        page: pagination.value.current_page,
        perPage: pagination.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    rates.value = response.data
    pagination.value.current_page = response.current_page
    pagination.value.last_page = response.last_page
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading exchange rates history.' })
  } finally {
    isLoading.value = false
  }
}

const onSearch = () => {
  pagination.value.current_page = 1
  fetchRates()
}

const onClear = () => {
  filters.value = { fromDate: '' }
  currencyFilter.value = 'all'
  onSearch()
}

watch(dialogVisible, (visible) => {
  if (visible) fetchRates()
})
</script>
