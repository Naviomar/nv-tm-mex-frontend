<template>
  <div class="cal-row flex items-center gap-3 px-3 py-2" :class="{ 'cal-row--compact': compact }">
    <span class="cal-row__bar shrink-0" :class="barClass"></span>
    <div class="min-w-0 flex-1 cursor-pointer" @click="$emit(item.legacy ? 'legacy' : 'view', item)">
      <div class="flex flex-wrap items-center gap-1">
        <span class="font-bold text-sm">{{ item.reference_number }}</span>
        <v-chip v-if="item.legacy" size="x-small" color="grey" variant="flat">TM1</v-chip>
        <v-chip v-if="!item.has_date" size="x-small" color="orange" variant="flat">No {{ dateLabel }}</v-chip>
        <v-chip v-if="item.cancelled" size="x-small" color="red" variant="flat">Cancelled</v-chip>
      </div>
      <div class="text-sm truncate">{{ item.consignee || '—' }}</div>
      <div class="text-xs opacity-70 truncate">
        <template v-if="item.carrier">{{ item.carrier }}</template>
        <template v-if="item.vessel_voyage"> · {{ item.vessel_voyage }}</template>
        <template v-if="item.master_awb"> · MAWB {{ item.master_awb }}</template>
      </div>
    </div>
    <div class="flex shrink-0 gap-1">
      <v-btn
        v-if="item.legacy"
        icon="mdi-information-outline"
        size="small"
        variant="text"
        color="grey-darken-1"
        density="comfortable"
        title="TM1 information"
        class="cursor-pointer"
        @click="$emit('legacy', item)"
      />
      <template v-else>
        <v-btn
          v-if="canEdit"
          icon="mdi-pencil-outline"
          size="small"
          variant="text"
          color="blue-lighten-2"
          density="comfortable"
          title="Edit"
          class="cursor-pointer"
          @click="$emit('edit', item)"
        />
        <v-btn
          v-if="canView"
          icon="mdi-eye-outline"
          size="small"
          variant="text"
          color="green-lighten-2"
          density="comfortable"
          title="View details"
          class="cursor-pointer"
          @click="$emit('view', item)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: any
  dateLabel: string
  canView: boolean
  canEdit: boolean
  compact?: boolean
}>()
defineEmits<{ (e: 'view', item: any): void; (e: 'edit', item: any): void; (e: 'legacy', item: any): void }>()

const barClass = computed(() => ({
  'cal-row__bar--ok': !props.item.legacy && props.item.has_date && !props.item.cancelled,
  'cal-row__bar--no-date': !props.item.legacy && !props.item.has_date && !props.item.cancelled,
  'cal-row__bar--cancelled': !props.item.legacy && props.item.cancelled,
  'cal-row__bar--legacy': props.item.legacy,
}))
</script>

<style scoped>
.cal-row {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.cal-row:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}
.cal-row--compact {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  margin-bottom: 6px;
}
.cal-row__bar {
  width: 4px;
  align-self: stretch;
  border-radius: 4px;
}
.cal-row__bar--ok {
  background: #2563eb;
}
.cal-row__bar--no-date {
  background: #f97316;
}
.cal-row__bar--cancelled {
  background: #dc2626;
}
.cal-row__bar--legacy {
  background: #9ca3af;
}
</style>
