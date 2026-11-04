<template>
  <v-card class="sc-card" elevation="0">
    <v-card-text class="pa-5">
      <div class="d-flex flex-wrap align-start justify-space-between ga-3">
        <div>
          <div class="d-flex align-center ga-2">
            <h3 class="sc-detail-title">{{ summary.name }}</h3>
            <v-chip :color="statusColor" size="x-small" variant="tonal" label>{{ statusLabel }}</v-chip>
          </div>
          <div class="sc-muted">
            {{ summary.customer_name }}
            <template v-if="summary.started_at"> · since {{ summary.started_at }}</template>
            <template v-if="summary.last_movement_at"> · last movement {{ summary.last_movement_at }}</template>
          </div>
        </div>

        <div v-if="canManage" class="d-flex ga-2">
          <v-btn
            color="primary"
            size="small"
            prepend-icon="mdi-play-circle-outline"
            :disabled="summary.status === 'paused'"
            @click="$emit('apply')"
          >
            Review &amp; apply
            <v-chip v-if="ready.items.length" size="x-small" color="white" variant="flat" class="ml-2 text-primary">{{ ready.items.length }}</v-chip>
          </v-btn>
          <v-menu>
            <template #activator="{ props: menu }">
              <v-btn v-bind="menu" icon="mdi-dots-vertical" size="small" variant="text" />
            </template>
            <v-list density="compact">
              <v-list-item
                :prepend-icon="summary.status === 'paused' ? 'mdi-play' : 'mdi-pause'"
                :title="summary.status === 'paused' ? 'Resume case' : 'Pause case'"
                @click="$emit('toggle-pause')"
              />
            </v-list>
          </v-menu>
        </div>
      </div>

      <v-row class="mt-3" align="center">
        <v-col cols="12" md="5">
          <div class="sc-muted text-capitalize">{{ summary.focus_label }}</div>
          <div class="sc-big">{{ formatCurrency(summary.focus_value) }}</div>
          <v-progress-linear :model-value="summary.progress" height="10" rounded :color="summary.progress >= 100 ? 'success' : 'primary'" class="my-2" />
          <div class="sc-muted">
            {{ summary.progress }}% {{ summary.mode === 'upfront' ? 'recovered' : 'resolved' }}
            · {{ summary.debt_items_open }} of {{ summary.debt_items }} items open
          </div>
        </v-col>

        <v-col cols="12" md="7">
          <v-row dense>
            <v-col v-for="stat in stats" :key="stat.label" cols="6" sm="3">
              <div class="sc-stat">
                <div class="sc-muted d-flex align-center">
                  {{ stat.label }}
                  <v-tooltip v-if="stat.hint" :text="stat.hint" location="top">
                    <template #activator="{ props: tip }">
                      <v-icon v-bind="tip" size="14" class="ml-1">mdi-information-outline</v-icon>
                    </template>
                  </v-tooltip>
                </div>
                <div class="sc-stat-value" :class="stat.class">{{ formatCurrency(stat.value) }}</div>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <div v-if="nextLine" class="sc-next mt-3">
        <v-icon size="18" class="mr-2">mdi-arrow-right-circle-outline</v-icon>{{ nextLine }}
      </div>

      <div v-if="alerts.length" class="mt-3 d-flex flex-column ga-2">
        <v-alert v-for="alert in alerts" :key="alert.code + alert.text" :type="alert.level" variant="tonal" density="compact">{{ alert.text }}</v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{ summary: any; ready: any; alerts: any[]; canManage: boolean }>()
defineEmits<{ (e: 'apply'): void; (e: 'toggle-pause'): void }>()

const { formatCurrency } = useReportFormatters()

const statusColor = computed(() => ({ settled: 'success', paused: 'grey', active: 'primary' }[props.summary.status as string] ?? 'primary'))
const statusLabel = computed(() => ({ settled: 'Settled', paused: 'Paused', active: 'Active' }[props.summary.status as string] ?? props.summary.status))

const stats = computed(() => {
  const s = props.summary
  const base = [
    { label: 'Debt generated', value: s.debt_total, hint: 'Total owed when the case was registered.' },
    { label: 'Covered', value: s.covered, class: 'text-success', hint: 'Marked as collected with money from other references.' },
  ]
  if (s.mode === 'upfront') {
    return [
      ...base,
      { label: 'To recover', value: s.to_recover, class: s.to_recover > 0 ? 'text-warning' : '', hint: 'Marked as collected already; still to be withheld from future rebate.' },
      { label: 'Recovered', value: s.recovered },
    ]
  }
  return [
    ...base,
    { label: 'On the way', value: s.upcoming_total, hint: 'Money of references whose freight is not paid yet.' },
    { label: 'Would remain', value: s.projected_pending, class: 'text-warning', hint: 'Pending after the money on the way arrives.' },
  ]
})

const nextLine = computed(() => {
  const s = props.summary
  if (s.status === 'settled') return 'Nothing left: the debt is fully covered.'
  if (props.ready.items.length) return `${props.ready.items.length} movements are ready to apply (${formatCurrency(props.ready.amount)}).`
  if (s.mode === 'upfront') return s.to_recover > 0 ? 'Waiting for a future reference with rebate to withhold the amount.' : ''
  if (s.upcoming_total > 0) return `${formatCurrency(s.upcoming_total)} will be covered when the freight of the pending references is paid.`
  return 'Waiting for new references to be paid.'
})
</script>
