<template>
  <v-dialog :model-value="modelValue" max-width="960" scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="tm-card-header pt-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base font-bold">{{ detail?.reference || reference?.reference_number }}</span>
            <v-chip size="x-small" class="tm1-chip" variant="flat">TM1</v-chip>
            <v-chip v-if="detail?.cancelled" size="x-small" color="red" variant="flat">Cancelled</v-chip>
          </div>
          <ReferenceOriginBands
            class="my-1 items-start"
            :tracker-number="detail?.origin?.tracker_reference"
            :chile-reference="detail?.origin?.chile_reference"
          />
          <div class="text-xs font-normal opacity-70">Read-only information from the legacy system</div>
        </div>
        <div class="flex items-center gap-1">
          <v-btn
            v-if="viewPath"
            :to="viewPath"
            size="small"
            variant="tonal"
            prepend-icon="mdi-eye-outline"
            @click="$emit('update:modelValue', false)"
          >
            View details
          </v-btn>
          <v-btn icon="mdi-close" variant="text" size="small" class="cursor-pointer" @click="$emit('update:modelValue', false)" />
        </div>
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

          <LegacyReferenceSections :sections="detail.sections" class="mt-6" />

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
// Services that have the full TM1 view page
const viewPath = computed(() => {
  const id = props.reference?.id
  const base: Record<string, string> = { 'sea-import': '/maritime/import/legacy/', 'sea-export': '/maritime/export/legacy/', 'air-import': '/air/import/legacy/' }
  return id && base[props.kind] ? `${base[props.kind]}${id}` : null
})
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
