<template>
  <div class="space-y-5">
    <div v-for="track in tracks" :key="`track-${track.rateType}`">
      <div class="flex items-center gap-2 mb-2">
        <v-chip size="small" :color="track.rateType === 1 ? 'primary' : 'secondary'" label>Rate {{ track.rateType }}</v-chip>
        <span class="text-xs opacity-60">{{ track.entries.length }} period(s)</span>
      </div>

      <div v-if="!track.entries.length" class="text-sm opacity-60 pl-1">No rates recorded.</div>

      <div v-else class="space-y-2">
        <div
          v-for="entry in track.entries"
          :key="`entry-${entry.id}`"
          class="flex items-center gap-3 rounded-lg border px-3 py-2"
          :class="rowClass(entry)"
        >
          <div class="w-2 self-stretch rounded-full" :class="barClass(entry.status)" />
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-semibold">{{ formatCurrencyAmount(entry.amount) }}</span>
              <v-chip size="x-small" :color="statusColor(entry.status)" label>{{ entry.status }}</v-chip>
              <v-chip v-if="entry.isCurrent" size="x-small" color="success" variant="flat" label>Current</v-chip>
            </div>
            <div class="text-xs opacity-70">
              {{ formatDateLabel(entry.startDate) }} → {{ entry.endDate ? formatDateLabel(entry.endDate) : 'Open ended' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  formatCurrencyAmount,
  formatDateLabel,
  getConflictRateIds,
  getPeriodStatus,
  toDateOnly,
  todayKey,
  type RateRow,
  type RateType,
} from '~/composables/useContainerDelayRates'

const props = defineProps<{
  rows: RateRow[]
  onDate?: string
}>()

type TimelineEntry = {
  id: number
  amount: number | string | null
  startDate: string | null
  endDate: string | null
  status: 'active' | 'upcoming' | 'expired' | 'inactive' | 'conflict'
  isCurrent: boolean
}

const referenceDate = computed(() => props.onDate || todayKey())

const tracks = computed(() => {
  const conflictIds = getConflictRateIds(props.rows)

  const build = (rateType: RateType) => {
    const entries: TimelineEntry[] = props.rows
      .filter((row) => row.rate_type === rateType)
      .sort((a, b) => (toDateOnly(b.start_date) ?? '').localeCompare(toDateOnly(a.start_date) ?? ''))
      .map((row) => {
        let status: TimelineEntry['status']
        if (row.deleted_at) status = 'inactive'
        else if (row.id && conflictIds.has(row.id)) status = 'conflict'
        else status = getPeriodStatus(row.start_date, row.end_date, referenceDate.value)

        return {
          id: row.id,
          amount: row.amount,
          startDate: toDateOnly(row.start_date),
          endDate: toDateOnly(row.end_date),
          status,
          isCurrent: !row.deleted_at && status === 'active',
        }
      })

    return { rateType, entries }
  }

  return [build(1), build(2)]
})

function statusColor(status: TimelineEntry['status']) {
  switch (status) {
    case 'active':
      return 'success'
    case 'upcoming':
      return 'info'
    case 'expired':
      return 'grey'
    case 'inactive':
      return 'error'
    case 'conflict':
      return 'warning'
    default:
      return 'grey'
  }
}

function barClass(status: TimelineEntry['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'upcoming':
      return 'bg-sky-500'
    case 'expired':
      return 'bg-gray-300'
    case 'inactive':
      return 'bg-red-400'
    case 'conflict':
      return 'bg-amber-500'
    default:
      return 'bg-gray-300'
  }
}

function rowClass(entry: TimelineEntry) {
  if (entry.isCurrent) return 'border-green-400 bg-green-50 dark:bg-green-950'
  if (entry.status === 'conflict') return 'border-amber-400 bg-amber-50 dark:bg-amber-950'
  if (entry.status === 'inactive') return 'opacity-60'
  return ''
}
</script>
