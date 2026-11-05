<template>
  <article
    class="alert-card"
    :class="{ 'alert-card--unread': !alert.read_at }"
    :style="{ '--alert-accent': `rgb(var(--v-theme-${severity.color}))` }"
    @click="emit('open', alert)"
  >
    <v-avatar :color="severity.color" size="36" class="alert-card__avatar">
      <v-icon :icon="alert.icon || severity.icon" color="white" size="18" />
    </v-avatar>

    <div class="alert-card__content">
      <header class="alert-card__header">
        <span v-if="!alert.read_at" class="alert-card__dot" title="Sin leer" />
        <h4 class="alert-card__headline">{{ view.headline }}</h4>
        <time class="alert-card__time" :title="absoluteDate">{{ relativeDate }}</time>
      </header>

      <div v-if="view.subject || showCategory" class="alert-card__tags">
        <v-chip v-if="view.subject" size="small" variant="tonal" :color="severity.color" class="alert-card__subject">
          <v-icon v-if="view.subjectIcon" start size="14">{{ view.subjectIcon }}</v-icon>
          {{ view.subject }}
        </v-chip>
        <v-chip v-if="showCategory && alert.category" size="x-small" variant="outlined">
          {{ alert.category }}
        </v-chip>
      </div>

      <AlertBuySellBars
        v-if="view.visual?.kind === 'buy-sell'"
        :buy="view.visual.buy"
        :sell="view.visual.sell"
        :difference="view.visual.difference"
        :margin-pct="view.visual.marginPct"
        class="mt-2"
      />

      <div v-else-if="view.visual?.kind === 'mail'" class="alert-card__mail mt-2">
        <div class="alert-card__mail-outcome" :class="`text-${mailOutcome!.color}`">
          <v-icon size="16">{{ mailOutcome!.icon }}</v-icon>
          <span>{{ mailOutcome!.label }}</span>
        </div>
        <div class="alert-card__fact">
          <v-icon size="14" class="tm-muted">mdi-bell-ring-outline</v-icon>
          <span class="tm-muted">Notificación:</span>
          <span>{{ view.visual.notification }}</span>
        </div>
        <p class="alert-card__hint">{{ mailOutcome!.hint }}</p>
      </div>

      <div v-for="fact in view.facts" :key="fact.label" class="alert-card__fact mt-1">
        <v-icon v-if="fact.icon" size="14" class="tm-muted">{{ fact.icon }}</v-icon>
        <span class="tm-muted">{{ fact.label }}:</span>
        <span>{{ fact.value }}</span>
      </div>

      <p v-if="view.body" class="alert-card__body" :class="{ 'alert-card__body--clamped': isLong && !expanded }">
        {{ view.body }}
      </p>
      <button v-if="isLong" class="alert-card__more" @click.stop="expanded = !expanded">
        {{ expanded ? 'Ver menos' : 'Ver más' }}
      </button>

      <footer class="alert-card__footer">
        <v-btn
          v-if="view.cta && alert.action_url"
          size="small"
          variant="tonal"
          :color="severity.color"
          :prepend-icon="view.cta.icon"
          class="alert-card__cta"
          @click.stop="emit('open', alert)"
        >
          {{ view.cta.label }}
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="!alert.read_at"
          icon="mdi-check"
          size="x-small"
          variant="text"
          color="success"
          title="Marcar como leída"
          @click.stop="emit('read', alert)"
        />
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          title="Descartar"
          @click.stop="emit('dismiss', alert)"
        />
      </footer>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { IAlert } from '~/repository/modules/alerts'
import { MAIL_OUTCOMES, presentAlert, severityMeta } from '~/utils/alerts/presenters'

const props = withDefaults(defineProps<{
  alert: IAlert
  showCategory?: boolean
}>(), {
  showCategory: false,
})

const emit = defineEmits<{
  (e: 'open', alert: IAlert): void
  (e: 'read', alert: IAlert): void
  (e: 'dismiss', alert: IAlert): void
}>()

const expanded = ref(false)

const view = computed(() => presentAlert(props.alert))
const severity = computed(() => severityMeta(props.alert.severity))
const mailOutcome = computed(() => view.value.visual?.kind === 'mail' ? MAIL_OUTCOMES[view.value.visual.outcome] : null)
const isLong = computed(() => (view.value.body?.length ?? 0) > 220)

const absoluteDate = computed(() => new Date(props.alert.created_at).toLocaleString('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
}))

const relativeDate = computed(() => {
  const date = new Date(props.alert.created_at)
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffMins < 1440) return `hace ${Math.floor(diffMins / 60)} h`
  if (diffMins < 10080) return `hace ${Math.floor(diffMins / 1440)} d`
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
})
</script>

<style scoped>
.alert-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 12px 14px 8px 16px;
  cursor: pointer;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: background 0.2s ease;
}

.alert-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--alert-accent);
  opacity: 0.35;
}

.alert-card--unread::before {
  opacity: 1;
}

.alert-card--unread {
  background: rgba(var(--v-theme-primary), 0.035);
}

.alert-card:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}

.alert-card__avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-card__content {
  flex: 1;
  min-width: 0;
}

.alert-card__header {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.alert-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  flex-shrink: 0;
  align-self: center;
}

.alert-card__headline {
  flex: 1;
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.alert-card__time {
  font-size: 0.7rem;
  white-space: nowrap;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.alert-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.alert-card__subject {
  height: auto !important;
  min-height: 24px;
  white-space: normal;
  font-weight: 600;
}

.alert-card__mail {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.alert-card__mail-outcome {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.alert-card__fact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 0.76rem;
  line-height: 1.4;
  margin-top: 4px;
  overflow-wrap: anywhere;
}

.alert-card__hint {
  margin: 4px 0 0;
  font-size: 0.72rem;
  line-height: 1.4;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.alert-card__body {
  margin: 6px 0 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: rgba(var(--v-theme-on-surface), 0.78);
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.alert-card__body--clamped {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alert-card__more {
  margin-top: 2px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.74rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.alert-card__footer {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 8px;
}

.alert-card__cta {
  text-transform: none;
  letter-spacing: 0;
}
</style>
