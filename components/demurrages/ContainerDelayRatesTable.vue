<template>
  <div>
    <!-- Filters -->
    <div class="mb-4">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.line_id"
            :items="lines"
            item-title="name"
            item-value="id"
            density="compact"
            label="Line"
            clearable
            @keyup.enter="getRates"
          />
        </div>

        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.container_type_id"
            :items="containerTypes"
            item-title="name"
            item-value="id"
            density="compact"
            label="Container type"
            clearable
            @keyup.enter="getRates"
          />
        </div>

        <v-autocomplete
          v-model="filters.rate_type"
          :items="rateTypes"
          item-title="text"
          item-value="value"
          density="compact"
          label="Rate"
          clearable
          @keyup.enter="getRates"
        />

        <v-text-field
          v-model="filters.active_on"
          density="compact"
          label="Active on (date)"
          type="date"
          @keyup.enter="getRates"
        />
      </div>

      <div class="grid grid-cols-6 gap-4 mt-3">
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            density="compact"
            label="Status"
            hide-details
            clearable
            @keyup.enter="getRates"
          />
        </div>
        <div class="col-span-4 flex gap-2 items-end">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getRates"> Search </v-btn>
        </div>
      </div>
    </div>

    <!-- Table -->
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Line</th>
              <th class="text-left">Container</th>
              <th class="text-left">Rate</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Start</th>
              <th class="text-left">End</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(rate, index) in rates.data"
              :key="`rate-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': rate.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <EditButton :item="rate" @click="editRate(rate)" />
                  <TrashButton :canRestore="false" :item="rate" @click="() => showConfirmDelete(rate)" />
                </div>
              </td>
              <td>{{ rate.line?.name }}</td>
              <td>{{ rate.container_type?.name }}</td>
              <td>
                <v-chip :color="rate.rate_type === 1 ? 'primary' : 'secondary'" size="small" label>
                  Rate {{ rate.rate_type }}
                </v-chip>
              </td>
              <td>{{ formatCurrency(rate.amount) }}</td>
              <td>{{ formatDateOnlyString(rate.start_date) }}</td>
              <td>{{ formatDateOnlyString(rate.end_date) ?? '—' }}</td>
              <td>
                <UserInfoBadge :item="rate">
                  {{ formatDateString(rate.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-pagination
          v-model="rates.current_page"
          :length="rates.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { deletedStatus } from '@/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingStore = useLoadingStore()

type RateRow = {
  id: number
  line_id: number
  line: any | null
  container_type_id: number
  container_type: any | null
  rate_type: 1 | 2
  amount: number
  start_date: string
  end_date: string | null
  created_at: string
  deleted_at?: string | null
}

const rateTypes = [
  { text: 'Rate 1', value: 1 },
  { text: 'Rate 2', value: 2 },
]

const filters = ref({
  line_id: null as number | null,
  container_type_id: null as number | null,
  rate_type: null as 1 | 2 | null,
  active_on: null as string | null,
  deleted_status: null as number | null, // align with your backend (e.g., 0=active,1=deleted,2=all)
})

const rates = ref({
  data: [] as RateRow[],
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const lines = ref<{ id: number; name: string }[]>([])
const containerTypes = ref<{ id: number; name: string }[]>([])

const onClickPagination = async (page: number) => {
  rates.value.current_page = page
  await getRates()
}

const editRate = (rate: RateRow) => {
  router.push(`/configuration/container-delay-rates/edit-${rate.id}`)
}

const viewRate = (rate: RateRow) => {
  router.push(`/configuration/container-delay-rates/view-${rate.id}`)
}

const showConfirmDelete = async (rate: RateRow) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this rate.',
    dialogProps: { persistent: true, maxWidth: 500 },
    confirmationButtonProps: { color: 'primary' },
  })

  if (!result) return

  try {
    loadingStore.start()
    await $api.containerDelayRates.deleteRate(rate.id)
    snackbar.add({ type: 'success', text: 'Rate updated' })
    await getRates()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error updating rate' })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const getRates = async () => {
  try {
    loadingStore.start()
    const response = await $api.containerDelayRates.getRates({
      query: {
        page: rates.value.current_page,
        perPage: rates.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })
    rates.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const loadCatalogs = async () => {
  try {
    loadingStore.start()
    const [ls, cts] = await Promise.all([
      $api.lines.getLines({ query: { perPage: 1000 } }),
      $api.containers.getAllTypes({ query: { perPage: 1000 } }),
    ])
    lines.value = (ls?.data ?? ls ?? []) as any
    containerTypes.value = (cts?.data ?? cts ?? []) as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const clearFilters = async () => {
  filters.value = {
    line_id: null,
    container_type_id: null,
    rate_type: null,
    active_on: null,
    deleted_status: null,
  }
  await getRates()
}

onMounted(async () => {
  await loadCatalogs()
  await getRates()
})

function formatCurrency(v: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(v ?? 0)
}
</script>
