<template>
  <!-- Empty State with Maritime/Freight Themed Animated Background - No Permissions -->
  <div v-if="!hasAnyDashboardAccess" class="no-access-container">
    <div class="geometric-bg">
      <!-- Trade route: dashed path with a ship drifting along it -->
      <svg class="route-svg" viewBox="0 0 1200 700" preserveAspectRatio="none">
        <path
          id="trade-route"
          class="route-path"
          d="M -50,520 C 200,420 320,560 480,460 C 650,360 760,480 920,380 C 1050,300 1150,340 1260,260"
          fill="none"
        />
      </svg>
      <v-icon class="route-ship" size="34">mdi-ferry</v-icon>

      <!-- Floating freight-themed icons -->
      <v-icon class="float-icon icon-1" size="120">mdi-ferry</v-icon>
      <v-icon class="float-icon icon-2" size="90">mdi-airplane</v-icon>
      <v-icon class="float-icon icon-3" size="100">mdi-package-variant-closed</v-icon>
      <v-icon class="float-icon icon-4" size="80">mdi-anchor</v-icon>
      <v-icon class="float-icon icon-5" size="110">mdi-earth</v-icon>
      <v-icon class="float-icon icon-6" size="70">mdi-map-marker-path</v-icon>
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
  return isSuperAdminRole() || hasPermission('dashboard-billing-view')
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
/* No Access Container - Maritime/Freight Themed Animated Background.
   Uses Vuetify theme CSS variables (not the dead `.theme--dark` Vuetify-2
   class) so it adapts automatically to light/dark mode. */
.no-access-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-background)) 0%,
    rgba(var(--v-theme-primary), 0.04) 50%,
    rgb(var(--v-theme-background)) 100%
  );
}

.geometric-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

/* Trade route line + drifting ship */
.route-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.route-path {
  stroke: rgba(var(--v-theme-primary), 0.16);
  stroke-width: 2;
  stroke-dasharray: 10 10;
  animation: route-dash 60s linear infinite;
}
.route-ship {
  position: absolute;
  color: rgba(var(--v-theme-primary), 0.5);
  offset-path: path("M -50,520 C 200,420 320,560 480,460 C 650,360 760,480 920,380 C 1050,300 1150,340 1260,260");
  offset-rotate: 0deg;
  animation: sail 38s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
}

@keyframes route-dash {
  to {
    stroke-dashoffset: -1000;
  }
}
@keyframes sail {
  0% {
    offset-distance: 0%;
  }
  100% {
    offset-distance: 100%;
  }
}

/* Floating freight icons (ships, planes, packages, anchor, globe, route) */
.float-icon {
  position: absolute;
  color: rgba(var(--v-theme-primary), 0.1);
  animation: float 26s ease-in-out infinite;
  filter: blur(0.5px);
}

.icon-1 {
  top: 8%;
  left: 6%;
  animation-delay: 0s;
  color: rgba(var(--v-theme-primary), 0.12);
}
.icon-2 {
  top: 14%;
  right: 10%;
  animation-delay: 4s;
  color: rgba(59, 130, 246, 0.1);
}
.icon-3 {
  bottom: 16%;
  left: 12%;
  animation-delay: 9s;
  color: rgba(245, 158, 11, 0.12);
}
.icon-4 {
  bottom: 10%;
  right: 16%;
  animation-delay: 13s;
  color: rgba(var(--v-theme-secondary), 0.12);
}
.icon-5 {
  top: 45%;
  left: 4%;
  animation-delay: 6s;
  color: rgba(16, 185, 129, 0.08);
}
.icon-6 {
  top: 55%;
  right: 6%;
  animation-delay: 16s;
  color: rgba(99, 102, 241, 0.1);
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  25% {
    transform: translate(18px, -22px) rotate(4deg) scale(1.05);
  }
  50% {
    transform: translate(-14px, 14px) rotate(-3deg) scale(0.96);
  }
  75% {
    transform: translate(14px, 10px) rotate(3deg) scale(1.02);
  }
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
