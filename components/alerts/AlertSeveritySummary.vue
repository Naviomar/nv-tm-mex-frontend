<template>
  <div v-if="segments.length" class="severity-summary">
    <div class="severity-summary__bar">
      <div
        v-for="seg in segments"
        :key="seg.key"
        class="severity-summary__segment"
        :class="`bg-${seg.color}`"
        :style="{ flexGrow: seg.count }"
        :title="`${seg.count} ${seg.label}`"
      />
    </div>
    <div class="severity-summary__legend">
      <span v-for="seg in segments" :key="seg.key" class="severity-summary__item">
        <v-icon size="12" :color="seg.color">{{ seg.icon }}</v-icon>
        <strong>{{ seg.count }}</strong> {{ seg.label }}
      </span>
      <span v-if="unread" class="severity-summary__item ml-auto">
        <span class="severity-summary__dot" /> <strong>{{ unread }}</strong> sin leer
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IAlert } from '~/repository/modules/alerts'
import { severityMeta } from '~/utils/alerts/presenters'

const props = defineProps<{ alerts: IAlert[] }>()

const segments = computed(() => {
  const counts = new Map<string, number>()
  for (const alert of props.alerts) counts.set(alert.severity, (counts.get(alert.severity) || 0) + 1)

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count, ...severityMeta(key) }))
    .sort((a, b) => a.order - b.order)
})

const unread = computed(() => props.alerts.filter((a) => !a.read_at).length)
</script>

<style scoped>
.severity-summary {
  padding: 10px 16px;
  background: rgb(var(--v-theme-surface));
}

.severity-summary__bar {
  display: flex;
  gap: 2px;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}

.severity-summary__segment {
  min-width: 4px;
}

.severity-summary__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 6px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.severity-summary__item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.severity-summary__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
}
</style>
