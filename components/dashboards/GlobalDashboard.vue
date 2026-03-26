<template>
  <!-- Empty State with Geometric Background - No Permissions -->
  <div v-if="!hasAnyDashboardAccess" class="no-access-container">
    <div class="geometric-bg">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
      <div class="shape shape-6"></div>
    </div>
  </div>

  <!-- Normal Dashboard - With Permissions -->
  <div v-else class="dashboard-container">
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
          <v-tab v-if="canViewSeaDashboard" value="sea-tab" class="tab-item">
            <div class="tab-content">
              <v-icon size="28">mdi-ferry</v-icon>
              <div class="tab-text">
                <div class="tab-label">Maritime</div>
                <div class="tab-desc">Import & Export</div>
              </div>
            </div>
          </v-tab>
          <v-tab v-if="canViewAirDashboard" value="air-tab" class="tab-item">
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
        <v-tabs-window-item v-if="canViewSeaDashboard" value="sea-tab">
          <SeaDashboard />
        </v-tabs-window-item>
        <v-tabs-window-item v-if="canViewAirDashboard" value="air-tab">
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
const { hasPermission, isSuperAdminRole, user: currentUser } = useCheckUser()

const tab = ref<any>(null)
const currentTime = ref('')

// Helper function to check if user has any of the specified roles
const checkUserHasAnyRole = (roles: string[]) => {
  if (!currentUser.value) return false
  return currentUser.value.roles?.some((role: any) => roles.includes(role.name)) || false
}

// Check if user can view Maritime dashboard
const canViewSeaDashboard = computed(() => {
  return hasPermission('dashboard-sea-import-primary') ||
         hasPermission('dashboard-sea-export-primary') ||
         hasPermission('dashboard-sea-import-notifications') ||
         hasPermission('dashboard-sea-import-revalidations') ||
         hasPermission('dashboard-sea-export-containers') ||
         hasPermission('dashboard-sea-export-bookings') ||
         hasPermission('dashboard-sea-import-demurrages') ||
         hasPermission('dashboard-charts') ||
         checkUserHasAnyRole(['Super Admin', 'Admin'])
})

// Check if user can view Air dashboard
const canViewAirDashboard = computed(() => {
  return hasPermission('dashboard-air-import-primary') ||
         hasPermission('dashboard-air-export-primary') ||
         hasPermission('dashboard-air-import-cbm') ||
         hasPermission('dashboard-air-export-cbm') ||
         hasPermission('dashboard-air-import-notifications') ||
         hasPermission('dashboard-air-import-releases') ||
         hasPermission('dashboard-charts') ||
         checkUserHasAnyRole(['Super Admin', 'Admin'])
})

const canViewBilling = computed(() => {
  return isSuperAdminRole() || hasPermission('billing-dashboard-view')
})

// Check if user has ANY dashboard access at all
const hasAnyDashboardAccess = computed(() => {
  return canViewSeaDashboard.value || canViewAirDashboard.value || canViewBilling.value
})

// Set default tab based on permissions
onMounted(() => {
  if (canViewSeaDashboard.value) {
    tab.value = 'sea-tab'
  } else if (canViewAirDashboard.value) {
    tab.value = 'air-tab'
  } else if (canViewBilling.value) {
    tab.value = 'billing-tab'
  }
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
/* No Access Container - Geometric Background Only */
.no-access-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: linear-gradient(135deg, 
    rgba(248, 250, 252, 1) 0%, 
    rgba(241, 245, 249, 1) 50%, 
    rgba(248, 250, 252, 1) 100%);
}

.theme--dark .no-access-container {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 1) 0%, 
    rgba(30, 41, 59, 1) 50%, 
    rgba(15, 23, 42, 1) 100%);
}

.geometric-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  animation: float 25s ease-in-out infinite;
  opacity: 0.08;
  filter: blur(1px);
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  top: 5%;
  left: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 280px;
  height: 280px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border-radius: 50%;
  top: 50%;
  right: 10%;
  animation-delay: 5s;
}

.shape-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #10b981, #14b8a6);
  border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
  bottom: 10%;
  left: 15%;
  animation-delay: 10s;
}

.shape-4 {
  width: 220px;
  height: 220px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  border-radius: 30% 70% 53% 47% / 50% 45% 55% 50%;
  top: 25%;
  right: 30%;
  animation-delay: 15s;
}

.shape-5 {
  width: 320px;
  height: 320px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 41% 59% 41% 59% / 41% 59% 41% 59%;
  bottom: 20%;
  right: 25%;
  animation-delay: 20s;
}

.shape-6 {
  width: 260px;
  height: 260px;
  background: linear-gradient(135deg, #14b8a6, #06b6d4);
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  top: 60%;
  left: 35%;
  animation-delay: 12s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  25% {
    transform: translate(30px, -30px) rotate(90deg) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) rotate(180deg) scale(0.9);
  }
  75% {
    transform: translate(20px, 15px) rotate(270deg) scale(1.05);
  }
}

.theme--dark .shape {
  opacity: 0.06;
}

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
