<template>
  <v-dialog v-model="model" max-width="960" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center ga-2 pa-4">
        <v-icon color="deep-purple">mdi-timeline-clock-outline</v-icon>
        <span class="text-h6">Invoice traceability</span>
        <v-spacer />
        <v-btn-toggle v-model="view" mandatory density="compact" color="deep-purple" variant="outlined" divided>
          <v-btn value="request" size="small" prepend-icon="mdi-file-document-outline">By request</v-btn>
          <v-btn value="invoice" size="small" prepend-icon="mdi-receipt-text-outline">By invoice</v-btn>
        </v-btn-toggle>
        <v-btn icon="mdi-close" variant="text" size="small" @click="model = false" />
      </v-card-title>

      <div class="px-4 pb-3 grid grid-cols-1 md:grid-cols-3 gap-3" @keyup.enter="search">
        <v-text-field
          v-model="filters.search"
          density="compact"
          label="CFDI folio, UUID or request folio"
          prepend-inner-icon="mdi-magnify"
          hide-details
          clearable
          @click:clear="clearSearch"
        />
        <ASupplierSearch v-model="filters.supplier_id" />
        <div class="flex gap-2 items-start">
          <v-btn color="primary" @click="search">Search</v-btn>
          <v-btn variant="text" @click="reset">Clear</v-btn>
        </div>
      </div>

      <v-divider />

      <v-card-text class="pa-4" style="min-height: 320px">
        <div v-if="loading" class="d-flex justify-center py-12">
          <v-progress-circular indeterminate color="deep-purple" />
        </div>

        <div v-else-if="!cfdis.length" class="text-center text-medium-emphasis py-12">
          <v-icon size="40" class="mb-2">mdi-file-search-outline</v-icon>
          <div>No invoices found.</div>
        </div>

        <v-expansion-panels v-else-if="view === 'request'" variant="accordion" multiple>
          <v-expansion-panel v-for="req in cfdis" :key="`req-${req.id}`">
            <v-expansion-panel-title>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 w-full pr-2">
                <div class="font-semibold">{{ req.folio }}</div>
                <v-chip size="x-small" label :color="req.status === 'cancelled' ? 'error' : 'success'" variant="flat">
                  {{ req.status === 'cancelled' ? 'Cancelled' : 'Active' }}
                </v-chip>
                <div class="text-medium-emphasis text-body-2">{{ req.supplier }}</div>
                <v-spacer />
                <span class="text-caption text-medium-emphasis">{{ formatDateString(req.created_at) }}</span>
                <v-chip size="x-small" label color="deep-purple" variant="tonal">
                  {{ req.cfdis.length }} invoice(s)
                </v-chip>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <div class="text-body-2 mb-3">
                Created by <strong>{{ req.created_by || 'System' }}</strong>
                · {{ formatToCurrency(req.amount) }} {{ getCurrencyName(req.currency_id) }}
                <template v-if="req.status === 'cancelled'">
                  <br />Cancelled by <strong>{{ req.cancelled_by || 'System' }}</strong>
                  on {{ formatDateString(req.cancelled_at) }}
                  <template v-if="req.cancelled_reason"> — {{ req.cancelled_reason }}</template>
                </template>
              </div>

              <div class="space-y-2">
                <div v-for="cfdi in req.cfdis" :key="`req-${req.id}-cfdi-${cfdi.id}`" class="tm-panel rounded-lg pa-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-semibold">{{ cfdi.folio || cfdi.uuid }}</span>
                    <v-chip size="x-small" label :color="eventMeta[cfdi.outcome].color" variant="flat">
                      {{ eventMeta[cfdi.outcome].label }}
                    </v-chip>
                    <v-spacer />
                    <span class="text-caption text-medium-emphasis">
                      Linked {{ formatDateString(cfdi.linked_at) }} · {{ cfdi.linked_by || 'System' }}
                    </span>
                  </div>

                  <div v-if="cfdi.unlinked_at" class="text-caption text-medium-emphasis mt-1">
                    {{ eventMeta[cfdi.outcome].label }} {{ formatDateString(cfdi.unlinked_at) }} · {{ cfdi.unlinked_by || 'System' }}
                    <template v-if="cfdi.authorization">
                      · requested by {{ cfdi.authorization.requested_by || '—' }}
                      <template v-if="cfdi.authorization.approved_by">, approved by {{ cfdi.authorization.approved_by }}</template>
                    </template>
                  </div>

                  <div class="flex flex-wrap items-center gap-1 mt-2">
                    <v-chip v-for="concept in cfdi.concepts" :key="`c-${concept.id}`" size="x-small" variant="outlined">
                      {{ concept.reference_number }} · {{ formatToCurrency(concept.amount) }}
                    </v-chip>
                    <v-spacer />
                    <span class="text-caption text-medium-emphasis">Also in</span>
                    <v-chip
                      v-for="other in cfdi.other_requests"
                      :key="`o-${other.id}`"
                      size="x-small"
                      label
                      :color="other.status === 'cancelled' ? 'error' : 'success'"
                      variant="tonal"
                    >
                      {{ other.folio }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels v-else variant="accordion" multiple>
          <v-expansion-panel v-for="cfdi in cfdis" :key="`cfdi-${cfdi.id}`">
            <v-expansion-panel-title>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 w-full pr-2">
                <div class="font-semibold">{{ cfdi.folio || cfdi.uuid }}</div>
                <div class="text-medium-emphasis text-body-2">{{ cfdi.supplier }}</div>
                <v-spacer />
                <v-chip size="x-small" label color="deep-purple" variant="tonal">
                  {{ cfdi.requests_count }} requests
                </v-chip>
                <v-chip size="x-small" label color="error" variant="tonal">
                  {{ cfdi.unlinks_count }} unlinked
                </v-chip>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <div class="text-caption text-medium-emphasis mb-3">
                UUID {{ cfdi.uuid }} · Invoice date {{ cfdi.invoice_date }}
              </div>

              <v-timeline density="compact" side="end" align="start" truncate-line="both">
                <v-timeline-item
                  v-for="(event, i) in cfdi.events"
                  :key="`event-${cfdi.id}-${i}`"
                  size="small"
                  :dot-color="eventMeta[event.type].color"
                  :icon="eventMeta[event.type].icon"
                >
                  <div class="tm-panel rounded-lg pa-3">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <v-chip size="x-small" label :color="eventMeta[event.type].color" variant="flat">
                        {{ eventMeta[event.type].label }}
                      </v-chip>
                      <span class="font-semibold">{{ event.request_folio }}</span>
                      <v-spacer />
                      <span class="text-caption text-medium-emphasis">{{ formatDateString(event.at) }}</span>
                    </div>

                    <div class="text-body-2">
                      <v-icon size="14" class="mr-1">mdi-account-outline</v-icon>{{ event.user || 'System' }}
                    </div>

                    <div v-if="event.reason" class="text-body-2 mt-1">
                      <span class="text-medium-emphasis">Reason:</span> {{ event.reason }}
                    </div>

                    <div v-if="event.authorization" class="text-caption text-medium-emphasis mt-1">
                      Requested by {{ event.authorization.requested_by || '—' }}
                      <template v-if="event.authorization.approved_by">
                        · approved by {{ event.authorization.approved_by }}
                      </template>
                      <template v-if="event.authorization.reason"> — “{{ event.authorization.reason }}”</template>
                    </div>

                    <div class="flex flex-wrap gap-1 mt-2">
                      <v-chip
                        v-for="concept in event.concepts"
                        :key="`concept-${concept.id}`"
                        size="x-small"
                        variant="outlined"
                      >
                        {{ concept.reference_number }} · {{ formatToCurrency(concept.amount) }}
                      </v-chip>
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-4">
        <v-pagination
          v-if="pagination.last_page > 1"
          v-model="pagination.current_page"
          :length="pagination.last_page"
          density="compact"
          rounded="circle"
          :total-visible="5"
          @update:model-value="load"
        />
        <v-spacer />
        <span class="text-caption text-medium-emphasis">{{ pagination.total }} {{ view === 'request' ? 'request(s)' : 'invoice(s)' }}</span>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ default: false })

const { $api } = useNuxtApp()

const eventMeta: Record<string, { label: string; color: string; icon: string }> = {
  active: { label: 'Linked', color: 'success', icon: 'mdi-link-variant' },
  linked: { label: 'Linked', color: 'success', icon: 'mdi-link-variant' },
  unlinked: { label: 'Unlinked', color: 'warning', icon: 'mdi-link-variant-off' },
  request_cancelled: { label: 'Request cancelled', color: 'error', icon: 'mdi-cancel' },
}

const view = ref<'request' | 'invoice'>('request')
const loading = ref(false)
const cfdis = ref<any[]>([])
const filters = ref({ search: '', supplier_id: '' as any })
const pagination = ref({ current_page: 1, last_page: 1, total: 0 })

const load = async () => {
  try {
    loading.value = true
    const response: any = await $api.supplierReqPayments.getInvoiceTimeline({
      query: {
        page: pagination.value.current_page,
        view: view.value,
        search: filters.value.search || undefined,
        supplier_id: filters.value.supplier_id || undefined,
      },
    })
    cfdis.value = response.data
    pagination.value = {
      current_page: response.current_page,
      last_page: response.last_page,
      total: response.total,
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const search = () => {
  pagination.value.current_page = 1
  load()
}

const clearSearch = () => {
  filters.value.search = ''
  search()
}

const reset = () => {
  filters.value = { search: '', supplier_id: '' }
  search()
}

watch(model, (open) => {
  if (open && !cfdis.value.length) load()
})

watch(view, () => {
  cfdis.value = []
  search()
})
</script>
