<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">
      <v-icon start size="16">mdi-arrow-left</v-icon>
      Back
    </v-btn>

    <v-card elevation="0" class="group-card-shell mb-4">
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="28">mdi-email-multiple-outline</v-icon>
            </div>
            <div class="header-text">
              <h2 class="page-title">Mail Notification Groups</h2>
              <p class="page-subtitle">Configure who receives each system notification, grouped by recipient type</p>
            </div>
          </div>
          <v-btn v-if="canEdit" color="white" variant="flat" class="add-group-btn" @click="openAddDialog">
            <v-icon start size="18">mdi-plus</v-icon>
            Add Group
          </v-btn>
        </div>
      </div>

      <v-card-text class="pa-6">
        <div class="d-flex flex-wrap gap-3 mb-6">
          <div class="stat-tile">
            <v-icon size="20" color="primary">mdi-folder-multiple-outline</v-icon>
            <div>
              <div class="stat-value">{{ groups.length }}</div>
              <div class="stat-label">Total groups</div>
            </div>
          </div>
          <div class="stat-tile">
            <v-icon size="20" color="success">mdi-check-circle-outline</v-icon>
            <div>
              <div class="stat-value">{{ activeCount }}</div>
              <div class="stat-label">Active</div>
            </div>
          </div>
          <div class="stat-tile">
            <v-icon size="20" color="error">mdi-close-circle-outline</v-icon>
            <div>
              <div class="stat-value">{{ inactiveCount }}</div>
              <div class="stat-label">Inactive</div>
            </div>
          </div>
        </div>

        <div class="filters-section mb-6">
          <div class="filters-title mb-4">
            <v-icon color="primary" size="20" class="mr-2">mdi-filter-outline</v-icon>
            <span>Filters</span>
          </div>
          <v-row>
            <v-col cols="12" sm="5">
              <v-text-field
                v-model="filters.search"
                label="Search"
                placeholder="Filter by name or description"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="filters.entityType"
                :items="catalogs.entity_types"
                item-title="name"
                item-value="value"
                label="Entity Type"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" sm="3">
              <v-select
                v-model="filters.status"
                :items="statusOptions"
                label="Status"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
          <div v-if="hasActiveFilters" class="d-flex justify-end mt-4">
            <v-btn size="small" variant="outlined" color="grey" @click="clearFilters">
              <v-icon start size="16">mdi-filter-off</v-icon>
              Clear Filters
            </v-btn>
          </div>
        </div>

        <p class="text-caption text-medium-emphasis mb-3 px-1">
          {{ filteredGroups.length }} group{{ filteredGroups.length === 1 ? '' : 's' }} found
        </p>

        <div v-if="filteredGroups.length === 0" class="empty-state">
          <v-icon size="56" color="grey-lighten-1" class="mb-4 empty-icon">mdi-email-off-outline</v-icon>
          <h3 class="text-h6 font-weight-medium mb-2">{{ groups.length === 0 ? 'No groups yet' : 'No groups match your filters' }}</h3>
          <p class="text-body-2 text-medium-emphasis text-center" style="max-width: 400px">
            {{ groups.length === 0 ? 'Create your first mail notification group to start routing notifications.' : 'Try adjusting or clearing your filters.' }}
          </p>
          <v-btn v-if="groups.length > 0 && hasActiveFilters" size="small" variant="tonal" color="primary" class="mt-4" @click="clearFilters">
            Clear Filters
          </v-btn>
        </div>

        <v-row v-else>
          <v-col v-for="group in filteredGroups" :key="group.id" cols="12" sm="6" lg="4">
            <div class="group-card" :class="{ 'group-card--inactive': group.deleted_at }">
              <div class="group-card-header">
                <div class="d-flex align-center gap-2">
                  <div class="group-icon-badge" :style="entityBadgeStyle(group.entity_type)">
                    <v-icon size="18" :color="getEntityTypeColor(group.entity_type)">mdi-account-group-outline</v-icon>
                  </div>
                  <div class="min-w-0">
                    <div class="group-name text-truncate">{{ group.name }}</div>
                    <v-chip size="x-small" :color="getEntityTypeColor(group.entity_type)" variant="tonal">
                      {{ getEntityTypeName(group.entity_type) }}
                    </v-chip>
                  </div>
                </div>
                <div class="d-flex gap-1">
                  <EditButton :item="group" permission="mail-notifications-edit" @click="openEditDialog(group)" />
                  <v-btn
                    v-if="canDelete"
                    size="x-small"
                    variant="text"
                    :icon="group.deleted_at ? 'mdi-restore' : 'mdi-delete'"
                    :color="group.deleted_at ? 'success' : 'error'"
                    @click="toggleDelete(group)"
                  />
                </div>
              </div>

              <p v-if="group.description" class="group-description">{{ group.description }}</p>

              <v-divider class="my-3" />

              <div class="d-flex flex-wrap gap-1 align-center">
                <v-chip v-for="type in typeSummary(group)" :key="type.label" size="x-small" :color="typeColor(type.label)" variant="flat">
                  {{ type.label }}: {{ type.count }}
                </v-chip>
                <span v-if="!group.mail_notifications?.length" class="text-caption text-medium-emphasis">No notifications configured</span>
                <v-menu v-if="group.mail_notifications?.length" open-on-hover location="bottom">
                  <template #activator="{ props: menuProps }">
                    <v-chip v-bind="menuProps" size="x-small" variant="outlined">
                      <v-icon start size="12">mdi-eye-outline</v-icon>
                      View all ({{ group.mail_notifications.length }})
                    </v-chip>
                  </template>
                  <v-card class="pa-3" max-width="420">
                    <div class="d-flex flex-wrap gap-1">
                      <v-chip v-for="noty in group.mail_notifications" :key="noty.id" size="x-small" :color="typeColor(noty.pivot?.default_type)" variant="flat" class="wrap-chip">
                        {{ noty.pivot?.default_type }}: {{ humanize(noty.short_name) }}
                      </v-chip>
                    </div>
                  </v-card>
                </v-menu>
              </div>

              <div class="group-card-footer mt-3">
                <v-chip size="small" :color="group.deleted_at ? 'error' : 'success'" variant="tonal">
                  <v-icon start size="12">{{ group.deleted_at ? 'mdi-close-circle' : 'mdi-check-circle' }}</v-icon>
                  {{ group.deleted_at ? 'Inactive' : 'Active' }}
                </v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="1200" persistent scrollable>
      <v-card class="group-card-shell">
        <div class="page-header dialog-header">
          <div class="header-content">
            <div class="header-left">
              <div class="icon-wrapper">
                <v-icon color="white" size="24">{{ isEditing ? 'mdi-email-edit-outline' : 'mdi-email-plus-outline' }}</v-icon>
              </div>
              <div class="header-text">
                <h2 class="page-title" style="font-size: 1.25rem">{{ isEditing ? 'Edit' : 'Add' }} Mail Notification Group</h2>
                <p class="page-subtitle">Set the recipients and default delivery type for each notification</p>
              </div>
            </div>
          </div>
        </div>
        <v-card-text class="pa-6">
          <div class="filters-section mb-4">
            <div class="filters-title mb-4">
              <v-icon color="primary" size="20" class="mr-2">mdi-information-outline</v-icon>
              <span>Group Details</span>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <v-text-field v-model="form.name" label="Group Name *" density="compact" variant="outlined" hide-details />
              <v-autocomplete
                v-model="form.entity_type"
                :items="catalogs.entity_types"
                item-title="name"
                item-value="value"
                label="Entity Type"
                density="compact"
                variant="outlined"
                hide-details
                clearable
              />
            </div>
            <v-textarea v-model="form.description" label="Description" density="compact" variant="outlined" rows="2" hide-details />
          </div>

          <!-- Notifications Selection -->
          <div class="filters-section">
            <div class="flex justify-between items-center mb-1">
              <div class="filters-title">
                <v-icon color="primary" size="20" class="mr-2">mdi-email-check-outline</v-icon>
                <span>Mail Notifications</span>
              </div>
              <div class="flex gap-2">
                <v-btn size="x-small" variant="tonal" @click="selectAllNotifications">Add All as To</v-btn>
                <v-btn size="x-small" variant="tonal" @click="clearAllNotifications">Remove All</v-btn>
              </div>
            </div>
            <p class="text-caption text-medium-emphasis mb-4">
              Assign notifications to To, Cc or Bcc, or browse the full catalog below to add them in bulk.
            </p>
            <NotificationsPicker v-model="selectedNotifications" :notifications="catalogs.mail_notifications" />
          </div>
        </v-card-text>
        <v-card-actions class="justify-end pa-4">
          <v-btn color="secondary" variant="outlined" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" :disabled="!form.name" @click="saveGroup">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Mail Notification Groups',
  layout: 'default',
})

const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const { hasPermission } = useCheckUser()

const canEdit = computed(() => hasPermission('mail-notifications-edit'))
const canDelete = computed(() => hasPermission('mail-notifications-delete'))

const groups = ref<any[]>([])
const showDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const form = ref({
  name: '',
  description: '',
  entity_type: null as string | null,
})

const selectedNotifications = ref<Record<number, string>>({})

const catalogs = ref<{ mail_notifications: any[]; entity_types: any[] }>({
  mail_notifications: [],
  entity_types: [],
})

const filters = ref({
  search: '',
  entityType: null as string | null,
  status: 'all',
})

const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
]

const hasActiveFilters = computed(() => !!filters.value.search || !!filters.value.entityType || filters.value.status !== 'all')

const activeCount = computed(() => groups.value.filter((g) => !g.deleted_at).length)
const inactiveCount = computed(() => groups.value.filter((g) => g.deleted_at).length)

const filteredGroups = computed(() => {
  return groups.value.filter((g) => {
    if (filters.value.entityType && g.entity_type !== filters.value.entityType) return false
    if (filters.value.status === 'active' && g.deleted_at) return false
    if (filters.value.status === 'inactive' && !g.deleted_at) return false
    if (filters.value.search) {
      const q = filters.value.search.toLowerCase()
      const matchesName = g.name?.toLowerCase().includes(q)
      const matchesDescription = g.description?.toLowerCase().includes(q)
      if (!matchesName && !matchesDescription) return false
    }
    return true
  })
})

const clearFilters = () => {
  filters.value = { search: '', entityType: null, status: 'all' }
}

const humanize = (shortName: string) => {
  return (shortName || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2')
}

const getEntityTypeName = (type: string) => {
  return catalogs.value.entity_types.find((e) => e.value === type)?.name || type || 'All'
}

const getEntityTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    consignee: 'blue',
    custom_agent: 'purple',
    supplier: 'orange',
    freight_forwarder: 'teal',
    line: 'indigo',
  }
  return colors[type] || 'grey'
}

const entityHex: Record<string, string> = {
  consignee: '#2563eb',
  custom_agent: '#9333ea',
  supplier: '#f97316',
  freight_forwarder: '#0d9488',
  line: '#4f46e5',
}

const entityBadgeStyle = (type: string) => {
  const hex = entityHex[type] || '#6b7280'
  return { backgroundColor: `${hex}1f` }
}

const typeColor = (type: string) => {
  const colors: Record<string, string> = { TO: 'primary', CC: 'amber', BCC: 'deep-purple' }
  return colors[type] || 'grey'
}

const typeSummary = (group: any) => {
  const counts: Record<string, number> = {}
  group.mail_notifications?.forEach((n: any) => {
    const type = n.pivot?.default_type || 'TO'
    counts[type] = (counts[type] || 0) + 1
  })
  return Object.entries(counts).map(([label, count]) => ({ label, count }))
}

const loadCatalogs = async () => {
  try {
    const response: any = await $api.mailNotificationGroups.getFormCatalogs()
    catalogs.value = {
      mail_notifications: response.mail_notifications || [],
      entity_types: response.entity_types || [],
    }
  } catch (e) {
    console.error(e)
  }
}

const loadGroups = async () => {
  try {
    loadingStore.start()
    const response = await $api.mailNotificationGroups.getList({ query: { limit: 200 } })
    groups.value = response.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingStore.stop()
  }
}

const selectAllNotifications = () => {
  catalogs.value.mail_notifications.forEach((n) => {
    selectedNotifications.value[n.id] = 'TO'
  })
}

const clearAllNotifications = () => {
  catalogs.value.mail_notifications.forEach((n) => {
    selectedNotifications.value[n.id] = ''
  })
}

const openAddDialog = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', description: '', entity_type: null }
  selectedNotifications.value = {}
  catalogs.value.mail_notifications.forEach((n) => {
    selectedNotifications.value[n.id] = ''
  })
  showDialog.value = true
}

const openEditDialog = (group: any) => {
  isEditing.value = true
  editingId.value = group.id
  form.value = {
    name: group.name,
    description: group.description || '',
    entity_type: group.entity_type,
  }
  selectedNotifications.value = {}
  catalogs.value.mail_notifications.forEach((n) => {
    selectedNotifications.value[n.id] = ''
  })
  group.mail_notifications?.forEach((noty: any) => {
    selectedNotifications.value[noty.id] = noty.pivot?.default_type || 'TO'
  })
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
}

const saveGroup = async () => {
  try {
    saving.value = true
    loadingStore.start()

    const mailNotificationsData = Object.entries(selectedNotifications.value)
      .filter(([_, type]) => type !== '')
      .map(([id, type]) => ({
        id: parseInt(id),
        default_type: type,
      }))

    const body = {
      ...form.value,
      name: form.value.name.trim(),
      mail_notifications: mailNotificationsData,
    }

    if (isEditing.value && editingId.value) {
      await $api.mailNotificationGroups.update(editingId.value.toString(), body)
      snackbar.add({ type: 'success', text: 'Group updated successfully' })
    } else {
      await $api.mailNotificationGroups.create(body)
      snackbar.add({ type: 'success', text: 'Group created successfully' })
    }

    closeDialog()
    await loadGroups()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e.message || 'Error saving group' })
  } finally {
    saving.value = false
    loadingStore.stop()
  }
}

const toggleDelete = async (group: any) => {
  const action = group.deleted_at ? 'restore' : 'delete'
  const result = await confirm({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} group?`,
    confirmationText: action.charAt(0).toUpperCase() + action.slice(1),
    content: `Are you sure you want to ${action} "${group.name}"?`,
    dialogProps: { persistent: true, maxWidth: 400 },
    confirmationButtonProps: { color: group.deleted_at ? 'success' : 'error' },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.mailNotificationGroups.delete(group.id.toString())
      snackbar.add({ type: 'success', text: `Group ${action}d successfully` })
      await loadGroups()
    } catch (e: any) {
      console.error(e)
      snackbar.add({ type: 'error', text: e.message || `Error ${action}ing group` })
    } finally {
      loadingStore.stop()
    }
  }
}

onMounted(async () => {
  await Promise.all([loadCatalogs(), loadGroups()])
})
</script>

<style scoped>
.group-card-shell {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
}

.page-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  position: relative;
  overflow: hidden;
}
.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 40%;
  height: 200%;
  background: rgba(255, 255, 255, 0.05);
  transform: rotate(-15deg);
}
.dialog-header {
  padding: 4px 0;
}
.header-content {
  position: relative;
  z-index: 1;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.icon-wrapper {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-text {
  color: white;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}
.page-subtitle {
  font-size: 0.875rem;
  margin: 4px 0 0 0;
  opacity: 0.9;
}
.add-group-btn {
  color: #4f46e5 !important;
  font-weight: 600;
}

.stat-tile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-on-surface), 0.02);
}
.stat-value {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.1;
}
.stat-label {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.filters-section {
  background: rgb(var(--v-theme-surface));
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.filters-title {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  padding: 40px;
  border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 16px;
  background: rgba(var(--v-theme-on-surface), 0.02);
}
.empty-icon {
  animation: empty-float 3.2s ease-in-out infinite;
}
@keyframes empty-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.group-card {
  height: 100%;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  padding: 16px;
  background: rgb(var(--v-theme-surface));
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
}
.group-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px -18px rgba(0, 0, 0, 0.28);
  border-color: rgba(var(--v-theme-primary), 0.35);
}
.group-card--inactive {
  opacity: 0.6;
}
.group-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.group-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.group-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 2px;
}
.group-description {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 10px 0 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.group-card-footer {
  display: flex;
  align-items: center;
}

.wrap-chip {
  height: auto !important;
  white-space: normal !important;
}
.wrap-chip :deep(.v-chip__content) {
  white-space: normal !important;
  display: block;
  line-height: 1.3;
  padding: 4px 0;
}
</style>
