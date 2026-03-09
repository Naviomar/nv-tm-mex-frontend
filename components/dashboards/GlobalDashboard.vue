<template>
  <div class="dashboard-container">
    <!-- Professional Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="flex items-center gap-4">
          <div class="dashboard-icon">
            <v-icon size="48" color="white">mdi-view-dashboard-variant</v-icon>
          </div>
          <div>
            <h1 class="dashboard-title">Dashboard Analytics</h1>
            <p class="dashboard-subtitle">Real-time insights and operational metrics</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-3">
          <v-chip color="rgba(255,255,255,0.2)" variant="flat" class="text-white font-semibold">
            <v-icon start size="18">mdi-clock-outline</v-icon>
            {{ currentTime }}
          </v-chip>
          <div>
            <v-chip color="success" variant="flat" class="font-semibold">
              <v-icon start size="16">mdi-check-circle</v-icon>
              Live
            </v-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- Modern Tab Navigation -->
    <div class="mx-7">
      <v-card class="tab-card elevation-3 mt-n8" style="position: relative; z-index: 2;">
        <v-tabs
          v-model="tab"
          align-tabs="center"
          height="72"
          class="modern-tabs"
        >
          <v-tab value="sea-tab" class="tab-item">
            <div class="tab-content">
              <v-icon size="28">mdi-ferry</v-icon>
              <div class="tab-text">
                <div class="tab-label">Maritime</div>
                <div class="tab-desc">Import & Export</div>
              </div>
            </div>
          </v-tab>
          <v-tab value="air-tab" class="tab-item">
            <div class="tab-content">
              <v-icon size="28">mdi-airplane</v-icon>
              <div class="tab-text">
                <div class="tab-label">Air Freight</div>
                <div class="tab-desc">Cargo Operations</div>
              </div>
            </div>
          </v-tab>
          <v-tab v-if="canViewBilling" value="billing-tab" class="tab-item">
            <div class="tab-content">
              <v-icon size="28">mdi-currency-usd</v-icon>
              <div class="tab-text">
                <div class="tab-label">Billing</div>
                <div class="tab-desc">Financial Data</div>
              </div>
            </div>
          </v-tab>
        </v-tabs>
      </v-card>
    </div>
    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="sea-tab">
          <SeaDashboard />
        </v-tabs-window-item>
        <v-tabs-window-item value="air-tab">
          <AirDashboard />
        </v-tabs-window-item>
        <v-tabs-window-item v-if="canViewBilling" value="billing-tab">
          <BillingDashboard />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </div>
</template>
<script setup lang="ts">
const { hasPermission, isSuperAdminRole } = useCheckUser()

const tab = ref<any>('sea-tab')
const currentTime = ref('')

const canViewBilling = computed(() => {
  return isSuperAdminRole() || hasPermission('billing-dashboard-view')
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000)
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: rgb(var(--v-theme-surface));
}

.theme--dark .dashboard-container {
  background: rgb(var(--v-theme-surface));
}

.dashboard-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b67f6 50%, #0670d4 100%);
  padding: 2.5rem 2rem 5rem;
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.4;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-icon {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px;
  backdrop-filter: blur(10px);
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
  margin: 0;
}

.dashboard-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4px;
}

.tab-card {
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.theme--dark .tab-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
}

.modern-tabs {
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-primary));
}

.theme--dark .modern-tabs {
  background: rgb(var(--v-theme-surface));
}

.tab-item {
  text-transform: none !important;
  font-weight: 500;
  min-height: 72px;
  padding: 12px 24px;
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tab-text {
  text-align: left;
}

.tab-label {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.2;
}

.tab-desc {
  font-size: 0.75rem;
  opacity: 0.7;
  line-height: 1.2;
  margin-top: 2px;
}

.dashboard-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
