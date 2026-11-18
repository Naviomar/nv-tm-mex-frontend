<template>
  <v-dialog :model-value="modelValue" max-width="860px" scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card v-if="entry">
      <v-card-title class="bg-primary text-white">
        <div class="flex items-center gap-2">
          <v-icon>{{ eventIcon(entry.event_type) }}</v-icon>
          <span>{{ entryTitle(entry) }}</span>
          <v-spacer />
          <v-chip size="small" variant="flat" :color="statusMeta(entry.status).color" :prepend-icon="statusMeta(entry.status).icon">
            {{ statusMeta(entry.status).label }}
          </v-chip>
        </div>
      </v-card-title>
      <v-card-text class="pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-4">
          <div>
            <div class="text-caption text-medium-emphasis">Port</div>
            <div class="font-weight-medium">{{ entry.port?.name }} <span class="text-medium-emphasis">{{ entry.port?.country?.name }}</span></div>
          </div>
          <div>
            <div class="text-caption text-medium-emphasis">Event type</div>
            <div>{{ entry.event_type_label }}</div>
          </div>
          <div>
            <div class="text-caption text-medium-emphasis">Port operations</div>
            <v-chip size="small" variant="tonal" :color="operationsColor(entry.operations_status)" :prepend-icon="operationsIcon(entry.operations_status)">
              {{ entry.operations_status_label }}
            </v-chip>
          </div>
          <div>
            <div class="text-caption text-medium-emphasis">Duration</div>
            <div>{{ duration(entry) }}</div>
          </div>
          <div>
            <div class="text-caption text-medium-emphasis">Starts</div>
            <div>{{ formatDateString(entry.starts_at) }}</div>
          </div>
          <div>
            <div class="text-caption text-medium-emphasis">Ends</div>
            <div>{{ entry.ends_at ? formatDateString(entry.ends_at) : 'Ongoing' }}</div>
          </div>
          <div v-if="entry.description" class="md:col-span-2">
            <div class="text-caption text-medium-emphasis">Notes</div>
            <div class="whitespace-pre-line">{{ entry.description }}</div>
          </div>
          <div class="md:col-span-2 text-caption text-medium-emphasis">
            Registered by {{ entry.creator?.name ?? '-' }} · {{ formatDateString(entry.created_at) }}
          </div>
        </div>

        <v-divider class="mb-3" />
        <div class="flex items-center gap-2 mb-2">
          <v-icon>mdi-ferry</v-icon>
          <span class="font-weight-medium">Arrivals in this period</span>
          <v-chip v-if="!loading" size="small" variant="tonal">{{ impact.total }} arrival(s) · {{ impact.total_references }} reference(s)</v-chip>
        </div>
        <div class="text-caption text-medium-emphasis mb-2">
          Voyage arrivals to this port with an ETA from the start of the event
          {{ entry.ends_at ? 'to its end' : 'onwards (event still ongoing)' }}.
        </div>
        <div v-if="loading" class="text-center py-4"><v-progress-circular indeterminate size="28" /></div>
        <div v-else-if="!impact.destinations.length" class="text-medium-emphasis py-2">No arrivals scheduled in this period.</div>
        <v-table v-else density="compact" fixed-header height="260">
          <thead>
            <tr>
              <th class="text-left">Vessel</th>
              <th class="text-left">Voyage</th>
              <th class="text-left">Line</th>
              <th class="text-left">ETA</th>
              <th class="text-left">Arrival</th>
              <th class="text-right">References</th>
              <th width="40"></th>
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
      </v-card-text>
      <v-card-actions>
        <Can permission="port-logbook-delete">
          <v-btn color="error" variant="text" prepend-icon="mdi-delete-outline" @click="emit('delete', entry)">Delete</v-btn>
        </Can>
        <v-spacer />
        <Can permission="port-logbook-edit">
          <v-btn v-if="entry.status === 'active'" color="success" variant="tonal" prepend-icon="mdi-lock-open-check-outline" @click="emit('close-event', entry)">
            Close event
          </v-btn>
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-pencil-outline" @click="emit('edit', entry)">Edit</v-btn>
        </Can>
        <v-btn color="secondary" @click="emit('update:modelValue', false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import type { IPortLogbookEntry } from '~/repository/modules/catalogs/portLogbook'

const props = defineProps<{ modelValue: boolean; entry?: IPortLogbookEntry | null }>()
const emit = defineEmits(['update:modelValue', 'edit', 'close-event', 'delete'])

const { $api } = useNuxtApp()
const { eventIcon, operationsColor, operationsIcon, statusMeta, entryTitle, duration } = usePortLogbook()

const loading = ref(false)
const impact = ref<{ total: number; total_references: number; destinations: any[] }>({ total: 0, total_references: 0, destinations: [] })

watch(
  () => [props.modelValue, props.entry?.id, props.entry?.starts_at, props.entry?.ends_at],
  async () => {
    if (!props.modelValue || !props.entry) return
    loading.value = true
    impact.value = { total: 0, total_references: 0, destinations: [] }
    try {
      impact.value = (await $api.portLogbook.getImpact(props.entry.id)) as any
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)
</script>
