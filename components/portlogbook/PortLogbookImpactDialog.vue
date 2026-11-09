<template>
  <v-dialog :model-value="modelValue" max-width="900px" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="bg-primary text-white">
        <div class="flex items-center gap-2">
          <v-icon>mdi-ferry</v-icon>
          <span>Arrivals affected — {{ entry?.port?.name }}</span>
        </div>
      </v-card-title>
      <v-card-text class="pt-4">
        <div class="text-body-2 mb-3">
          Voyage arrivals to this port with an ETA between
          <b>{{ formatDateString(entry?.starts_at as string) }}</b>
          and
          <b>{{ entry?.ends_at ? formatDateString(entry.ends_at) : 'now (event still ongoing)' }}</b>.
        </div>
        <div v-if="loading" class="text-center py-6"><v-progress-circular indeterminate /></div>
        <div v-else-if="!impact.destinations.length" class="text-medium-emphasis py-4">No arrivals scheduled in this period.</div>
        <template v-else>
          <div class="mb-2 text-body-2">
            {{ impact.total }} arrival(s) · {{ impact.total_references }} reference(s)
          </div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Vessel</th>
                <th class="text-left">Voyage</th>
                <th class="text-left">Line</th>
                <th class="text-left">ETA</th>
                <th class="text-left">Arrival</th>
                <th class="text-right">References</th>
                <th class="text-left" width="50"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in impact.destinations" :key="d.id">
                <td>{{ d.vessel }}</td>
                <td>{{ d.voyage }}</td>
                <td>{{ d.line }}</td>
                <td>{{ formatDateOnlyString(d.eta_date) }}</td>
                <td>{{ d.arrival_date ? formatDateOnlyString(d.arrival_date) : '-' }}</td>
                <td class="text-right">{{ d.references }}</td>
                <td>
                  <v-btn v-if="d.voyage_id" size="x-small" variant="text" icon="mdi-open-in-new" :to="`/configuration/voyages/view-${d.voyage_id}`" target="_blank" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="secondary" @click="emit('update:modelValue', false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import type { IPortLogbookEntry } from '~/repository/modules/catalogs/portLogbook'

const props = defineProps<{ modelValue: boolean; entry?: IPortLogbookEntry | null }>()
const emit = defineEmits(['update:modelValue'])

const { $api } = useNuxtApp()
const loading = ref(false)
const impact = ref<{ total: number; total_references: number; destinations: any[] }>({ total: 0, total_references: 0, destinations: [] })

watch(
  () => props.modelValue,
  async (open) => {
    if (!open || !props.entry) return
    loading.value = true
    impact.value = { total: 0, total_references: 0, destinations: [] }
    try {
      impact.value = (await $api.portLogbook.getImpact(props.entry.id)) as any
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }
)
</script>
