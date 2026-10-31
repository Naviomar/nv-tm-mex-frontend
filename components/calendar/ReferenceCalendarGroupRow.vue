<template>
  <div
    class="group-row flex items-center gap-2 px-2 py-1.5 cursor-pointer"
    :class="{ 'group-row--compact': compact }"
    @click="$emit('open', group)"
  >
    <span class="group-row__bar shrink-0" :class="barClass"></span>
    <v-icon size="small" class="shrink-0 opacity-70">{{ group.none ? 'mdi-help-circle-outline' : icon }}</v-icon>
    <div class="min-w-0 flex-1">
      <div class="text-sm font-bold truncate">{{ group.none ? noneLabel : group.name }}</div>
      <div v-if="group.carrier && !group.none && group.carrier !== group.detail" class="text-xs font-semibold truncate">
        {{ group.carrier }}
      </div>
      <div v-if="group.detail" class="text-xs opacity-70 truncate">{{ group.detail }}</div>
    </div>
    <div class="flex shrink-0 flex-wrap items-center justify-end gap-1">
      <v-chip v-if="group.legacy" size="x-small" color="grey" variant="flat">TM1</v-chip>
      <v-chip v-if="group.noDate && !group.legacy" size="x-small" color="orange" variant="flat" :title="`Without ${dateLabel}`">
        {{ group.noDate }} no date
      </v-chip>
      <v-chip size="x-small" variant="tonal">
        {{ group.items.length }} ref{{ group.items.length === 1 ? '' : 's' }}
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ group: any; icon: string; noneLabel: string; dateLabel: string; compact?: boolean }>()
defineEmits<{ (e: 'open', group: any): void }>()

const barClass = computed(() => ({
  'group-row__bar--legacy': props.group.legacy,
  'group-row__bar--no-date': !props.group.legacy && props.group.allNoDate,
  'group-row__bar--cancelled': !props.group.legacy && props.group.allCancelled,
  'group-row__bar--ok': !props.group.legacy && !props.group.allNoDate && !props.group.allCancelled,
}))
</script>

<style scoped>
.group-row {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.group-row:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}
.group-row--compact {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  margin-bottom: 6px;
}
.group-row__bar {
  width: 4px;
  align-self: stretch;
  border-radius: 4px;
}
.group-row__bar--ok {
  background: #2563eb;
}
.group-row__bar--no-date {
  background: #f97316;
}
.group-row__bar--cancelled {
  background: #dc2626;
}
.group-row__bar--legacy {
  background: #9ca3af;
}
</style>
