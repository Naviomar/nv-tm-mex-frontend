<template>
  <div class="pa-4 pa-md-8 min-vh-100 bg-main">
    <v-container fluid class="max-w-7xl mx-auto">
      <v-row class="mb-6">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <div>
            <div class="text-caption text-uppercase text-primary font-weight-bold mb-1">Depto. Comercial</div>
            <h1 class="text-h4 font-weight-bold text-main-header mb-0">Tarifario y Cotizaciones</h1>
          </div>
          <v-btn color="primary" variant="flat" class="rounded-xl px-8 font-weight-bold shadow-md" prepend-icon="mdi-plus" to="/pricing/routes?create=true">
            Nueva Ruta / Tarifa
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="4">
          <v-card class="rounded-xl border elevation-0 overflow-hidden mb-6 hover-card shadow-sm" to="/quotes">
            <div class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar color="blue-lighten-5" size="48" class="mr-4">
                  <v-icon icon="mdi-file-document-outline" color="blue-darken-2"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text-main-header">Cotizaciones</div>
                  <div class="text-caption text-grey font-weight-bold">Gestiona y rastrea las cotizaciones</div>
                </div>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-h4 font-weight-bold text-main-header">{{ stats.quotes }}</span>
                <v-icon icon="mdi-arrow-right" color="primary"></v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="rounded-xl border elevation-0 overflow-hidden mb-6 hover-card shadow-sm" to="/pricing/routes">
            <div class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar color="teal-lighten-5" size="48" class="mr-4">
                  <v-icon icon="mdi-routes" color="teal-darken-2"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text-main-header">Tarifas de Ruta</div>
                  <div class="text-caption text-grey font-weight-bold">Rutas y costos pre-configurados</div>
                </div>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-h4 font-weight-bold text-main-header">{{ stats.routes }}</span>
                <v-icon icon="mdi-arrow-right" color="primary"></v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="rounded-xl border elevation-0 overflow-hidden mb-6 hover-card shadow-sm">
            <div class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar color="orange-lighten-5" size="48" class="mr-4">
                  <v-icon icon="mdi-chart-bell-curve-cumulative" color="orange-darken-2"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold text-main-header">Analíticas</div>
                  <div class="text-caption text-grey font-weight-bold">Tasas de conversión y márgenes</div>
                </div>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-h4 font-weight-bold text-main-header">84%</span>
                <v-icon icon="mdi-trending-up" color="success"></v-icon>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card class="rounded-xl border border-grey-lighten-3 elevation-0">
            <v-card-title class="pa-6 font-weight-bold text-h6 text-main-header">
              Cotizaciones Recientes
            </v-card-title>
            <v-table class="px-4 pb-4">
              <thead>
                <tr class="table-header-bg">
                  <th class="text-left font-weight-bold py-4">Folio</th>
                  <th class="text-left font-weight-bold">Cliente</th>
                  <th class="text-left font-weight-bold">Ruta</th>
                  <th class="text-left font-weight-bold">Monto</th>
                  <th class="text-left font-weight-bold">Estado</th>
                  <th class="text-right font-weight-bold rounded-e-lg">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="quote in recentQuotes" :key="quote.id" class="hover-row">
                  <td class="font-weight-bold text-primary">{{ quote.quote_number }}</td>
                  <td>{{ quote.customer?.name || 'New Customer' }}</td>
                  <td>
                    <div class="d-flex align-center">
                      <span class="text-caption font-weight-bold">{{ quote.pol?.code || 'POL' }}</span>
                      <v-icon icon="mdi-arrow-right-thin" size="small" class="mx-1"></v-icon>
                      <span class="text-caption font-weight-bold">{{ quote.pod?.code || 'POD' }}</span>
                    </div>
                  </td>
                  <td class="font-weight-bold">${{ parseFloat(quote.total_cost || 0).toLocaleString() }}</td>
                  <td>
                    <v-chip :color="getStatusColor(quote.status)" size="small" variant="flat" class="font-weight-bold">
                      {{ quote.status.toUpperCase() }}
                    </v-chip>
                  </td>
                  <td class="text-right">
                    <v-btn icon="mdi-pencil-outline" variant="text" color="primary" class="mr-2" :to="`/quotes/${quote.id}`"></v-btn>
                    <v-btn icon="mdi-eye-outline" variant="text" color="grey" :to="`/quotes/view-${quote.id}`"></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { $api } = useNuxtApp()
const stats = ref({
  quotes: 0,
  routes: 0
})
const recentQuotes = ref([])

async function fetchData() {
  try {
    const quotesData: any = await $api.quotes.getQuotes({ query: { per_page: 5 } })
    recentQuotes.value = quotesData.data
    stats.value.quotes = quotesData.total

    const routesData: any = await $api.quoteRoutes.getRoutes()
    stats.value.routes = routesData.total || 0
  } catch (e) {
    console.error(e)
  }
}

function getStatusColor(status: string) {
  switch(status) {
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'completed': return 'teal'
    case 'converted': return 'primary'
    default: return 'grey'
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.hover-card {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border: 1px solid rgba(0,0,0,0.05) !important;
}
.hover-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 30px -10px rgba(0,0,0,0.15) !important;
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}
.hover-row {
  transition: background-color 0.2s ease;
}
.hover-row:hover {
  background-color: #f1f5f9;
}
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
</style>
