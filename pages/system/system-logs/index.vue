<template>
  <div class="system-logs-page">
    <v-container fluid class="pa-6">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between flex-wrap ga-4 mb-6">
        <div>
          <div class="d-flex align-center ga-3 mb-1">
            <v-avatar color="indigo-darken-2" size="48" rounded="lg">
              <v-icon color="white" size="28">mdi-console-line</v-icon>
            </v-avatar>
            <div>
              <h1 class="text-h4 font-weight-bold">System Logs</h1>
              <p class="text-body-2 text-grey-darken-1 mb-0">Real-time centralized monitoring & error tracking</p>
            </div>
          </div>
        </div>

        <div class="d-flex align-center ga-2">
          <OnlineUsers :users="presenceUsers" @click="usersDrawerOpen = true" />
          
          <v-chip 
            :color="state.isStreamActive ? 'success' : 'grey'" 
            variant="flat" 
            size="small" 
            class="font-weight-bold"
          >
            <v-icon start size="10" :class="{ 'live-pulse': state.isStreamActive }">
              {{ state.isStreamActive ? 'mdi-circle' : 'mdi-circle-outline' }}
            </v-icon>
            {{ state.isStreamActive ? 'LIVE' : 'OFFLINE' }}
          </v-chip>

          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" prepend-icon="mdi-download" variant="tonal" color="indigo" size="small">
                Export
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item prepend-icon="mdi-file-excel" title="Export Excel" @click="exportExcel" />
              <v-list-item prepend-icon="mdi-file-pdf-box" title="Export PDF" @click="exportPdf" />
            </v-list>
          </v-menu>
        </div>
      </div>

      <!-- Metrics Dashboard -->
      <SystemLogMetrics :metrics="state.metrics" />

      <!-- Filters Bar -->
      <SystemLogFilters @apply="setFilters" @clear="clearFilters" />

      <!-- Logs Table -->
      <SystemLogTable
        :logs="state.logs"
        :loading="state.isLoading"
        :pagination="state.pagination"
        @page-change="fetchLogs"
        @row-click="openDetail"
      />

      <!-- Detail Dialog -->
      <SystemLogDetail v-model="detailOpen" :log="selectedLog" />
      
      <!-- Online Users Drawer -->
      <OnlineUsersDrawer v-model="usersDrawerOpen" :users="presenceUsers" />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import type { ISystemLog } from '~/repository/modules/systemLogs'

definePageMeta({
  title: 'System Logs',
  layout: 'default',
})

const {
  state,
  fetchLogs,
  fetchMetrics,
  fetchLogDetail,
  setFilters,
  clearFilters,
  connectStream,
  disconnectStream,
  exportExcel,
  exportPdf,
} = useSystemLogs()

const { users: presenceUsers } = useSystemPresence()

const detailOpen = ref(false)
const usersDrawerOpen = ref(false)
const selectedLog = ref<ISystemLog | null>(null)

const openDetail = async (log: ISystemLog) => {
  selectedLog.value = log
  detailOpen.value = true
  // Fetch full detail (with payload for dev role)
  const full = await fetchLogDetail(log.id)
  if (full) {
    selectedLog.value = full
  }
}

onMounted(async () => {
  await Promise.all([fetchLogs(), fetchMetrics()])
  connectStream()
})

onBeforeUnmount(() => {
  disconnectStream()
})

// Refresh metrics every 60s
let metricsInterval: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  metricsInterval = setInterval(fetchMetrics, 60000)
})
onBeforeUnmount(() => {
  if (metricsInterval) clearInterval(metricsInterval)
})
</script>

<style scoped>
.live-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
