<template>
  <div class="reports-container">
    <v-card class="elevation-2" rounded="lg">

      <!-- Horizontal Tabs -->
      <v-tabs
        v-model="tab"
        bg-color="grey-lighten-4"
        color="primary"
        align-tabs="start"
        show-arrows
        class="modern-tabs"
      >
        <v-tab
          v-for="item in currentMenuItems"
          :key="item.value"
          :value="item.value"
          class="tab-item"
        >
          <v-icon :color="item.color" size="20" start>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <!-- Content Area -->
      <v-card-text class="pa-6">
        <v-tabs-window v-model="tab" class="tabs-content">
          <!-- Default empty state -->
          <v-tabs-window-item value="">
            <div class="empty-state">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-chart-box-outline</v-icon>
              <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">No Report Selected</h3>
              <p class="text-body-1 text-grey-darken-1 mb-4 text-center" style="max-width: 400px;">
                Select a report from the tabs above to view the data and analytics
              </p>
              <v-btn
                color="primary"
                variant="tonal"
                @click="tab = viewMode === 'charts' ? 'charts-tab' : 'sea-tab'"
              >
                <v-icon start>mdi-arrow-right</v-icon>
                View First {{ viewMode === 'charts' ? 'Chart' : 'Report' }}
              </v-btn>
            </div>
          </v-tabs-window-item>
          
          <!-- Charts Content -->
          <v-tabs-window-item v-if="viewMode === 'charts'" value="charts-tab">
            <ComparativeChart />
          </v-tabs-window-item>
          
          <!-- Reports Content -->
          <v-tabs-window-item v-if="viewMode === 'reports'" value="sea-tab">
            <CobranzaReport />
          </v-tabs-window-item>
          
          <v-tabs-window-item v-if="viewMode === 'reports'" value="air-tab">
            <CustomerInvoicesReport />
          </v-tabs-window-item>
          
          <v-tabs-window-item v-if="viewMode === 'reports'" value="billing-tab">
            <PaymentsHistoryReport />
          </v-tabs-window-item>
          
          <v-tabs-window-item v-if="viewMode === 'reports'" value="suppliers-tab">
            <MovementPaymentsReport />
          </v-tabs-window-item>
          
          <v-tabs-window-item v-if="viewMode === 'reports'" value="freight-line-tab">
            <ChargesPendingInvoiceReport />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
interface Props {
  viewMode: 'charts' | 'reports'
}

const props = defineProps<Props>()

// Initialize tab based on initial viewMode
const tab = ref<any>(props.viewMode === 'charts' ? 'charts-tab' : 'sea-tab')

// Charts items - para cuando viewMode === 'charts'
const chartsItems = [
  {
    title: 'Comparative Charts',
    value: 'charts-tab',
    icon: 'mdi-chart-line',
    color: 'primary'
  }
]

// Reports items - para cuando viewMode === 'reports'
const reportsItems = [
  {
    title: 'Cobranza',
    value: 'sea-tab',
    icon: 'mdi-finance',
    color: 'cyan'
  },
  {
    title: 'Invoices',
    value: 'air-tab',
    icon: 'mdi-receipt-text',
    color: 'blue'
  },
  {
    title: 'Payments History',
    value: 'billing-tab',
    icon: 'mdi-cash-multiple',
    color: 'green'
  },
  {
    title: 'Movement Payments',
    value: 'suppliers-tab',
    icon: 'mdi-transfer',
    color: 'orange'
  },
  {
    title: 'Pending Invoice',
    value: 'freight-line-tab',
    icon: 'mdi-receipt-clock-outline',
    color: 'amber'
  }
]

const currentMenuItems = computed(() => {
  return props.viewMode === 'charts' ? chartsItems : reportsItems
})

// Auto-switch to first tab when view mode changes
watch(() => props.viewMode, (newMode, oldMode) => {
  // Only switch if mode actually changed or tab is empty
  if (newMode !== oldMode || !tab.value) {
    nextTick(() => {
      if (newMode === 'charts') {
        tab.value = 'charts-tab'
      } else {
        tab.value = 'sea-tab'
      }
    })
  }
}, { immediate: true })
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
}

.theme--dark .empty-state {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 0.5) 0%, rgba(var(--v-theme-surface), 0.3) 100%);
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.reports-container {
  width: 100%;
  padding: 16px;
}

.tabs-content {
  min-height: 600px;
}

.modern-tabs {
  border-bottom: 2px solid #e0e0e0;
}

.theme--dark .modern-tabs {
  border-bottom: 2px solid rgba(255, 255, 255, 0.12);
}

.tab-item {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.25px;
  padding: 0 24px;
  min-height: 52px;
  transition: all 0.3s ease;
}

.tab-item:hover {
  background: rgba(var(--v-theme-primary), 0.04);
}

:deep(.v-tab--selected) {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

:deep(.v-tab__slider) {
  height: 3px;
  border-radius: 3px 3px 0 0;
}

:deep(.v-btn-toggle) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.theme--dark :deep(.v-btn-toggle) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

:deep(.v-btn-toggle .v-btn--active) {
  background: white !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.theme--dark :deep(.v-btn-toggle .v-btn--active) {
  background: rgb(var(--v-theme-surface)) !important;
}
</style>
