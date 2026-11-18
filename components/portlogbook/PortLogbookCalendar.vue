<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <v-btn icon="mdi-chevron-left" size="small" variant="tonal" density="comfortable" title="Previous month" @click="shift(-1)" />
      <v-btn icon="mdi-chevron-right" size="small" variant="tonal" density="comfortable" title="Next month" @click="shift(1)" />
      <div class="text-lg font-bold px-2" style="min-width: 160px">{{ monthLabel }}</div>
      <v-btn size="small" variant="tonal" color="primary" @click="goToday">Today</v-btn>
      <v-spacer />
      <v-autocomplete
        v-model="eventType"
        :items="catalogs.event_types"
        label="Event type"
        density="compact"
        clearable
        hide-details
        style="max-width: 220px"
      />
      <div style="min-width: 240px"><APortSearch v-model="portId" label="port" /></div>
    </div>

    <div class="flex flex-wrap items-center gap-3 text-caption">
      <span v-for="s in legend" :key="s.value" class="flex items-center gap-1">
        <span class="legend-dot" :style="{ background: `rgb(var(--v-theme-${operationsColor(s.value)}))` }" />{{ s.title }}
      </span>
      <span class="flex items-center gap-1"><v-icon size="14">mdi-arrow-right-bold</v-icon>Ongoing (no end date yet)</span>
      <span class="flex items-center gap-1"><span class="legend-dot legend-dot--dashed" />Scheduled</span>
      <span v-if="canCreate" class="text-medium-emphasis ml-auto">Click a day to register an event</span>
    </div>

    <div class="overflow-x-auto">
      <div class="calendar" style="min-width: 760px">
        <div class="calendar-head">
          <div v-for="d in weekdays" :key="d" class="calendar-head-cell">{{ d }}</div>
        </div>
        <div v-for="(week, wi) in weeks" :key="wi" class="calendar-week" :style="{ height: `${weekHeight(week)}px` }">
          <div class="calendar-days">
            <div
              v-for="day in week.days"
              :key="day.key"
              class="calendar-day"
              :class="{ 'calendar-day--other': !day.inMonth, 'calendar-day--click': canCreate }"
              @click="canCreate ? emit('create', day.key) : undefined"
            >
              <span class="calendar-daynum" :class="{ 'calendar-daynum--today': day.isToday }">{{ day.num }}</span>
            </div>
          </div>
          <v-tooltip v-for="seg in week.segments" :key="`${seg.entry.id}-${wi}`" location="top" :open-delay="150">
            <template #activator="{ props: tipProps }">
              <div
                v-bind="tipProps"
                class="calendar-bar"
                :class="{
                  'calendar-bar--scheduled': seg.entry.status === 'scheduled',
                  'calendar-bar--left': seg.cutLeft,
                  'calendar-bar--right': seg.cutRight || seg.open,
                }"
                :style="{
                  left: `calc(${(seg.col / 7) * 100}% + 2px)`,
                  width: `calc(${(seg.span / 7) * 100}% - 4px)`,
                  top: `${28 + seg.lane * 24}px`,
                  background: seg.entry.status === 'scheduled' ? 'transparent' : `rgb(var(--v-theme-${barColor(seg.entry)}))`,
                  color: seg.entry.status === 'scheduled' ? `rgb(var(--v-theme-${barColor(seg.entry)}))` : '#fff',
                  borderColor: `rgb(var(--v-theme-${barColor(seg.entry)}))`,
                }"
                @click.stop="emit('open', seg.entry)"
              >
                <v-icon size="14" class="mr-1">{{ eventIcon(seg.entry.event_type) }}</v-icon>
                <span class="text-truncate">{{ seg.entry.port?.name }} · {{ entryTitle(seg.entry) }}</span>
                <v-icon v-if="seg.open" size="14" class="ml-auto">mdi-arrow-right-bold</v-icon>
              </div>
            </template>
            <div class="text-caption">
              <div class="font-weight-bold">{{ seg.entry.port?.name }} — {{ entryTitle(seg.entry) }}</div>
              <div>{{ seg.entry.operations_status_label }} · {{ statusMeta(seg.entry.status).label }}</div>
              <div>{{ formatDateString(seg.entry.starts_at) }} → {{ seg.entry.ends_at ? formatDateString(seg.entry.ends_at) : 'Ongoing' }}</div>
            </div>
          </v-tooltip>
        </div>
      </div>
    </div>
    <div v-if="loaded && !entries.length" class="text-center text-medium-emphasis py-2">No port events in this period.</div>
  </div>
</template>
<script setup lang="ts">
import moment from 'moment-timezone'
import type { IPortLogbookEntry } from '~/repository/modules/catalogs/portLogbook'

const props = defineProps<{ refreshKey?: number }>()
const emit = defineEmits(['open', 'create'])

const { $api } = useNuxtApp()
const { can } = useCheckUser()
const { eventIcon, operationsColor, statusMeta, entryTitle } = usePortLogbook()

const MX_TZ = 'America/Mexico_City'
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const legend = [
  { value: 'closed', title: 'Closed' },
  { value: 'restricted', title: 'Restricted' },
  { value: 'delayed', title: 'Delays' },
]

const canCreate = computed(() => can('port-logbook-create'))
const catalogs = ref<{ event_types: any[] }>({ event_types: [] })
const anchor = ref(moment.tz(MX_TZ).startOf('month').format('YYYY-MM-DD'))
const eventType = ref<string | null>(null)
const portId = ref<any>(null)
const entries = ref<IPortLogbookEntry[]>([])
const loaded = ref(false)

const monthLabel = computed(() => moment.utc(anchor.value).format('MMMM YYYY'))
const gridStart = computed(() => moment.utc(anchor.value).startOf('isoWeek'))
const gridEnd = computed(() => moment.utc(anchor.value).endOf('month').endOf('isoWeek'))
const todayKey = moment.tz(MX_TZ).format('YYYY-MM-DD')

const barColor = (entry: IPortLogbookEntry) => operationsColor(entry.operations_status)

type Segment = { entry: IPortLogbookEntry; col: number; span: number; lane: number; cutLeft: boolean; cutRight: boolean; open: boolean }

const weeks = computed(() => {
  const result: { days: any[]; segments: Segment[]; lanes: number }[] = []
  const cursor = gridStart.value.clone()
  while (cursor.isBefore(gridEnd.value)) {
    const weekStart = cursor.clone()
    const weekEnd = cursor.clone().add(6, 'days')
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = weekStart.clone().add(i, 'days')
      const key = d.format('YYYY-MM-DD')
      return { key, num: d.date(), inMonth: d.month() === moment.utc(anchor.value).month(), isToday: key === todayKey }
    })

    const segments: Segment[] = []
    for (const entry of entries.value) {
      const s = moment.utc(entry.starts_at.slice(0, 10))
      // an open event is drawn to the end of the grid with an open right edge
      const open = !entry.ends_at
      const e = open ? gridEnd.value.clone().startOf('day') : moment.utc(entry.ends_at!.slice(0, 10))
      if (e.isBefore(weekStart) || s.isAfter(weekEnd)) continue
      const from = moment.max(s, weekStart)
      const to = moment.min(e, weekEnd)
      segments.push({
        entry,
        col: from.diff(weekStart, 'days'),
        span: to.diff(from, 'days') + 1,
        lane: 0,
        cutLeft: s.isBefore(weekStart),
        cutRight: e.isAfter(weekEnd),
        open: open && !e.isAfter(weekEnd),
      })
    }

    // greedy lane packing: longest first within the same start column
    segments.sort((a, b) => a.col - b.col || b.span - a.span)
    const laneEnds: number[] = []
    for (const seg of segments) {
      let lane = laneEnds.findIndex((end) => end <= seg.col)
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = seg.col + seg.span
      seg.lane = lane
    }

    result.push({ days, segments, lanes: laneEnds.length })
    cursor.add(7, 'days')
  }
  return result
})

const weekHeight = (week: { lanes: number }) => Math.max(104, 34 + week.lanes * 24 + 8)

const load = async () => {
  try {
    entries.value = (await $api.portLogbook.getCalendar(
      gridStart.value.format('YYYY-MM-DD'),
      gridEnd.value.format('YYYY-MM-DD'),
      { event_type: eventType.value, port_id: portId.value }
    )) as IPortLogbookEntry[]
  } catch (e) {
    console.error(e)
  } finally {
    loaded.value = true
  }
}

const shift = (months: number) => {
  anchor.value = moment.utc(anchor.value).add(months, 'months').format('YYYY-MM-DD')
}
const goToday = () => {
  anchor.value = moment.tz(MX_TZ).startOf('month').format('YYYY-MM-DD')
}

watch([anchor, eventType, portId], load)
watch(() => props.refreshKey, load)

onMounted(async () => {
  try {
    catalogs.value = (await $api.portLogbook.getCatalogs()) as any
  } catch (e) {
    console.error(e)
  }
  await load()
})
</script>
<style scoped>
.calendar {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}
.calendar-head {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.calendar-head-cell {
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.calendar-week {
  position: relative;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.calendar-days {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.calendar-day {
  padding: 4px 6px;
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.calendar-day:first-child {
  border-left: 0;
}
.calendar-day--other {
  background: rgba(var(--v-theme-on-surface), 0.04);
  color: rgba(var(--v-theme-on-surface), 0.45);
}
.calendar-day--click {
  cursor: pointer;
}
.calendar-day--click:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}
.calendar-daynum {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 4px;
  border-radius: 11px;
  font-size: 12px;
}
.calendar-daynum--today {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-weight: 700;
}
.calendar-bar {
  position: absolute;
  display: flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 11px;
  line-height: 18px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
}
.calendar-bar--scheduled {
  border-style: dashed;
}
.calendar-bar--left {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.calendar-bar--right {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.legend-dot--dashed {
  border: 1px dashed currentColor;
}
</style>
