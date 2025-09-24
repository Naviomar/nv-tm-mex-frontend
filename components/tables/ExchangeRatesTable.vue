<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field
            v-model="filters.fromDate"
            density="compact"
            type="date"
            label="Date"
            @keyup.enter="getExchangeRates"
          />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getExchangeRates"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Date</th>
              <th class="text-left">Origin &#8594; Destination</th>
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(exrate, index) in exchangeRates.data"
              :key="`exrate-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': exrate.deleted_at }"
            >
              <td>{{ exrate.date }}</td>
              <td>
                {{ exrate.destination_currency?.code }} &#8594; {{ exrate.origin_currency?.code }}:
                {{ formatToCurrency(exrate.rate) }}
              </td>
              <td>{{ formatDateString(exrate.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="exchangeRates.current_page"
          :length="exchangeRates.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref({
  fromDate: '',
})

const exchangeRates = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  exchangeRates.value.current_page = page
  await getExchangeRates()
}

const getExchangeRates = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.exchangeRates.getPaged({
      query: {
        page: exchangeRates.value.current_page,
        perPage: exchangeRates.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    exchangeRates.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

await getExchangeRates()

const clearFilters = async () => {
  filters.value = {
    fromDate: '',
  }
  await getExchangeRates()
}
</script>
