<template>
  <v-dialog :model-value="modelValue" max-width="640" scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="flex items-start justify-between gap-2 pt-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base font-bold">{{ detail?.reference || reference?.reference_number }}</span>
            <v-chip size="x-small" color="grey" variant="flat">TM1</v-chip>
            <v-chip v-if="detail?.cancelled" size="x-small" color="red" variant="flat">Cancelled</v-chip>
          </div>
          <div class="text-xs font-normal opacity-70">Read-only information from the legacy system</div>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" class="cursor-pointer" @click="$emit('update:modelValue', false)" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pt-4" style="max-height: 70vh">
        <div v-if="loading" class="flex justify-center py-8"><v-progress-circular indeterminate /></div>
        <v-alert v-else-if="error" type="warning" variant="tonal" density="compact">{{ error }}</v-alert>
        <template v-else-if="detail">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <div v-for="f in detail.fields" :key="f.label" :class="{ 'sm:col-span-2': longFields.includes(f.label) }">
              <div class="text-xs opacity-60">{{ f.label }}</div>
              <div class="text-sm break-words">{{ f.value }}</div>
            </div>
          </div>

          <div v-if="detail.containers?.length" class="mt-4">
            <div class="text-xs opacity-60 mb-1">Containers</div>
            <div class="flex flex-wrap gap-1">
              <v-chip v-for="c in detail.containers" :key="c" size="small" color="green-lighten-2">{{ c }}</v-chip>
            </div>
          </div>

          <div v-if="detail.flights?.length" class="mt-4">
            <div class="text-xs opacity-60 mb-1">Flights</div>
            <div v-for="(f, i) in detail.flights" :key="i" class="text-sm flex flex-wrap gap-x-2">
              <span class="font-semibold">{{ f.flight || '—' }}</span>
              <span>{{ f.from }} → {{ f.to }}</span>
              <span v-if="f.departure" class="opacity-70">{{ f.departure }}</span>
            </div>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; kind: string; reference: any | null }>()
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const { $api } = useNuxtApp()
const longFields = ['Notes', 'Cancellation note', 'Consignee', 'Shipper', 'Freight forwarder']

const detail = ref<any>(null)
const loading = ref(false)
const error = ref('')

watch(
  () => [props.modelValue, props.reference?.id] as const,
  async ([open, id]) => {
    if (!open || !id) return
    detail.value = null
    error.value = ''
    loading.value = true
    try {
      detail.value = await $api.referencias.getCalendarLegacyDetail(props.kind, id)
    } catch (e: any) {
      error.value = e?.response?.status === 404 ? 'Reference not found in TM1.' : 'TM1 information is not available right now.'
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>
