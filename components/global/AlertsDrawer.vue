<template>
  <div>
    <transition name="alerts-slide">
      <div v-if="alertsStore.isDrawerOpen" class="alerts-panel">
        <v-card class="alerts-card elevation-12">
          <!-- Header -->
          <v-card-title class="alerts-card__header">
            <div class="d-flex align-center gap-2">
              <v-avatar size="32" class="alerts-card__avatar">
                <v-icon size="20">mdi-bell-outline</v-icon>
              </v-avatar>
              <div class="d-flex flex-column">
                <span class="alerts-card__title">Notificaciones</span>
                <span class="alerts-card__subtitle">
                  {{ alertsStore.unreadCount > 0
                    ? `${alertsStore.unreadCount} sin leer`
                    : 'Todo al día' }}
                </span>
              </div>
            </div>
            <div class="d-flex gap-1 align-center">
              <v-btn
                icon="mdi-history"
                variant="text"
                size="small"
                class="alerts-card__action"
                title="Ver historial"
                @click="showAllAlertsModal = true"
              />
              <v-btn
                v-if="alertsStore.alerts.length > 0 && alertsStore.unreadCount > 0"
                icon="mdi-check-all"
                variant="text"
                size="small"
                class="alerts-card__action"
                title="Marcar todas como leídas"
                @click="markAllRead"
              />
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                class="alerts-card__close"
                @click="alertsStore.closeDrawer"
              />
            </div>
          </v-card-title>

          <v-divider class="alerts-card__divider" />

          <!-- Section navigation tabs -->
          <div class="alerts-nav">
            <button
              class="alerts-nav__item"
              :class="{ 'alerts-nav__item--active': !selectedSection }"
              @click="selectedSection = null"
            >
              <v-icon size="16">mdi-bell-outline</v-icon>
              <span>Todas</span>
              <v-badge
                v-if="alertsStore.unreadCount > 0"
                :content="alertsStore.unreadCount"
                color="error"
                inline
                class="ml-auto"
              />
            </button>
            <button
              v-for="section in sections"
              :key="section.code"
              class="alerts-nav__item"
              :class="{ 'alerts-nav__item--active': selectedSection === section.code }"
              @click="selectedSection = section.code"
            >
              <v-icon size="16" :color="selectedSection === section.code ? section.color || 'primary' : undefined">
                {{ section.icon || 'mdi-tag-outline' }}
              </v-icon>
              <span>{{ section.name }}</span>
              <v-badge
                v-if="section.unreadCount > 0"
                :content="section.unreadCount"
                :color="section.color || 'primary'"
                inline
                class="ml-auto"
              />
            </button>
          </div>

          <v-divider class="alerts-card__divider" />

          <AlertSeveritySummary v-if="filteredAlerts.length" :alerts="filteredAlerts" />

          <v-divider v-if="filteredAlerts.length" class="alerts-card__divider" />

          <!-- Alert list body -->
          <v-card-text class="alerts-card__body pa-0">
            <div v-if="alertsStore.isLoading" class="alerts-loading">
              <v-progress-circular indeterminate color="primary" size="48" />
              <p class="text-caption mt-3 text-medium-emphasis">Cargando alertas...</p>
            </div>

            <div v-else-if="alertsStore.alerts.length === 0" class="alerts-empty">
              <v-avatar size="80" class="alerts-empty__icon">
                <v-icon size="48" color="success">mdi-bell-check-outline</v-icon>
              </v-avatar>
              <p class="alerts-empty__title">¡Todo en orden!</p>
              <p class="alerts-empty__subtitle">No tienes alertas pendientes</p>
            </div>

            <div v-else-if="filteredAlerts.length === 0" class="alerts-empty">
              <v-avatar size="64" class="alerts-empty__icon">
                <v-icon size="36" color="primary">mdi-filter-check-outline</v-icon>
              </v-avatar>
              <p class="alerts-empty__title text-body-2">Sin alertas en esta sección</p>
            </div>

            <div v-else class="alerts-list">
              <section v-for="group in groupedAlerts" :key="group.label">
                <div class="alerts-group__label">
                  {{ group.label }}
                  <span class="alerts-group__count">{{ group.alerts.length }}</span>
                </div>
                <transition-group name="alert-item">
                  <AlertCard
                    v-for="alert in group.alerts"
                    :key="alert.id"
                    :alert="alert"
                    :show-category="!selectedSection"
                    @open="handleAlertClick"
                    @read="markAsRead"
                    @dismiss="dismissAlert"
                  />
                </transition-group>
              </section>
            </div>
          </v-card-text>

          <v-divider v-if="alertsStore.alerts.length > 0" class="alerts-card__divider" />

          <v-card-actions v-if="alertsStore.alerts.length > 0" class="alerts-card__footer">
            <v-btn
              block
              variant="tonal"
              color="error"
              size="small"
              prepend-icon="mdi-delete-sweep"
              @click="dismissAll"
            >
              {{ selectedSection ? 'Descartar las de esta sección' : 'Descartar todas' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </transition>

    <AllAlertsModal
      v-model="showAllAlertsModal"
      @alert-dismissed="handleAlertDismissedInModal"
    />
  </div>
</template>

<script lang="ts" setup>
import type { IAlert, IAlertCategorySummary } from '~/repository/modules/alerts'
import { alertDayGroup } from '~/utils/alerts/presenters'

interface AlertSection extends IAlertCategorySummary {
  unreadCount: number
  totalCount: number
}

const alertsStore = useAlertsStore()
const router = useRouter()
const { $api } = useNuxtApp()

const showAllAlertsModal = ref(false)
const selectedSection = ref<string | null>(null)
const categories = ref<IAlertCategorySummary[]>([])

const sections = computed<AlertSection[]>(() => {
  return categories.value.map((cat) => {
    const catAlerts = alertsStore.alerts.filter((a) => a.category_code === cat.code)
    return {
      ...cat,
      unreadCount: catAlerts.filter((a) => !a.read_at).length,
      totalCount: catAlerts.length,
    }
  }).filter((s) => s.totalCount > 0)
})

const filteredAlerts = computed(() => {
  if (!selectedSection.value) return alertsStore.alerts
  return alertsStore.alerts.filter((a) => a.category_code === selectedSection.value)
})

const groupedAlerts = computed(() => {
  const groups: { label: string; alerts: IAlert[] }[] = []
  for (const alert of filteredAlerts.value) {
    const label = alertDayGroup(alert.created_at)
    const last = groups[groups.length - 1]
    if (last?.label === label) last.alerts.push(alert)
    else groups.push({ label, alerts: [alert] })
  }
  return groups
})

const handleAlertDismissedInModal = () => {
  alertsStore.fetchAlerts()
}

const loadCategories = async () => {
  try {
    categories.value = (await $api.alerts.getUserCategories()) as any
  } catch (e) {
    categories.value = []
  }
}

const handleAlertClick = async (alert: IAlert) => {
  if (!alert.read_at) {
    await alertsStore.markAsRead(alert.alert_user_id)
  }

  if (alert.action_url) {
    alertsStore.closeDrawer()
    router.push(alert.action_url)
  }
}

const markAsRead = async (alert: IAlert) => {
  await alertsStore.markAsRead(alert.alert_user_id)
}

const markAllRead = async () => {
  await alertsStore.markAllAsRead()
}

const dismissAlert = async (alert: IAlert) => {
  await alertsStore.dismissAlert(alert.alert_user_id)
}

const dismissAll = async () => {
  if (!selectedSection.value) {
    await alertsStore.dismissAll()
    return
  }
  await Promise.all(filteredAlerts.value.map((a) => alertsStore.dismissAlert(a.alert_user_id)))
}

watch(
  () => alertsStore.isDrawerOpen,
  (isOpen) => {
    if (isOpen) {
      alertsStore.fetchAlerts()
      loadCategories()
    }
  }
)
</script>

<style scoped>
.alerts-panel {
  position: fixed;
  right: 24px;
  bottom: 88px;
  top: 80px;
  max-width: 480px;
  width: 100%;
  z-index: 3000;
}

.alerts-slide-enter-active,
.alerts-slide-leave-active {
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.45s ease;
  transform-origin: top right;
}

.alerts-slide-enter-from,
.alerts-slide-leave-to {
  transform: translate(0, -8px) scale(0.4);
  opacity: 0;
}

.alerts-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px 0 16px 16px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
}

.alerts-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08) 0%, rgba(var(--v-theme-surface), 1) 100%);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.alerts-card__title {
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  color: rgb(var(--v-theme-primary));
}

.alerts-card__subtitle {
  font-size: 0.7rem;
  opacity: 0.75;
  color: rgba(var(--v-theme-on-surface), 0.65);
  margin-top: 2px;
}

.alerts-card__avatar {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

.alerts-card__action,
.alerts-card__close {
  color: rgba(var(--v-theme-on-surface), 0.65) !important;
  transition: all 0.2s ease;
}

.alerts-card__action:hover,
.alerts-card__close:hover {
  color: rgb(var(--v-theme-primary)) !important;
  transform: scale(1.1);
}

.alerts-card__divider {
  opacity: 0.6;
}

/* ── Section navigation ──────────────────────────────────────────────── */
.alerts-nav {
  display: flex;
  overflow-x: auto;
  background: rgb(var(--v-theme-surface));
  gap: 0;
  scrollbar-width: none;
}

.alerts-nav::-webkit-scrollbar {
  display: none;
}

.alerts-nav__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.6);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.alerts-nav__item:hover {
  color: rgba(var(--v-theme-on-surface), 0.85);
  background: rgba(var(--v-theme-primary), 0.04);
}

.alerts-nav__item--active {
  color: rgb(var(--v-theme-primary));
  border-bottom-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
  font-weight: 600;
}

/* ── Alert list body ─────────────────────────────────────────────────── */
.alerts-card__body {
  flex: 1;
  overflow-y: auto;
  background: rgb(var(--v-theme-background));
  min-height: 0;
}

.alerts-card__body::-webkit-scrollbar {
  width: 6px;
}

.alerts-card__body::-webkit-scrollbar-track {
  background: transparent;
}

.alerts-card__body::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 3px;
}

.alerts-card__body::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}

.alerts-card__footer {
  padding: 12px 16px;
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.alerts-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
}

.alerts-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.alerts-empty__icon {
  background: rgba(var(--v-theme-success), 0.1);
  margin-bottom: 16px;
}

.alerts-empty__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 8px;
}

.alerts-empty__subtitle {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.alerts-list {
  padding: 0;
}

.alerts-group__label {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
  background: rgb(var(--v-theme-background));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.alerts-group__count {
  font-weight: 600;
  opacity: 0.7;
}

.alert-item-enter-active,
.alert-item-leave-active {
  transition: all 0.3s ease;
}

.alert-item-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.alert-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.alert-item-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .alerts-panel {
    right: 12px;
    left: 12px;
    max-width: none;
  }

  .alerts-card {
    border-radius: 16px;
  }
}
</style>
