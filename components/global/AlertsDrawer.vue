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
                <span class="alerts-card__title">Notifications</span>
                <span class="alerts-card__subtitle">
                  {{ alertsStore.unreadCount > 0
                    ? `${alertsStore.unreadCount} unread`
                    : 'All caught up' }}
                </span>
              </div>
            </div>
            <div class="d-flex gap-1 align-center">
              <v-btn
                icon="mdi-history"
                variant="text"
                size="small"
                class="alerts-card__action"
                title="View all alerts"
                @click="showAllAlertsModal = true"
              />
              <v-btn
                v-if="alertsStore.alerts.length > 0 && alertsStore.unreadCount > 0"
                icon="mdi-check-all"
                variant="text"
                size="small"
                class="alerts-card__action"
                title="Mark all as read"
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
              <span>All</span>
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

          <!-- Alert list body -->
          <v-card-text class="alerts-card__body pa-0">
            <div v-if="alertsStore.isLoading" class="alerts-loading">
              <v-progress-circular indeterminate color="primary" size="48" />
              <p class="text-caption mt-3 text-medium-emphasis">Loading alerts...</p>
            </div>

            <div v-else-if="alertsStore.alerts.length === 0" class="alerts-empty">
              <v-avatar size="80" class="alerts-empty__icon">
                <v-icon size="48" color="success">mdi-bell-check-outline</v-icon>
              </v-avatar>
              <p class="alerts-empty__title">All clear!</p>
              <p class="alerts-empty__subtitle">No pending alerts</p>
            </div>

            <div v-else-if="filteredAlerts.length === 0" class="alerts-empty">
              <v-avatar size="64" class="alerts-empty__icon">
                <v-icon size="36" color="primary">mdi-filter-check-outline</v-icon>
              </v-avatar>
              <p class="alerts-empty__title text-body-2">No alerts in this section</p>
            </div>

            <div v-else class="alerts-list">
              <transition-group name="alert-item">
                <div
                  v-for="alert in filteredAlerts"
                  :key="alert.id"
                  class="alert-item"
                  :class="{ 'alert-item--unread': !alert.read_at }"
                  @click="handleAlertClick(alert)"
                >
                  <div class="alert-item__indicator" :style="{ backgroundColor: getSeverityColor(alert.severity) }" />

                  <div class="alert-item__icon">
                    <v-avatar :color="getSeverityColor(alert.severity)" size="40" class="alert-item__avatar">
                      <v-icon :icon="alert.icon || getSeverityIcon(alert.severity)" color="white" size="20" />
                    </v-avatar>
                  </div>

                  <div class="alert-item__content">
                    <div class="alert-item__header">
                      <h4 class="alert-item__title">{{ alert.title }}</h4>
                      <span class="alert-item__time">{{ formatDate(alert.created_at) }}</span>
                    </div>

                    <p v-if="alert.message" class="alert-item__message">
                      {{ alert.message }}
                    </p>

                    <div v-if="alert.category && !selectedSection" class="alert-item__footer">
                      <v-chip size="x-small" variant="tonal" :color="getSeverityColor(alert.severity)">
                        {{ alert.category }}
                      </v-chip>
                    </div>
                  </div>

                  <div class="alert-item__actions">
                    <v-btn
                      v-if="!alert.read_at"
                      icon="mdi-check"
                      size="x-small"
                      variant="text"
                      color="success"
                      class="alert-item__action-btn"
                      title="Mark as read"
                      @click.stop="markAsRead(alert)"
                    />
                    <v-btn
                      icon="mdi-close"
                      size="x-small"
                      variant="text"
                      color="error"
                      class="alert-item__action-btn"
                      title="Dismiss"
                      @click.stop="dismissAlert(alert)"
                    />
                  </div>
                </div>
              </transition-group>
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
              Dismiss all
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

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    critical: 'error',
  }
  return colors[severity] || 'grey'
}

const getSeverityIcon = (severity: string) => {
  const icons: Record<string, string> = {
    info: 'mdi-information',
    warning: 'mdi-alert',
    error: 'mdi-alert-circle',
    critical: 'mdi-alert-octagon',
  }
  return icons[severity] || 'mdi-bell'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined,
  })
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
  await alertsStore.dismissAll()
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
  max-width: 440px;
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
  padding: 4px 0;
}

.alert-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  background: rgb(var(--v-theme-surface));
}

.alert-item:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  transform: translateX(-2px);
}

.alert-item--unread {
  background: rgba(var(--v-theme-primary), 0.06);
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.alert-item--unread:hover {
  background: rgba(var(--v-theme-primary), 0.1);
}

.alert-item__indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.alert-item:hover .alert-item__indicator {
  opacity: 1;
}

.alert-item__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-item__avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.alert-item__content {
  flex: 1;
  min-width: 0;
}

.alert-item__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.alert-item__title {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
  margin: 0;
}

.alert-item__time {
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  white-space: nowrap;
  flex-shrink: 0;
}

.alert-item__message {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.4;
  margin: 0 0 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alert-item__footer {
  margin-top: 6px;
}

.alert-item__actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-top: 2px;
}

.alert-item:hover .alert-item__actions {
  opacity: 1;
}

.alert-item__action-btn {
  transition: all 0.2s ease;
}

.alert-item__action-btn:hover {
  transform: scale(1.15);
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
