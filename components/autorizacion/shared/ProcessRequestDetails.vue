<template>
  <div>
    <template v-if="summary">
      <div class="mb-2">
        <div class="text-subtitle-1 font-weight-bold">{{ summary.title }}</div>
        <div v-if="summary.reference" class="text-body-2 text-medium-emphasis">
          {{ summary.reference.label }}: <span class="font-weight-medium text-high-emphasis">{{ summary.reference.value }}</span>
        </div>
      </div>

      <v-alert v-if="summary.action === 'delete'" type="warning" variant="tonal" density="compact" class="mb-2">
        {{ summary.notes[0] }}
      </v-alert>

      <div v-for="(section, si) in summary.sections" :key="si" class="tm-border rounded mb-2 overflow-hidden">
        <div v-if="summary.sections.length > 1" class="tm-muted px-3 py-1 text-body-2 font-weight-bold">{{ section.heading }}</div>
        <table class="w-full text-sm border-collapse">
          <thead v-if="summary.mode === 'diff'">
            <tr class="tm-muted text-left text-medium-emphasis text-caption">
              <th class="px-3 py-1 font-weight-medium">Field</th>
              <th class="px-3 py-1 font-weight-medium">Current</th>
              <th class="px-3 py-1 font-weight-medium">Requested</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in section.rows"
              :key="row.label"
              class="align-top"
              :class="{ 'text-medium-emphasis': summary.mode === 'diff' && !row.changed }"
            >
              <td class="px-3 py-1 font-weight-medium whitespace-nowrap">{{ row.label }}</td>
              <template v-if="summary.mode === 'diff'">
                <td class="px-3 py-1" :class="{ 'text-decoration-line-through text-error': row.changed }">{{ row.before ?? '—' }}</td>
                <td class="px-3 py-1" :class="{ 'font-weight-bold text-success': row.changed }">{{ row.after ?? '—' }}</td>
              </template>
              <td v-else class="px-3 py-1">{{ row.after ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <v-alert v-if="summary.mode === 'diff' && summary.notes.length" type="info" variant="tonal" density="compact">
        {{ summary.notes[0] }}
      </v-alert>
      <div v-else-if="summary.action !== 'delete' && summary.notes.length" class="text-caption text-medium-emphasis">{{ summary.notes[0] }}</div>
    </template>

    <template v-else-if="charges.length">
      <div class="divide-y divide-gray-100 rounded border border-gray-200 overflow-hidden">
        <div v-for="(c, ci) in charges" :key="ci" class="flex items-center gap-2 px-2 py-1.5 text-sm bg-gray-50">
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 truncate">{{ c.charge_name }}</div>
            <div v-if="c.invoice_number" class="text-xs text-gray-400">Invoice #{{ c.invoice_number }}</div>
          </div>
          <div class="font-semibold text-gray-700 whitespace-nowrap">${{ Number(c.amount).toFixed(2) }}</div>
        </div>
      </div>
    </template>

    <template v-else-if="operations.length">
      <div class="divide-y divide-gray-100 rounded border border-gray-200 overflow-hidden">
        <div v-for="(op, oi) in operations" :key="oi" class="px-2 py-1.5 text-sm bg-gray-50">
          <span class="font-medium capitalize">{{ op.action }}</span>
          <span class="ml-1">{{ op.description || op.summary || '' }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="fields.length">
      <table class="w-full text-sm border-collapse">
        <tbody>
          <tr v-for="f in fields" :key="f.key" class="border-b border-gray-100 align-top">
            <td class="py-1 pr-3 font-medium text-gray-600 whitespace-nowrap capitalize">{{ f.label }}</td>
            <td class="py-1 text-gray-900">
              <template v-if="f.isObject">
                <table class="w-full text-xs border border-gray-200 rounded overflow-hidden">
                  <tbody>
                    <tr v-for="sub in f.entries" :key="sub.key" class="border-b border-gray-100 last:border-0">
                      <td class="py-1 px-2 font-medium text-gray-500 whitespace-nowrap capitalize bg-gray-50">{{ sub.label }}</td>
                      <td class="py-1 px-2 break-all">{{ sub.value }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
              <template v-else>
                <span class="break-all">{{ f.value }}</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <div v-else class="text-sm text-gray-500">No additional data</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  processData: Record<string, any> | null | undefined
  /** Human description of a charge add/edit/delete request (ProcessRequest.charge_summary) */
  summary?: {
    action: 'add' | 'edit' | 'delete'
    title: string
    mode: 'diff' | 'details'
    reference: { label: string; value: string } | null
    sections: { heading: string; rows: { label: string; before: string | null; after: string | null; changed: boolean }[] }[]
    notes: string[]
  } | null
}>()

const keyLabels: Record<string, string> = {
  referencia_id: 'Referencia',
  air_reference_id: 'Air Reference',
  reference_ids: 'References',
  charge_id: 'Charge',
}

const humanizeKey = (key: string) => keyLabels[key] ?? String(key).replace(/_/g, ' ')

const tryParseJson = (val: any) => {
  if (typeof val !== 'string') return val
  const trimmed = val.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return val
  try {
    return JSON.parse(trimmed)
  } catch {
    return val
  }
}

const charges = computed(() => (props.summary ? [] : props.processData?.charges ?? []))
const operations = computed(() => (props.summary ? [] : props.processData?.operations ?? []))

const fields = computed(() => {
  if (!props.processData || props.summary || charges.value.length || operations.value.length) return []
  return Object.entries(props.processData)
    .filter(([key]) => !['charges', 'operations'].includes(key))
    .map(([key, rawVal]) => {
      const val = tryParseJson(rawVal)
      const isObject = val && typeof val === 'object'
      return {
        key,
        label: humanizeKey(key),
        value: isObject ? '' : String(val ?? ''),
        isObject,
        entries: isObject
          ? Object.entries(val).map(([k, v]) => ({
              key: k,
              label: humanizeKey(k),
              value: typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? ''),
            }))
          : [],
      }
    })
})
</script>

<style scoped>
tbody tr + tr {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
