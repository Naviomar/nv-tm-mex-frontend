<template>
  <div class="pa-4 pa-md-8">
    <v-container fluid class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <v-row class="mb-6">
        <v-col cols="12" md="8" class="d-flex align-center">
          <v-avatar color="primary-lighten-5" size="56" class="mr-4 rounded-lg">
            <v-icon color="primary" icon="mdi-file-document-multiple-outline" size="32"></v-icon>
          </v-avatar>
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">Cotizaciones</h1>
            <p class="text-body-1 text-grey-darken-1">Gestiona y rastrea tus cotizaciones de transporte.</p>
          </div>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-md-end align-center mt-4 mt-md-0">
          <v-btn 
            color="primary" 
            prepend-icon="mdi-plus" 
            to="/quotes/create"
            size="large"
            elevation="2"
            class="rounded-pill text-none px-6 font-weight-medium"
          >
            Nueva Cotización
          </v-btn>
        </v-col>
      </v-row>

      <!-- Data Table Section -->
      <v-row>
        <v-col cols="12">
          <v-card class="rounded-xl border border-grey-lighten-3 elevation-0 overflow-hidden">
            <v-card-text class="pa-0">
              <v-data-table-server
                v-model:items-per-page="itemsPerPage"
                :headers="headers"
                :items="quotes"
                :items-length="totalItems"
                :loading="loading"
                @update:options="loadItems"
                class="elevation-0 bg-transparent"
                hover
              >
                <!-- Custom header styling -->
                <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
                  <tr>
                    <th v-for="column in columns" :key="column.key" class="text-subtitle-2 font-weight-bold py-3 table-header-bg">
                      {{ column.title }}
                    </th>
                  </tr>
                </template>

                <!-- Status Chip -->
                <template v-slot:item.status="{ item }">
                  <v-chip 
                    :color="getStatusColor(item.status)" 
                    size="small" 
                    variant="tonal"
                    class="font-weight-medium text-capitalize"
                  >
                    {{ formatStatus(item.status) }}
                  </v-chip>
                </template>

                <!-- Type & Modality Icons -->
                <template v-slot:item.impoExpo="{ item }">
                  <div class="d-flex align-center">
                    <v-icon 
                      :icon="item.impoExpo === 'I' ? 'mdi-tray-arrow-down' : 'mdi-tray-arrow-up'" 
                      :color="item.impoExpo === 'I' ? 'blue' : 'green'"
                      size="small"
                      class="mr-2"
                    ></v-icon>
                    <span>{{ item.impoExpo === 'I' ? 'Importación' : 'Exportación' }}</span>
                  </div>
                </template>
                
                <template v-slot:item.modality="{ item }">
                  <div class="d-flex align-center">
                    <v-icon 
                      :icon="item.modality === 'M' ? 'mdi-ferry' : 'mdi-airplane'" 
                      :color="item.modality === 'M' ? 'cyan-darken-2' : 'purple-lighten-1'"
                      size="small"
                      class="mr-2"
                    ></v-icon>
                    <span>{{ item.modality === 'M' ? 'Marítimo' : 'Aéreo' }}</span>
                  </div>
                </template>

                <template v-slot:item.containers="{ item }">
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip 
                      v-for="cont in item.containers" 
                      :key="cont.id"
                      size="x-small" 
                      variant="outlined" 
                      color="grey-darken-1"
                      class="px-1"
                    >
                      {{ cont.quantity }}x {{ cont.type?.name || 'Unit' }}
                    </v-chip>
                    <span v-if="!item.containers?.length" class="text-caption text-grey italic">No containers</span>
                  </div>
                </template>

                <!-- Cost Formatting -->
                <template v-slot:item.total_cost="{ item }">
                  <span class="font-weight-medium" :class="item.total_cost ? 'text-success' : 'text-grey'">
                    {{ item.total_cost ? `$${parseFloat(item.total_cost).toLocaleString('en-US', {minimumFractionDigits: 2})}` : 'Pending' }}
                  </span>
                </template>

                <!-- Actions -->
                <template v-slot:item.actions="{ item }">
                  <div class="d-flex justify-end gap-1">
                    <v-btn
                      icon="mdi-pencil-outline"
                      variant="text"
                      color="blue-lighten-2"
                      size="small"
                      density="comfortable"
                      title="Edit Quotation"
                      :to="`/quotes/${item.id}`"
                    ></v-btn>
                    <v-btn
                      icon="mdi-eye-outline"
                      variant="text"
                      color="green-lighten-2"
                      size="small"
                      density="comfortable"
                      title="View Details"
                      :to="`/quotes/view-${item.id}`"
                    ></v-btn>
                  </div>
                </template>
              </v-data-table-server>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const itemsPerPage = ref(15)
const headers = [
  { title: 'Folio #', key: 'quote_number', align: 'start', sortable: false },
  { title: 'Booking / Ref', key: 'booking_number', sortable: false },
  { title: 'Tráfico', key: 'impoExpo', sortable: false },
  { title: 'Modalidad', key: 'modality', sortable: false },
  { title: 'Carga', key: 'containers', sortable: false },
  { title: 'Costo Total', key: 'total_cost', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

const quotes = ref([])
const totalItems = ref(0)
const loading = ref(true)
const { $api } = useNuxtApp()

async function loadItems({ page, itemsPerPage, sortBy }: any) {
  loading.value = true
  try {
    const data: any = await $api.quotes.getQuotes({
      params: {
        page,
        per_page: itemsPerPage,
      }
    })
    
    quotes.value = data?.data || []
    totalItems.value = data?.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function getStatusColor(status: string) {
  switch(status) {
    case 'pending': return 'warning'
    case 'auth_requested': return 'info'
    case 'approved': return 'success'
    case 'rejected': return 'error'
    case 'converted': return 'deep-purple'
    default: return 'grey'
  }
}

function formatStatus(status: string) {
  switch(status) {
    case 'pending': return 'Pendiente'
    case 'auth_requested': return 'Aut. Solicitada'
    case 'approved': return 'Aprobada'
    case 'rejected': return 'Rechazada'
    case 'completed': return 'Completada'
    case 'converted': return 'Convertida'
    default: return status || 'Desconocido'
  }
}
</script>
