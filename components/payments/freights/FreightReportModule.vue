<template>
  <div class="rounded-lg shadow flex flex-col gap-4 w-full">
    <div class="font-bold text-lg">Freight Forwarders - Report</div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Cliente -->
      <div class="col-span-3">
        <v-autocomplete
          v-model="filters.ff_ids"
          density="compact"
          :items="freights"
          item-title="name"
          item-value="id"
          label="Freight Forwarder *"
          clearable
          multiple
          hide-details
        />
      </div>

      <div class="col-span-3">
        <AGlobalSearch
          :onSearch="searchFFGroups"
          v-model="filters.ff_group_id"
          validate-key="ff_group_id"
          label="F.F. Group *"
          hide-details
        />
      </div>

      <div class="col-span-1">
        <v-text-field
          v-model="filters.startDate"
          clearable
          type="date"
          density="compact"
          label="Start date"
          hide-details
        />
      </div>
      <div class="col-span-1">
        <v-text-field v-model="filters.endDate" clearable type="date" density="compact" label="End date" hide-details />
      </div>
    </div>
    <!-- Botón Exportar -->

    <div class="flex gap-2">
      <v-btn color="red" class="flex-shrink-0" @click="clearFilters" prepend-icon="mdi-close"> Clear filters</v-btn>
      <v-btn color="lime" class="flex-1" @click="generateFfReport" prepend-icon="mdi-chart-bar">
        Generar reporte
      </v-btn>
    </div>
    <div v-if="hasResults" class="flex gap-2">
      <v-btn color="primary" class="" @click="exportFfNoteReport" prepend-icon="mdi-file-excel">
        Exportar a Excel
      </v-btn>
    </div>

    <v-text-field
      v-if="false"
      v-model="searchText"
      label="Buscar Freight Forwarder"
      prepend-icon="mdi-magnify"
      clearable
      density="compact"
      hide-details
      class="w-full"
    />

    <div class="font-bold text-lg mt-6">💼 Reporte por Freight Forwarder</div>

    <v-expansion-panels v-if="false">
      <v-expansion-panel v-for="agent in groupedByAgent" :key="agent.freight_forwarder_id">
        <v-expansion-panel-title>
          <div class="flex justify-between items-center w-full font-semibold text-base">
            <span>🚚 {{ agent.freight_forwarder_name }}</span>
            <span class="text-sm font-bold text-green-800">💵 {{ formatToCurrency(agent.total_amount) }}</span>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <v-card v-for="(week, index) in agent.weeks" :key="index" class="p-4 bg-amber-50 rounded shadow">
              <div class="font-bold">📅 Semana {{ week.week }} - {{ week.year }}</div>
              <div class="text-sm">💰 Total: {{ formatToCurrency(week.total_amount) }}</div>
              <div class="text-sm mt-2 cursor-pointer" @click="showNotesForAgent(agent, week)">
                <v-icon class="mr-1" size="small">mdi-magnify</v-icon>
                <span class="underline"> {{ week.notes.length }} notas </span>
              </div>
            </v-card>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="font-bold">Montos dolarizados (USD)</div>
    <v-expansion-panels v-if="false">
      <v-expansion-panel v-for="(group, index) in groupedByWeek" :key="index">
        <v-expansion-panel-title>
          <div class="flex justify-between items-center w-full font-semibold text-lg">
            <span>📅 Semana {{ group.week }} - {{ group.year }}</span>
            <span class="text-sm font-bold text-green-800">💵 {{ getWeeklyTotal(group) }}</span>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <v-card v-for="ff in group.forwarders" :key="ff.freight_forwarder_id" class="p-4 bg-blue-50 rounded shadow">
              <div class="font-bold text-primary text-base mb-2">
                {{ ff.freight_forwarder_name }}
              </div>
              <div class="text-sm">
                💰 <span class="font-semibold">Total:</span
                ><span class="font-bold">{{ formatToCurrency(ff.total_amount) }}</span>
              </div>
              <div class="text-sm mt-2 cursor-pointer" @click="showNotes(ff)">
                <v-icon class="mr-1" size="small" color="white">mdi-magnify</v-icon>
                <span class="cursor-pointer underline"> {{ ff.notes.length }} notas </span>
              </div>
            </v-card>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="font-bold text-lg">📊 Matriz de Agentes vs Semanas</div>
    <v-text-field
      v-model="agentSearch"
      label="Buscar Agente"
      prepend-icon="mdi-magnify"
      class="w-1/2 mb-2"
      clearable
      density="compact"
    />
    <div class="overflow-auto">
      <table class="min-w-full table-auto border border-gray-300 text-sm">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2 text-center">
              <v-checkbox
                density="compact"
                hide-details
                :indeterminate="someSelected && !allSelected"
                :model-value="allSelected"
                @update:model-value="toggleSelectAll"
              />
            </th>
            <th class="border p-2 text-left">Freight Forwarder</th>
            <th class="border p-2 text-left">Group</th>
            <th class="border p-2 text-right">Summary</th>
            <th v-for="week in pivotTable.weeks" :key="week" class="border p-2 text-center">
              {{ week }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="agent in pivotTable.agents" :key="agent.freight_forwarder_id" class="hover:bg-gray-50">
            <td class="border p-2 text-center">
              <v-checkbox
                density="compact"
                hide-details
                :value="agent.freight_forwarder_id"
                v-model="selectedAgentIds"
              />
            </td>
            <td class="border p-2 font-semibold">{{ agent.freight_forwarder_name }}</td>
            <td class="border p-2">{{ agent.group_name }}</td>
            <!-- NUEVA -->
            <td class="border p-2 text-right font-bold text-green-700">
              {{ formatToCurrency(agent.summary) }}
            </td>
            <td v-for="week in pivotTable.weeks" :key="week" class="border p-2 text-right">
              <span v-if="agent.totals[week]">
                {{ formatToCurrency(agent.totals[week]) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <v-dialog v-model="dialog.open" max-width="600px">
      <v-card>
        <v-card-title class="text-lg font-bold">Notas de {{ dialog.ffName }}</v-card-title>
        <v-card-text>
          <ul class="list-disc list-inside text-sm">
            <li v-for="(note, index) in dialog.notes" :key="index">Folio: {{ note.folio ?? note.id }}</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog.open = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const selectedAgentIds = ref<number[]>([])

const filters = ref<any>({
  ff_ids: [],
  ff_group_id: '',
  startDate: '',
  endDate: '',
})

const dialog = reactive({
  open: false,
  ffName: '',
  notes: [] as any[],
})

const freights = ref<any>([])
const results = ref<any>([])
const searchText = ref('')
const agentSearch = ref('')

const hasResults = computed(() => {
  return results.value.length > 0
})

const groupedByAgent: any = computed(() => {
  const map: any = {}

  for (const item of results.value) {
    const ffId = item.freight_forwarder_id
    const ffName = item.freight_forwarder_name ?? 'Desconocido'
    const key = `${ffId}`

    if (!map[key]) {
      map[key] = {
        freight_forwarder_id: ffId,
        freight_forwarder_name: ffName,
        total_amount: 0,
        weeks: [],
      }
    }

    map[key].total_amount += item.total_amount
    map[key].weeks.push({
      week: item.week,
      year: item.year,
      total_amount: item.total_amount,
      notes: item.notes,
    })
  }

  return Object.values(map)
})

const groupedByWeek: any = computed(() => {
  const map: any = {}

  for (const item of results.value) {
    const ffName = item.freight_forwarder_name?.toLowerCase() ?? ''
    const matchesSearch = !searchText.value || ffName.includes(searchText.value.toLowerCase())

    if (!matchesSearch) continue // ignorar si no hace match con el filtro

    const key: any = `${item.year}-W${item.week}`
    if (!map[key]) {
      map[key] = {
        week: item.week,
        year: item.year,
        forwarders: [],
      }
    }
    map[key].forwarders.push(item)
  }

  // Ocultar semanas vacías
  return Object.values(map).filter((group: any) => group.forwarders.length > 0)
})

const pivotTable: any = computed(() => {
  const agentsMap = new Map<string, any>()
  const weeksSet = new Set<string>()

  for (const item of results.value) {
    const ffId = item.freight_forwarder_id
    const ffName = item.freight_forwarder_name
    const groupName = item.group_name ?? ''
    const weekKey = `${item.year}-W${item.week}`

    weeksSet.add(weekKey)

    if (!agentsMap.has(ffId)) {
      agentsMap.set(ffId, {
        freight_forwarder_id: ffId,
        freight_forwarder_name: ffName,
        group_name: groupName,
        totals: {},
        summary: 0,
      })
    }

    const agent = agentsMap.get(ffId)
    agent.totals[weekKey] = (agent.totals[weekKey] || 0) + item.total_amount
    agent.summary += item.total_amount
  }

  const weeks = Array.from(weeksSet).sort()
  const agents = Array.from(agentsMap.values())
    .filter(
      (agent) =>
        !agentSearch.value || agent.freight_forwarder_name.toLowerCase().includes(agentSearch.value.toLowerCase())
    )
    .sort((a, b) => {
      if (a.group_name < b.group_name) return -1
      if (a.group_name > b.group_name) return 1
      return a.freight_forwarder_name.localeCompare(b.freight_forwarder_name)
    })

  return {
    weeks,
    agents,
  }
})

const searchFFGroups = async (params: any) => {
  try {
    loadingStore.loading = true
    const response = await $api.freightForwardersGroups.searchByName(params)
    return response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const allSelected = computed(() =>
  pivotTable.value.agents.every((agent: any) => selectedAgentIds.value.includes(agent.freight_forwarder_id))
)
const someSelected = computed(() =>
  pivotTable.value.agents.some((agent: any) => selectedAgentIds.value.includes(agent.freight_forwarder_id))
)

function toggleSelectAll(value: boolean) {
  if (value) {
    selectedAgentIds.value = pivotTable.value.agents.map((a: any) => a.freight_forwarder_id)
  } else {
    selectedAgentIds.value = []
  }
}

const clearFilters = () => {
  filters.value.ff_ids = []
  filters.value.ff_group_id = ''
  filters.value.startDate = ''
  filters.value.endDate = ''
  results.value = []
  selectedAgentIds.value = []
}

const generateFfReport = async () => {
  try {
    // if (!filters.value.startDate || !filters.value.endDate) {
    //   snackbar.add({
    //     text: 'Please select a valid date range.',
    //     type: 'error',
    //   })
    //   return
    // }
    // if (new Date(filters.value.startDate) > new Date(filters.value.endDate)) {
    //   snackbar.add({
    //     text: 'Start date cannot be later than end date.',
    //     type: 'error',
    //   })
    //   return
    // }

    loadingStore.start()
    results.value = []
    const response = (await $api.ffNotes.generateFfReport({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })) as any

    results.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function showNotes(ff: any) {
  dialog.notes = ff.notes
  dialog.ffName = ff.freight_forwarder_name
  dialog.open = true
}

function showNotesForAgent(agent: any, week: any) {
  dialog.notes = week.notes
  dialog.ffName = `${agent.freight_forwarder_name} / Semana ${week.week}`
  dialog.open = true
}

const getWeeklyTotal = (group: any) => {
  const total = group.forwarders.reduce((sum: number, ff: any) => {
    return sum + ff.total_amount
  }, 0)
  return formatToCurrency(total)
}

const exportFfNoteReport = async () => {
  try {
    loadingStore.start()
    const selectedIds =
      selectedAgentIds.value.length > 0
        ? selectedAgentIds.value
        : pivotTable.value.agents.map((a: any) => a.freight_forwarder_id)

    const response = (await $api.ffNotes.exportXlsxReport({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
        ff_ids: selectedIds.join(','),
      },
    })) as any

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    // agrega timestamp to filename
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '')
    link.download = `reporte-ff-notes-weekly30-${timestamp}.xlsx`
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getFreightCatalogs = async () => {
  const response = await $api.freightForwarders.getAllFreightForwarders()
  freights.value = response as any
}

await getFreightCatalogs()
</script>
