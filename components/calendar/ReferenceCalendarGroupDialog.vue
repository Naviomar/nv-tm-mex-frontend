<template>
  <v-dialog :model-value="modelValue" max-width="680" scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card v-if="group">
      <v-card-title class="flex items-start justify-between gap-2 pt-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <v-icon size="small">{{ group.none ? 'mdi-help-circle-outline' : icon }}</v-icon>
            <span class="text-base font-bold truncate">{{ group.none ? noneLabel : group.name }}</span>
            <v-chip v-if="group.legacy" size="x-small" color="grey" variant="flat">TM1</v-chip>
          </div>
          <div class="text-xs font-normal opacity-70">
            <template v-if="group.detail">{{ group.detail }} · </template>{{ dayLabel }} · {{ group.items.length }}
            reference{{ group.items.length === 1 ? '' : 's' }}
            <template v-if="group.noDate && !group.legacy"> · {{ group.noDate }} without {{ dateLabel }}</template>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" class="cursor-pointer" @click="$emit('update:modelValue', false)" />
      </v-card-title>
      <div v-if="group.items.length > 6" class="px-4 pb-2">
        <v-text-field
          v-model="query"
          density="compact"
          label="Search in this list"
          prepend-inner-icon="mdi-magnify"
          hide-details
          clearable
        />
      </div>
      <v-divider />
      <v-card-text class="pa-0" style="max-height: 60vh">
        <div v-if="!visibleItems.length" class="p-6 text-center text-sm opacity-70">No references match</div>
        <ReferenceCalendarRow
          v-for="item in visibleItems"
          :key="`${item.legacy ? 'tm1' : 'tm2'}-${item.id}`"
          :item="item"
          :date-label="dateLabel"
          :can-view="canView(item)"
          :can-edit="canEdit(item)"
          @view="$emit('view', $event)"
          @edit="$emit('edit', $event)"
          @legacy="$emit('legacy', $event)"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  group: any | null
  icon: string
  noneLabel: string
  dateLabel: string
  dayLabel: string
  canView: (item: any) => boolean
  canEdit: (item: any) => boolean
}>()
defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'view', item: any): void
  (e: 'edit', item: any): void
  (e: 'legacy', item: any): void
}>()

const query = ref<string | null>('')
watch(() => props.modelValue, (open) => open && (query.value = ''))

const visibleItems = computed(() => {
  const q = (query.value || '').trim().toLowerCase()
  const list: any[] = props.group?.items ?? []
  return q
    ? list.filter((i) => [i.reference_number, i.consignee, i.carrier, i.master_awb].some((v) => v && String(v).toLowerCase().includes(q)))
    : list
})
</script>
