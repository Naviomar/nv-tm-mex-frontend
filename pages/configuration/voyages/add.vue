<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="goBack">
      <v-icon start>mdi-arrow-left</v-icon>
      Back to voyages
    </v-btn>

    <div class="flex items-center gap-4 mb-4">
      <h1 class="text-xl font-bold">New voyage</h1>
      <div class="flex-1 max-w-md">
        <v-text-field
          v-model="legacySearch"
          density="compact"
          label="Search in legacy system (vessel or voyage)"
          prepend-inner-icon="mdi-database-search-outline"
          clearable
          hide-details
          variant="outlined"
          color="orange"
          @update:model-value="onLegacySearch"
        />
      </div>
    </div>

    <v-expand-transition>
      <v-card v-if="legacyResults.length > 0" class="mb-4" color="orange-lighten-5" variant="outlined">
        <v-card-title class="text-sm font-bold">
          <v-icon size="small" class="mr-1">mdi-database-clock-outline</v-icon>
          Legacy system results ({{ legacyResults.length }})
        </v-card-title>
        <v-card-text class="pa-0">
          <v-table density="compact" hover>
            <thead>
              <tr class="bg-orange-lighten-4">
                <th>Vessel</th>
                <th>Voyage</th>
                <th>Port</th>
                <th>ETA</th>
                <th>Type</th>
                <th>Line</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, idx) in legacyResults"
                :key="`legacy-${idx}`"
                class="cursor-pointer"
                @click="selectLegacyVoyage(item)"
              >
                <td class="font-bold">{{ item.barco }}</td>
                <td>{{ item.viaje }}</td>
                <td>{{ item.puerto }}</td>
                <td>{{ item.eta }}</td>
                <td>
                  <v-chip size="x-small" :color="item.id_srv === 'IM' ? 'blue' : 'green'">
                    {{ item.id_srv === 'IM' ? 'Import' : 'Export' }}
                  </v-chip>
                </td>
                <td>
                  <v-chip size="x-small" color="blue" variant="tonal">{{ item.linea?.substring(0, 3) || '' }}</v-chip>
                  <span class="text-xs text-grey ml-1">{{ item.linea }}</span>
                </td>
                <td>
                  <v-btn size="x-small" color="orange" variant="text" icon="mdi-arrow-right-bold" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <v-expand-transition>
      <v-alert
        v-if="legacyApplied"
        type="info"
        density="compact"
        closable
        class="mb-4"
        @click:close="legacyApplied = false"
      >
        <span class="font-bold">Legacy data applied:</span> {{ legacyApplied }}
      </v-alert>
    </v-expand-transition>

    <v-card>
      <v-card-title>
        <h2 class="text-xl font-bold">Add voyage for import or export and add at least one origin/destination.</h2>
      </v-card-title>
      <v-card-text>
        <VoyageForm ref="voyageFormRef" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const voyageFormRef = ref<any>(null)
const legacySearch = ref('')
const legacyResults = ref<any[]>([])
const legacyApplied = ref<string | false>(false)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const goBack = () => {
  router.back()
}

const onLegacySearch = (value: string | null) => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!value || value.length < 2) {
    legacyResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      const results = await $api.legacy.searchVoyages(value)
      legacyResults.value = results as any[]
    } catch (e) {
      console.error(e)
    }
  }, 400)
}

const selectLegacyVoyage = async (item: any) => {
  try {
    // Find matching vessel in new system using vessel name + line code
    const matchingVessel = await $api.legacy.findMatchingVessel(item.barco, item.linea || undefined) as any

    const formComponent = voyageFormRef.value

    if (!formComponent) return

    // Set voyage name
    if (item.viaje) {
      formComponent.setValues({ name: item.viaje })
    }

    // Set import/export
    if (item.id_srv) {
      const impoExpo = item.id_srv === 'IM' ? 'I' : 'E'
      formComponent.setValues({ impoExpo })
    }

    // Set vessel if found in new system
    if (matchingVessel?.id) {
      formComponent.setValues({ vessel_id: matchingVessel.id })
    }

    // Auto-add destination with port + ETA
    if (item.puerto && item.eta && item.eta !== '0000-00-00') {
      formComponent.addLegacyDestination(item.puerto, item.eta)
    }

    legacyApplied.value = `${item.barco} / ${item.viaje} — ${item.puerto} ETA: ${item.eta}`
    legacyResults.value = []
    legacySearch.value = ''

    snackbar.add({ type: 'success', text: `Legacy data applied for ${item.barco}` })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error applying legacy data' })
  }
}
</script>
