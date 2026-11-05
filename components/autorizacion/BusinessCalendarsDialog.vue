<template>
  <v-dialog :model-value="modelValue" max-width="980" scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center gap-2 pt-4 px-6">
        <v-icon icon="mdi-calendar-clock" color="primary" />
        Business calendars
      </v-card-title>
      <v-card-subtitle class="px-6">
        Working hours and non-working days per office. Approval validity in working hours is counted with the requester's calendar.
      </v-card-subtitle>

      <v-divider class="mt-2" />

      <v-card-text class="px-6 py-4" style="max-height: 75vh">
        <div v-if="loading" class="d-flex justify-center py-10">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else>
          <div class="d-flex align-center gap-2 mb-4 flex-wrap">
            <v-chip
              v-for="(cal, i) in calendars"
              :key="cal.id ?? `new-${i}`"
              :color="i === selectedIndex ? 'primary' : undefined"
              :variant="i === selectedIndex ? 'flat' : 'tonal'"
              @click="selectedIndex = i"
            >
              {{ cal.name || 'New calendar' }}
              <v-icon v-if="cal.is_default" end size="14">mdi-star</v-icon>
            </v-chip>
            <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-plus" @click="addCalendar">Office calendar</v-btn>
          </div>

          <template v-if="current">
            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field v-model="current.name" label="Name" density="compact" />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field v-model="current.code" label="Code" density="compact" hint="e.g. mx-gdl" persistent-hint />
              </v-col>
              <v-col cols="12" md="3">
                <v-autocomplete v-model="current.timezone" :items="timezones" label="Time zone" density="compact" />
              </v-col>
              <v-col cols="12" md="2" class="d-flex align-center">
                <v-switch v-model="current.is_default" label="Default" color="primary" density="compact" hide-details />
              </v-col>
            </v-row>

            <!-- Weekly schedule -->
            <div class="text-subtitle-2 font-weight-bold mt-2 mb-2">Working hours</div>
            <div class="tm-border rounded mb-4">
              <div v-for="day in weekdays" :key="day.value" class="d-flex align-center gap-3 px-3 py-2 day-row">
                <div class="font-weight-medium" style="width: 90px">{{ day.label }}</div>
                <div class="d-flex align-center gap-2 flex-wrap flex-grow-1">
                  <span v-if="!blocksOf(day.value).length" class="text-caption text-disabled">Non-working day</span>
                  <div v-for="(block, bi) in blocksOf(day.value)" :key="bi" class="d-flex align-center gap-1">
                    <input v-model="block.starts_at" type="time" class="time-input tm-border rounded" />
                    <span class="text-medium-emphasis">–</span>
                    <input v-model="block.ends_at" type="time" class="time-input tm-border rounded" />
                    <v-btn icon="mdi-close" size="x-small" variant="text" @click="removeBlock(block)" />
                  </div>
                </div>
                <v-btn size="x-small" variant="text" color="primary" prepend-icon="mdi-plus" @click="addBlock(day.value)">Block</v-btn>
                <v-btn v-if="day.value === 1" size="x-small" variant="text" title="Copy Monday to Tuesday–Friday" @click="copyMondayToWeek">Copy to Tue–Fri</v-btn>
              </div>
            </div>

            <!-- Holidays -->
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-2 font-weight-bold">Non-working days</div>
              <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-plus" @click="addHoliday">Day</v-btn>
            </div>
            <div class="tm-border rounded mb-4">
              <div v-if="!current.holidays.length" class="text-caption text-disabled pa-3">No non-working days.</div>
              <div v-for="(holiday, hi) in sortedHolidays" :key="hi" class="d-flex align-center gap-3 px-3 py-1 day-row">
                <input v-model="holiday.date" type="date" class="time-input tm-border rounded" />
                <v-text-field v-model="holiday.name" density="compact" variant="plain" hide-details placeholder="Name" class="flex-grow-1" />
                <v-checkbox v-model="holiday.is_recurring" label="Every year" density="compact" hide-details class="flex-grow-0" />
                <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="removeHoliday(holiday)" />
              </div>
            </div>

            <!-- Users -->
            <template v-if="!current.is_default">
              <div class="text-subtitle-2 font-weight-bold mb-1">People in this office</div>
              <div class="text-caption text-medium-emphasis mb-2">Everybody else uses the default calendar.</div>
              <v-autocomplete
                v-model="current.users"
                :items="userItems"
                :loading="searchingUsers"
                item-title="name"
                item-value="id"
                return-object
                multiple
                chips
                closable-chips
                density="compact"
                label="Add people"
                hide-no-data
                @update:search="searchUsers"
              />
            </template>

            <!-- Preview -->
            <div class="tm-panel tm-border rounded pa-3 mt-2">
              <div class="text-subtitle-2 font-weight-bold mb-2">Try it</div>
              <div class="d-flex align-center gap-3 flex-wrap">
                <v-text-field v-model="preview.from" type="datetime-local" label="Approved at" density="compact" hide-details style="max-width: 230px" />
                <v-select v-model="preview.mode" :items="previewModes" label="Rule" density="compact" hide-details style="max-width: 230px" />
                <v-text-field v-model.number="preview.value" type="number" min="0.25" step="0.5" label="Value" density="compact" hide-details style="max-width: 110px" />
                <v-btn variant="tonal" color="primary" :loading="previewing" @click="runPreview">Calculate</v-btn>
                <span v-if="previewResult" class="text-body-2">
                  Valid until <strong>{{ formatLocal(previewResult) }}</strong>
                </span>
              </div>
            </div>
          </template>

          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-3">{{ error }}</v-alert>
        </template>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-6 py-3">
        <v-btn v-if="current?.id && !current.is_default" color="error" variant="text" :disabled="saving" @click="removeCalendar">Delete</v-btn>
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="$emit('update:modelValue', false)">Close</v-btn>
        <v-btn color="primary" variant="flat" :loading="saving" :disabled="!current" @click="save">Save calendar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IBusinessCalendar, IBusinessCalendarHoliday, IBusinessCalendarHour } from '~/repository/modules/catalogs/businessCalendars'

const props = defineProps<{ modelValue: boolean }>()
defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const weekdays = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
]
const timezones = ['America/Mexico_City', 'America/Monterrey', 'America/Cancun', 'America/Chihuahua', 'America/Hermosillo', 'America/Tijuana', 'America/Santiago']
const previewModes = [
  { title: 'Working hours', value: 'business_hours' },
  { title: 'Calendar hours', value: 'calendar_hours' },
  { title: 'Until end of working days', value: 'business_days' },
]

type EditableCalendar = IBusinessCalendar & { users: { id: number; name: string; email: string }[] }

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const calendars = ref<EditableCalendar[]>([])
const selectedIndex = ref(0)
const current = computed(() => calendars.value[selectedIndex.value] ?? null)

const preview = ref({ from: '', mode: 'business_hours', value: 5.5 })
const previewing = ref(false)
const previewResult = ref<string | null>(null)

const userItems = ref<{ id: number; name: string; email: string }[]>([])
const searchingUsers = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const normalize = (cal: IBusinessCalendar): EditableCalendar => ({
  ...cal,
  hours: cal.hours.map((h) => ({ weekday: h.weekday, starts_at: h.starts_at.slice(0, 5), ends_at: h.ends_at.slice(0, 5) })),
  holidays: cal.holidays.map((h) => ({ date: h.date.slice(0, 10), name: h.name, is_recurring: !!h.is_recurring })),
  users: cal.users ?? [],
})

async function load() {
  loading.value = true
  error.value = null
  previewResult.value = null
  try {
    calendars.value = (await $api.businessCalendars.list()).map(normalize)
    selectedIndex.value = 0
    userItems.value = calendars.value.flatMap((c) => c.users)
  } catch (e: any) {
    error.value = e?.response?._data?.message || 'Could not load the calendars.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) load()
  },
)

watch(selectedIndex, () => {
  previewResult.value = null
  error.value = null
})

const blocksOf = (weekday: number) =>
  (current.value?.hours ?? []).filter((h) => h.weekday === weekday).sort((a, b) => a.starts_at.localeCompare(b.starts_at))

function addBlock(weekday: number) {
  const last = blocksOf(weekday).at(-1)
  current.value?.hours.push({ weekday, starts_at: last ? last.ends_at : '08:30', ends_at: last ? '18:30' : '14:00' })
}

function removeBlock(block: IBusinessCalendarHour) {
  if (!current.value) return
  current.value.hours = current.value.hours.filter((h) => h !== block)
}

function copyMondayToWeek() {
  if (!current.value) return
  const monday = blocksOf(1)
  current.value.hours = [
    ...current.value.hours.filter((h) => h.weekday === 1 || h.weekday > 5),
    ...[2, 3, 4, 5].flatMap((weekday) => monday.map((b) => ({ weekday, starts_at: b.starts_at, ends_at: b.ends_at }))),
  ]
}

const sortedHolidays = computed(() => [...(current.value?.holidays ?? [])].sort((a, b) => a.date.localeCompare(b.date)))

function addHoliday() {
  current.value?.holidays.push({ date: new Date().toISOString().slice(0, 10), name: '', is_recurring: false })
}

function removeHoliday(holiday: IBusinessCalendarHoliday) {
  if (!current.value) return
  current.value.holidays = current.value.holidays.filter((h) => h !== holiday)
}

function addCalendar() {
  const base = calendars.value.find((c) => c.is_default)
  calendars.value.push({
    code: '',
    name: '',
    timezone: base?.timezone ?? 'America/Mexico_City',
    is_default: false,
    is_active: true,
    hours: base ? base.hours.map((h) => ({ ...h })) : [],
    holidays: base ? base.holidays.map((h) => ({ ...h })) : [],
    users: [],
  })
  selectedIndex.value = calendars.value.length - 1
}

function searchUsers(query: string) {
  if (!query || query.length < 2) return
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    searchingUsers.value = true
    try {
      const found = await $api.requestCcUsers.searchAvailableUsers(query)
      const selected = current.value?.users ?? []
      userItems.value = [...selected, ...found.filter((u: any) => !selected.some((s) => s.id === u.id))] as any
    } finally {
      searchingUsers.value = false
    }
  }, 300)
}

const payloadOf = (cal: EditableCalendar): IBusinessCalendar => ({
  id: cal.id,
  code: cal.code,
  name: cal.name,
  timezone: cal.timezone,
  is_default: cal.is_default,
  is_active: cal.is_active,
  hours: cal.hours,
  holidays: cal.holidays.filter((h) => h.date && h.name),
  user_ids: cal.is_default ? [] : cal.users.map((u) => u.id),
})

async function save() {
  if (!current.value) return
  saving.value = true
  error.value = null
  try {
    const saved = await $api.businessCalendars.save(payloadOf(current.value))
    snackbar.add({ type: 'success', text: 'Calendar saved' })
    const keepCode = saved.code
    await load()
    selectedIndex.value = Math.max(0, calendars.value.findIndex((c) => c.code === keepCode))
  } catch (e: any) {
    error.value = e?.response?._data?.message || 'Could not save the calendar.'
  } finally {
    saving.value = false
  }
}

async function removeCalendar() {
  if (!current.value?.id) return
  saving.value = true
  try {
    await $api.businessCalendars.remove(current.value.id)
    snackbar.add({ type: 'success', text: 'Calendar deleted' })
    await load()
  } catch (e: any) {
    error.value = e?.response?._data?.message || 'Could not delete the calendar.'
  } finally {
    saving.value = false
  }
}

async function runPreview() {
  if (!current.value) return
  previewing.value = true
  error.value = null
  try {
    const result = await $api.businessCalendars.preview({
      calendar: payloadOf(current.value),
      from: preview.value.from || null,
      mode: preview.value.mode,
      value: preview.value.value,
    })
    previewResult.value = result.deadline_local
  } catch (e: any) {
    error.value = e?.response?._data?.message || 'Could not calculate.'
  } finally {
    previewing.value = false
  }
}

const formatLocal = (value: string) =>
  new Date(value.replace(' ', 'T')).toLocaleString(undefined, { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>

<style scoped>
.day-row + .day-row {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.time-input {
  padding: 2px 6px;
  font-size: 0.85rem;
  background: transparent;
  color: inherit;
}
</style>
