<template>
  <div v-if="sections?.length" class="flex flex-col gap-4">
    <div v-for="section in sections" :key="section.key">
      <div v-if="showTitle" class="flex items-center gap-2 mb-1">
        <v-icon size="small" class="opacity-70">{{ section.icon }}</v-icon>
        <span class="text-sm font-bold">{{ section.title }}</span>
        <v-chip size="x-small" variant="tonal">{{ section.rows.length }}</v-chip>
      </div>
      <div class="legacy-section-table tm-border rounded">
        <v-table density="compact" style="height: auto">
          <thead>
            <tr>
              <th v-for="col in section.columns" :key="col.key" class="text-left whitespace-nowrap">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in section.rows" :key="i">
              <td v-for="col in section.columns" :key="col.key" class="text-sm" :class="cellClass(col.key)">
                {{ format(row[col.key]) }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface LegacySection {
  key: string
  title: string
  icon: string
  columns: { key: string; label: string }[]
  rows: Record<string, any>[]
}

withDefaults(defineProps<{ sections?: LegacySection[]; showTitle?: boolean }>(), { showTitle: true })

// Free text columns wrap; the rest stay on one line
const wrapKeys = ['note', 'notification', 'recipients', 'comment', 'shipper']
const cellClass = (key: string) => (wrapKeys.includes(key) ? 'whitespace-normal break-words' : 'whitespace-nowrap')

const format = (value: any) => (value === null || value === undefined || value === '' ? '—' : value)
</script>

<style scoped>
.legacy-section-table {
  overflow-x: auto;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
