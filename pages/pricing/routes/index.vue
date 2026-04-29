<template>
  <div class="pa-4 pa-md-8 min-vh-100 bg-main overflow-x-hidden">
    <v-container fluid class="max-w-7xl mx-auto">
      <v-row class="mb-6">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-btn icon="mdi-arrow-left" variant="tonal" color="primary" to="/pricing" class="mr-4 rounded-xl"></v-btn>
            <div>
              <div class="text-caption text-uppercase text-primary font-weight-bold mb-1">Depto. Comercial</div>
              <h1 class="text-h4 font-weight-bold text-main-header mb-0">Tarifas de Ruta</h1>
            </div>
          </div>
          <v-btn color="primary" variant="flat" class="rounded-xl px-8 font-weight-bold shadow-md" prepend-icon="mdi-plus" @click="openDialog()">
            Nueva Ruta
          </v-btn>
        </v-col>
      </v-row>

      <v-card class="rounded-xl border border-grey-lighten-3 elevation-0">
        <v-card-text class="pa-0">
          <v-table>
            <thead>
              <tr class="table-header-bg">
                <th class="text-left font-weight-bold py-4">Orígenes / Destinos</th>
                <th class="text-left font-weight-bold">Línea / Naviera</th>
                <th class="text-left font-weight-bold">Resumen de Costos</th>
                <th class="text-left font-weight-bold">Validez</th>
                <th class="text-right font-weight-bold rounded-e-lg pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="route in routes" :key="route.id" class="hover-row">
                <td class="py-4">
                  <div class="d-flex flex-column">
                    <div class="d-flex align-center mb-1">
                      <v-chip size="x-small" color="blue" variant="flat" class="mr-2 px-1 font-weight-bold">POL</v-chip>
                      <span class="font-weight-bold">{{ route.pol?.name }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-chip size="x-small" color="teal" variant="flat" class="mr-2 px-1 font-weight-bold">POD</v-chip>
                      <span class="font-weight-bold">{{ route.pod?.name }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center">
                    <v-avatar size="32" color="grey-lighten-4" class="mr-2 border">
                      <v-icon icon="mdi-ferry" color="grey-darken-1" size="small"></v-icon>
                    </v-avatar>
                    <span class="text-body-2 font-weight-medium">{{ route.line?.name || 'Any Line' }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column gap-1">
                    <div v-for="cost in route.costs.slice(0, 2)" :key="cost.id" class="text-caption d-flex align-center">
                      <v-icon icon="mdi-circle-small" color="primary"></v-icon>
                      <span class="text-grey-darken-3 font-weight-bold">${{ cost.amount }}</span>
                      <span class="text-grey ml-1">{{ cost.charge?.name }}</span>
                    </div>
                    <div v-if="route.costs.length > 2" class="text-caption text-primary font-weight-bold ml-4">
                      +{{ route.costs.length - 2 }} more...
                    </div>
                  </div>
                </td>
                <td>
                  <div class="text-caption font-weight-bold text-grey-darken-1 mb-1">
                    {{ formatDate(route.valid_from) }} - {{ formatDate(route.valid_until) }}
                  </div>
                  <div class="text-tiny text-grey-lighten-1 d-flex align-center">
                    <v-icon icon="mdi-account-plus-outline" size="10" class="mr-1"></v-icon>
                    By: {{ route.creator?.name || 'System' }}
                  </div>
                </td>
                <td class="text-right pr-4">
                  <v-btn icon="mdi-pencil-outline" variant="text" color="info" @click="openDialog(route)"></v-btn>
                  <v-btn icon="mdi-delete-outline" variant="text" color="error" @click="confirmDelete(route)"></v-btn>
                </td>
              </tr>
              <tr v-if="routes.length === 0 && !loading">
                <td colspan="5" class="text-center py-12">
                  <v-icon icon="mdi-database-off-outline" size="64" color="grey-darken-1" class="mb-4 opacity-50"></v-icon>
                  <div class="text-h6 text-grey-darken-1 font-weight-bold">No routes configured yet</div>
                  <v-btn color="primary" variant="text" class="mt-2" @click="openDialog()">Create your first route</v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Dialog for Create/Edit Route -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="bg-primary text-white pa-6 d-flex justify-space-between align-center">
          <span class="text-h5 font-weight-bold">{{ editedRoute.id ? 'Editar Tarifa de Ruta' : 'Nueva Tarifa de Ruta' }}</span>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6 bg-surface">
          <v-row>
            <v-col cols="12" md="6">
              <label class="text-caption font-weight-bold mb-2 d-block">Origen (POL)</label>
              <APortSearch v-model="editedRoute.pol_id" />
            </v-col>
            <v-col cols="12" md="6">
              <label class="text-caption font-weight-bold mb-2 d-block">Destino (POD)</label>
              <APortSearch v-model="editedRoute.pod_id" />
            </v-col>
            <v-col cols="12" md="6">
              <label class="text-caption font-weight-bold mb-2 d-block">Línea Naviera / Carrier</label>
              <ALineSearch v-model="editedRoute.line_id" />
            </v-col>
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="6">
                  <label class="text-caption font-weight-bold mb-2 d-block">Válido Desde</label>
                  <v-text-field v-model="editedRoute.valid_from" type="date" variant="outlined" density="comfortable"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <label class="text-caption font-weight-bold mb-2 d-block">Válido Hasta</label>
                  <v-text-field v-model="editedRoute.valid_until" type="date" variant="outlined" density="comfortable"></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h6 font-weight-bold">Costos y Cargos</h3>
            <v-btn color="teal" variant="tonal" prepend-icon="mdi-plus" size="small" class="rounded-lg" @click="addCost()">Añadir Costo</v-btn>
          </div>

          <v-row v-for="(cost, index) in editedRoute.costs" :key="index" class="bg-surface rounded-lg pa-4 border mb-3 mx-0 align-center">
            <v-col cols="12" md="4" class="py-1">
              <AChargeSearch v-model="cost.charge_id" label="Concept" />
            </v-col>
            <v-col cols="12" md="3" class="py-1">
              <v-text-field v-model="cost.amount" label="Amount" type="number" prefix="$" variant="outlined" density="comfortable" hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="4" class="py-1">
              <v-select 
                v-model="cost.type" 
                :items="[{title:'Por BL', value:'BL'}, {title:'Por Contenedor', value:'CONTAINER'}]" 
                label="Tipo" 
                variant="outlined" 
                density="comfortable" 
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="1" class="d-flex justify-center py-1">
              <v-btn icon="mdi-trash-can-outline" variant="text" color="error" @click="removeCost(index)"></v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 bg-surface border-top">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="grey" class="px-6 rounded-lg font-weight-bold" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" class="px-8 rounded-lg font-weight-bold shadow-sm" :loading="saving" @click="saveRoute">
            {{ editedRoute.id ? 'Save Changes' : 'Create Route' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const routes = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)

const editedRoute = ref({
  id: null,
  pol_id: null,
  pod_id: null,
  line_id: null,
  valid_from: '',
  valid_until: '',
  costs: []
})

async function fetchRoutes() {
  loading.value = true
  try {
    const data: any = await $api.quoteRoutes.getRoutes()
    routes.value = data.data
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Failed to load routes' })
  } finally {
    loading.value = false
  }
}

function openDialog(route = null) {
  if (route) {
    editedRoute.value = JSON.parse(JSON.stringify(route))
  } else {
    editedRoute.value = {
      id: null,
      pol_id: null,
      pod_id: null,
      line_id: null,
      valid_from: new Date().toISOString().substr(0, 10),
      valid_until: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().substr(0, 10),
      costs: []
    }
    addCost()
  }
  dialog.value = true
}

function addCost() {
  editedRoute.value.costs.push({
    charge_id: null,
    amount: 0,
    type: 'BL',
    currency_id: 1 // USD default
  })
}

function removeCost(index: number) {
  editedRoute.value.costs.splice(index, 1)
}

async function saveRoute() {
  saving.value = true
  try {
    if (editedRoute.value.id) {
      await $api.quoteRoutes.updateRoute(editedRoute.value.id, editedRoute.value)
      snackbar.add({ type: 'success', text: 'Route updated successfully' })
    } else {
      await $api.quoteRoutes.createRoute(editedRoute.value)
      snackbar.add({ type: 'success', text: 'Route created successfully' })
    }
    dialog.value = false
    await fetchRoutes()
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Failed to save route' })
  } finally {
    saving.value = false
  }
}

async function confirmDelete(route: any) {
  if (confirm(`Are you sure you want to delete the route ${route.pol?.name} -> ${route.pod?.name}?`)) {
    try {
      await $api.quoteRoutes.deleteRoute(route.id)
      snackbar.add({ type: 'success', text: 'Route deleted' })
      await fetchRoutes()
    } catch (e) {
      snackbar.add({ type: 'error', text: 'Failed to delete route' })
    }
  }
}

function formatDate(date: string) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  fetchRoutes()
  
  // Auto-open create dialog if coming from dashboard with ?create=true
  const route = useRoute()
  if (route.query.create === 'true') {
    openDialog()
  }
})
</script>

<style scoped>
.hover-row {
  transition: all 0.2s ease;
}
.hover-row:hover {
  background-color: #f1f5f9;
}
.gap-1 {
  gap: 4px;
}
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
}
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
