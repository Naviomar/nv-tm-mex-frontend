<template>
  <div>
    <div class="mb-2">
      <div class="text-subtitle-1 font-weight-bold">{{ summary.title }}</div>
      <div v-if="summary.reference" class="text-body-2 text-medium-emphasis">
        {{ summary.reference.label }}: <span class="font-weight-medium text-high-emphasis">{{ summary.reference.value }}</span>
      </div>
    </div>

    <v-alert v-for="warning in summary.warnings" :key="warning" type="warning" variant="tonal" density="compact" class="mb-2">
      {{ warning }}
    </v-alert>

    <v-alert v-if="summary.action === 'delete' && summary.notes.length" type="warning" variant="tonal" density="compact" class="mb-2">
      {{ summary.notes[0] }}
    </v-alert>

    <div v-for="(section, si) in summary.sections" :key="si" class="tm-border rounded mb-2 overflow-hidden">
      <div v-if="section.heading && (summary.sections.length > 1 || summary.mode !== 'diff')" class="tm-muted px-3 py-1 text-body-2 font-weight-bold">
        {{ section.heading }}
      </div>
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
            v-for="(row, ri) in section.rows"
            :key="`${si}-${ri}`"
            class="align-top"
            :class="{ 'text-medium-emphasis': summary.mode === 'diff' && !row.changed }"
          >
            <td class="px-3 py-1 font-weight-medium" :class="{ 'whitespace-nowrap': summary.mode === 'diff' || row.after }">
              <v-icon v-if="row.status" :icon="statusIcon(row.status)" :color="statusColor(row.status)" size="16" class="mr-1" />
              {{ row.label }}
            </td>
            <template v-if="summary.mode === 'diff'">
              <td class="px-3 py-1" :class="{ 'text-decoration-line-through text-error': row.changed }">{{ row.before ?? '—' }}</td>
              <td class="px-3 py-1" :class="{ 'font-weight-bold text-success': row.changed }">{{ row.after ?? '—' }}</td>
            </template>
            <td v-else-if="row.after !== null && row.after !== ''" class="px-3 py-1">{{ row.after }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <v-alert v-if="summary.mode === 'diff' && summary.notes.length" type="info" variant="tonal" density="compact">
      {{ summary.notes[0] }}
    </v-alert>
    <div v-else-if="summary.action !== 'delete' && summary.notes.length" class="text-caption text-medium-emphasis">
      <div v-for="note in summary.notes" :key="note">{{ note }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IRequestSummary } from '~/repository/modules/catalogs/requestDecisions'

defineProps<{ summary: IRequestSummary }>()

const statusIcon = (status: string) =>
  ({ ok: 'mdi-check-circle', pending: 'mdi-close-circle', info: 'mdi-information' })[status] ?? 'mdi-circle-small'
const statusColor = (status: string) => ({ ok: 'success', pending: 'error', info: 'info' })[status] ?? undefined
</script>

<style scoped>
tbody tr + tr {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
