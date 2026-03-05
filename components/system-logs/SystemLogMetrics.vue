<template>
  <v-row dense class="mb-6">
    <v-col v-for="card in metricCards" :key="card.label" cols="12" sm="6" md="4" lg="2">
      <v-card 
        variant="flat" 
        rounded="xl" 
        class="metric-card pa-4 elevation-1" 
        :class="`metric-${card.color}`"
      >
        <div class="mb-3">
          <v-avatar :color="card.color" size="48" rounded="lg" class="elevation-2">
            <v-icon color="white" size="24">{{ card.icon }}</v-icon>
          </v-avatar>
        </div>
        <div class="text-caption text-grey-darken-1 font-weight-medium mb-1">{{ card.label }}</div>
        <div class="text-h4 font-weight-black" :class="`text-${card.color}-darken-2`">
          {{ formatNumber(card.value) }}
        </div>
        <div v-if="card.subtitle" class="text-caption text-grey mt-1">{{ card.subtitle }}</div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { ISystemLogMetrics } from '~/repository/modules/systemLogs'

const props = defineProps<{
  metrics: ISystemLogMetrics | null
}>()

const metricCards = computed(() => {
  const m = props.metrics
  if (!m) return []
  return [
    { 
      label: 'Errors Today', 
      value: m.errors_today, 
      icon: 'mdi-alert-circle', 
      color: 'red',
      subtitle: 'System errors',
    },
    { 
      label: 'Critical', 
      value: m.critical_today, 
      icon: 'mdi-alert-octagon', 
      color: 'red-darken-3',
      subtitle: 'Requires attention',
    },
    { 
      label: 'Warnings', 
      value: m.warnings_today, 
      icon: 'mdi-alert', 
      color: 'orange',
      subtitle: 'Potential issues',
    },
    { 
      label: 'Jobs Failed', 
      value: m.jobs_failed_today, 
      icon: 'mdi-cog-off', 
      color: 'deep-purple',
      subtitle: 'Queue failures',
    },
    { 
      label: 'HTTP Errors', 
      value: m.http_errors_today, 
      icon: 'mdi-web', 
      color: 'blue',
      subtitle: '4xx/5xx responses',
    },
    { 
      label: 'Last Hour', 
      value: m.total_last_hour, 
      icon: 'mdi-clock-fast', 
      color: 'teal',
      subtitle: 'Recent activity',
    },
  ]
})

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped>
.metric-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.8;
}

.metric-red::before { background: rgb(var(--v-theme-red)); }
.metric-red-darken-3::before { background: rgb(var(--v-theme-red-darken-3)); }
.metric-orange::before { background: rgb(var(--v-theme-orange)); }
.metric-deep-purple::before { background: rgb(var(--v-theme-deep-purple)); }
.metric-blue::before { background: rgb(var(--v-theme-blue)); }
.metric-teal::before { background: rgb(var(--v-theme-teal)); }
</style>
