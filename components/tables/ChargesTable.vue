<template>
  <div>
    <!-- Filters Card -->
    <v-card class="mb-6" elevation="1" rounded="lg">
      <v-card-title class="bg-gradient-to-r from-primary to-primary-darken-1 text-white py-3">
        <v-icon class="mr-2">mdi-filter-outline</v-icon>
        <span class="text-subtitle-1 font-weight-medium">Search Filters</span>
      </v-card-title>
      <v-card-text class="pa-5">
        <v-form @keyup.enter="onClickFilters">
          <div class="filters-grid">
            <div class="filter-item filter-service">
              <v-autocomplete
                v-model="filters.serviceTypes"
                variant="outlined"
                density="comfortable"
                label="Service type"
                :items="serviceTypes"
                item-title="name"
                item-value="id"
                multiple
                chips
                closable-chips
                prepend-inner-icon="mdi-cube-outline"
                clearable
                hide-details
              />
            </div>
            <div class="filter-item filter-search">
              <v-text-field
                v-model="filters.name"
                variant="outlined"
                density="comfortable"
                label="Search by name or code"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
              />
            </div>
            <div class="filter-item filter-status">
              <v-autocomplete
                density="comfortable"
                variant="outlined"
                label="Status"
                v-model="filters.deleted_status"
                :items="deletedStatus"
                item-title="name"
                item-value="value"
                prepend-inner-icon="mdi-filter-variant"
                clearable
                hide-details
              />
            </div>
            <div class="filter-item filter-actions">
              <div class="actions-wrapper">
                <v-btn
                  color="grey-darken-1"
                  variant="outlined"
                  @click="clearFilters"
                  class="action-btn"
                >
                  <v-icon start size="small">mdi-close</v-icon>
                  Clear
                </v-btn>
                <v-btn color="primary" @click="onClickFilters" class="action-btn">
                  <v-icon start size="small">mdi-magnify</v-icon>
                  Search
                </v-btn>
              </div>
            </div>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Results Card -->
    <v-card elevation="1" rounded="lg">
      <v-card-text class="pa-0">
        <div v-if="isAdmin" class="px-5 pt-4 pb-3">
          <v-btn size="small" variant="tonal" color="primary" @click="seedCharges">
            <v-icon start size="small">mdi-database-sync</v-icon>
            Seed charges
          </v-btn>
        </div>
        <v-divider v-if="isAdmin" />
        <div class="overflow-x-auto">
          <v-table class="charges-table">
            <thead>
              <tr class="bg-blue-grey-lighten-5">
                <th class="text-left font-weight-bold text-blue-grey-darken-3 py-4" width="110">
                  <v-icon size="small" class="mr-1">mdi-cog</v-icon>
                  Actions
                </th>
                <th class="text-left font-weight-bold text-blue-grey-darken-3 py-4">
                  <v-icon size="small" class="mr-1">mdi-tag</v-icon>
                  Charge Name
                </th>
                <th class="text-left font-weight-bold text-blue-grey-darken-3 py-4" width="100">
                  <v-icon size="small" class="mr-1">mdi-barcode</v-icon>
                  Code
                </th>
                <th class="text-left font-weight-bold text-blue-grey-darken-3 py-4" width="140">
                  <v-icon size="small" class="mr-1">mdi-domain</v-icon>
                  Entity
                </th>
                <th class="text-left font-weight-bold text-blue-grey-darken-3 py-4" width="200">
                  <v-icon size="small" class="mr-1">mdi-apps</v-icon>
                  Services
                </th>
                <th class="text-left font-weight-bold text-blue-grey-darken-3 py-4" width="130">
                  <v-icon size="small" class="mr-1">mdi-tune</v-icon>
                  Deletable
                </th>
                <th class="text-left font-weight-bold text-blue-grey-darken-3 py-4" width="160">
                  <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(charge, index) in charges.data"
                :key="`charge-${charge.id}`"
                :class="[
                  'table-row-hover',
                  { 'table-row-deleted': charge.deleted_at }
                ]"
              >
                <td class="py-3 px-4">
                  <div class="flex gap-1">
                    <v-tooltip text="View details" location="top">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-eye"
                          size="x-small"
                          variant="tonal"
                          color="info"
                          @click="viewCharge(charge)"
                        />
                      </template>
                    </v-tooltip>
                    <v-tooltip text="Edit charge" location="top">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-pencil"
                          size="x-small"
                          variant="tonal"
                          color="primary"
                          @click="editCharge(charge)"
                        />
                      </template>
                    </v-tooltip>
                    <v-tooltip :text="charge.deleted_at ? 'Restore' : 'Delete'" location="top">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          :icon="charge.deleted_at ? 'mdi-restore' : 'mdi-delete'"
                          size="x-small"
                          variant="tonal"
                          :color="charge.deleted_at ? 'success' : 'error'"
                          @click="showConfirmDelete(charge)"
                        />
                      </template>
                    </v-tooltip>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="d-flex flex-column">
                    <span class="font-weight-bold text-body-2 text-grey-darken-3">
                      {{ charge.name }}
                    </span>
                    <v-chip
                      v-if="charge.is_in_use"
                      color="success"
                      variant="flat"
                      size="x-small"
                      density="compact"
                      class="in-use-chip font-weight-medium w-fit ml-2"
                    >
                      <v-icon start size="12">mdi-check-circle</v-icon>
                      In Use
                    </v-chip>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <code v-if="charge.code" class="charge-code">
                    {{ charge.code }}
                  </code>
                  <span v-else class="text-grey-lighten-1 text-caption">—</span>
                </td>
                <td class="py-3 px-4">
                  <div class="text-body-2 text-grey-darken-2">
                    {{ charge.charge_entity?.name || '—' }}
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div v-if="charge.services?.length" class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="service in getUniqueServices(charge.services)"
                      :key="`service-${service.id}`"
                      :color="getServiceColor(service.name)"
                      variant="flat"
                      size="x-small"
                      density="compact"
                      class="service-chip font-weight-medium"
                    >
                      <span class="service-name">{{ service.name }}</span>
                      <v-tooltip v-if="service.pivot?.is_import" text="Import" location="top">
                        <template v-slot:activator="{ props }">
                          <v-icon v-bind="props" end size="12" class="service-icon">mdi-import</v-icon>
                        </template>
                      </v-tooltip>
                      <v-tooltip v-if="service.pivot?.is_export" text="Export" location="top">
                        <template v-slot:activator="{ props }">
                          <v-icon v-bind="props" end size="12" class="service-icon">mdi-export</v-icon>
                        </template>
                      </v-tooltip>
                      <v-tooltip v-if="service.pivot?.is_local" text="Local" location="top">
                        <template v-slot:activator="{ props }">
                          <v-icon v-bind="props" end size="12" class="service-icon">mdi-home</v-icon>
                        </template>
                      </v-tooltip>
                    </v-chip>
                  </div>
                  <span v-else class="text-grey-lighten-1 text-caption">—</span>
                </td>
                <td class="py-3 px-4">
                  <div class="d-flex flex-column gap-1">
                    <v-chip
                      :color="charge.can_be_deleted ? 'success' : 'orange-darken-1'"
                      size="x-small"
                      variant="flat"
                      density="compact"
                      class="option-chip w-fit px-4"
                    >
                      <v-icon start size="12">
                        {{ charge.can_be_deleted ? 'mdi-check' : 'mdi-lock' }}
                      </v-icon>
                      {{ charge.can_be_deleted ? 'Yes' : 'No' }}
                    </v-chip>
                    <v-chip
                      v-if="charge.is_for_free_format_cfdi"
                      color="indigo"
                      size="x-small"
                      variant="flat"
                      density="compact"
                      class="option-chip"
                    >
                      <v-icon start size="12">mdi-file-document</v-icon>
                      CFDI
                    </v-chip>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="d-flex flex-column">
                    <span class="text-caption text-grey-darken-1">
                      {{ formatDateString(charge.created_at) }}
                    </span>
                    <span v-if="charge.creator" class="text-caption text-grey">
                      by {{ charge.creator.name }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
        <v-divider />
        <div class="pa-4 d-flex align-center justify-space-between">
          <div class="text-caption text-grey-darken-1">
            Showing {{ charges.data?.length || 0 }} of {{ charges.total || 0 }} charges
          </div>
          <v-pagination
            v-model="charges.current_page"
            :length="charges.last_page"
            :total-visible="7"
            rounded="circle"
            density="comfortable"
            @update:model-value="onClickPagination"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { serviceTypes, deletedStatus } from '@/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const user = useSanctumUser<any>()

const filters = ref({
  name: '',
  serviceTypes: null,
  deleted_status: '',
})

const charges = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const isAdmin = user.value?.id === 1

const getServiceColor = (serviceName: string) => {
  if (!serviceName || typeof serviceName !== 'string') return 'grey'
  const colors: Record<string, string> = {
    sea: 'blue',
    air: 'cyan',
    free_format: 'purple',
    warehouse: 'orange',
  }
  return colors[serviceName.toLowerCase()] || 'grey'
}

const getUniqueServices = (services: any[]) => {
  if (!services || !Array.isArray(services)) return []
  const uniqueServices = services.filter((service, index, self) =>
    service && service.id && index === self.findIndex((s) => s && s.id === service.id)
  )
  return uniqueServices
}

const onClickPagination = async (page: number) => {
  charges.value.current_page = page
  await getCharges()
}

const viewCharge = (charge: any) => {
  router.push(`/configuration/charges/view-${charge.id}`)
}

const editCharge = (charge: any) => {
  router.push(`/configuration/charges/edit-${charge.id}`)
}

const showConfirmDelete = async (charge: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this charge.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      const response = await $api.charges.delete(charge.id)
      snackbar.add({ type: 'success', text: 'Charge deleted successfully' })
      await getCharges()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const onClickFilters = async () => {
  charges.value.current_page = 1
  await getCharges()
}

const getCharges = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.charges.getCharges({
      query: {
        page: charges.value.current_page,
        perPage: charges.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    charges.value = response as any
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

const clearFilters = async () => {
  filters.value = {
    name: '',
    serviceTypes: null,
    deleted_status: '',
  }
  await getCharges()
}

const seedCharges = async () => {
  try {
    loadingStore.start()
    const response = await $api.charges.seedCharges()
    snackbar.add({ type: 'success', text: 'Charges seeded successfully' })
    await getCharges()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getCharges()
})
</script>

<style scoped>
.charges-table {
  border-collapse: separate;
  border-spacing: 0;
}

.charges-table thead tr th {
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

.table-row-hover {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.table-row-hover:hover {
  background-color: rgba(25, 118, 210, 0.04) !important;
  transform: scale(1.001);
}

.table-row-deleted {
  background-color: rgba(244, 67, 54, 0.08) !important;
}

.table-row-deleted:hover {
  background-color: rgba(244, 67, 54, 0.12) !important;
}

.charge-code {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

/* Dark mode styles */
.v-theme--dark .charges-table thead tr th {
  border-bottom-color: rgba(255, 255, 255, 0.12);
}

.v-theme--dark .table-row-hover {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.v-theme--dark .table-row-hover:hover {
  background-color: rgba(25, 118, 210, 0.15) !important;
}

.v-theme--dark .table-row-deleted {
  background-color: rgba(244, 67, 54, 0.2) !important;
}

.v-theme--dark .table-row-deleted:hover {
  background-color: rgba(244, 67, 54, 0.3) !important;
}

/* Responsive grid */
@media (max-width: 1024px) {
  .grid-cols-12 {
    grid-template-columns: repeat(1, 1fr) !important;
  }
  
  .col-span-3,
  .col-span-5,
  .col-span-2 {
    grid-column: span 1 !important;
  }
  
  .flex.gap-2 {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .pa-5 {
    padding: 1rem !important;
  }
  
  .gap-4 {
    gap: 1rem !important;
  }
}

/* Chips styling */
.service-chip {
  min-height: 24px !important;
}

.service-name {
  color: white !important;
  font-size: 0.75rem !important;
}

.service-icon {
  color: white !important;
}

.option-chip {
  min-height: 24px !important;
}

.in-use-chip {
  min-height: 24px !important;
}

/* Filters responsive grid */
.filters-grid {
  display: grid;
  grid-template-columns: 2fr 3fr 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

.filter-item {
  width: 100%;
}

.filter-actions .actions-wrapper {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.action-btn {
  width: 100%;
  height: 40px !important;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .filter-service,
  .filter-search {
    grid-column: span 1;
  }
  
  .filter-status,
  .filter-actions {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .filter-item {
    grid-column: span 1;
  }
  
  .filter-actions .actions-wrapper {
    flex-direction: row;
  }
  
  .pa-5 {
    padding: 1rem !important;
  }
}

@media (max-width: 480px) {
  .charges-table {
    font-size: 0.875rem;
  }
  
  .charges-table th,
  .charges-table td {
    padding: 8px !important;
  }
  
  .service-chip,
  .option-chip,
  .in-use-chip {
    font-size: 0.7rem !important;
    min-height: 20px !important;
  }
  
  .service-name {
    font-size: 0.65rem !important;
  }
  
  .service-icon,
  .v-icon {
    font-size: 10px !important;
  }
  
  .action-btn {
    height: 36px !important;
    font-size: 0.875rem !important;
  }
}
</style>
