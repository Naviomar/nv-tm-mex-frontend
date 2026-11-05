<template>
  <div class="limit-panel rounded-lg pa-3 mb-4">
    <div class="flex items-center gap-2 mb-2">
      <v-icon size="18" color="primary">mdi-scale-balance</v-icon>
      <span class="font-medium">Request limit</span>
      <span class="d-inline-flex">
        <v-icon size="16" class="text-medium-emphasis">mdi-information-outline</v-icon>
        <v-tooltip activator="parent" location="top" max-width="380">
          An executive cannot have more rebate requested (not yet paid) than the overdue debt of all their customers together.
        </v-tooltip>
      </span>
      <v-spacer />
      <v-btn icon="mdi-refresh" size="x-small" variant="text" :loading="loading" @click="load" />
    </div>

    <div v-if="loading && !limits.length" class="text-sm text-medium-emphasis">Reading the account statements of the customers…</div>
    <div v-else-if="error" class="text-sm text-error">{{ error }}</div>
    <div v-else-if="needsExecutive" class="text-sm text-medium-emphasis">Choose an executive in the filters to see their limit.</div>
    <div v-else-if="!limits.length" class="text-sm text-medium-emphasis">No executive linked to your user.</div>

    <div v-for="limit in limits" :key="limit.executive_id" class="limit-row">
      <div class="font-medium text-sm mb-1">{{ limit.executive }}</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <div class="text-xs text-medium-emphasis">
            Overdue debt of their customers
            <v-icon v-if="limit.customers.length" size="14">mdi-chevron-down</v-icon>
            <v-menu v-if="limit.customers.length" activator="parent" location="bottom start">
              <v-card max-width="420">
                <v-table density="compact">
                  <tbody>
                    <tr v-for="row in limit.customers" :key="row.customer">
                      <td>{{ row.customer }}</td>
                      <td class="text-right whitespace-nowrap">{{ formatToCurrency(row.amount) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
            </v-menu>
          </div>
          <div class="text-lg font-bold">{{ formatToCurrency(limit.debt) }}</div>
        </div>
        <div>
          <div class="text-xs text-medium-emphasis">Requested, not paid yet</div>
          <div class="text-lg font-bold text-warning">{{ formatToCurrency(limit.requested) }}</div>
        </div>
        <div>
          <div class="text-xs text-medium-emphasis">Can still request</div>
          <div class="text-lg font-bold" :class="limit.available > 0 ? 'text-success' : 'text-error'">{{ formatToCurrency(limit.available) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ executiveId?: number | null }>()
const emit = defineEmits<{ (e: 'loaded', limits: any[]): void }>()

const { $api } = useNuxtApp()
const loading = ref(false)
const error = ref('')
const limits = ref<any[]>([])
const needsExecutive = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await $api.rebate.getDebtLimit(props.executiveId ? { executive_id: props.executiveId } : {})
    limits.value = data.executives ?? []
    needsExecutive.value = !!data.needs_executive
  } catch {
    limits.value = []
    error.value = 'Could not read the request limit'
  } finally {
    loading.value = false
    emit('loaded', limits.value)
  }
}

watch(() => props.executiveId, load)
onMounted(load)

defineExpose({ load })
</script>

<style scoped>
.limit-panel {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
}
.limit-row + .limit-row {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  margin-top: 8px;
  padding-top: 8px;
}
</style>
