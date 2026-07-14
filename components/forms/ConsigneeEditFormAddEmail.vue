<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center justify-space-between pa-4 pb-3">
      <div class="d-flex align-center gap-2">
        <v-icon color="primary">mdi-email-outline</v-icon>
        <span class="text-h6">Emails</span>
        <v-chip v-if="emails && emails.length > 0" size="x-small" color="primary" variant="tonal">
          {{ emails.length }}
        </v-chip>
      </div>
      <div class="d-flex gap-2">
        <v-btn size="small" color="secondary" variant="tonal" prepend-icon="mdi-bell-check-outline" @click="showMatrix = true">
          Notification coverage
        </v-btn>
        <v-btn size="small" color="success" variant="tonal" prepend-icon="mdi-plus" @click="openCreateModal">
          Add email
        </v-btn>
      </div>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-0">
      <div v-if="!emails || emails.length === 0" class="text-center py-8 text-medium-emphasis">
        <v-icon size="40" class="mb-2 opacity-30">mdi-email-off-outline</v-icon>
        <p class="text-body-2">No emails registered</p>
      </div>
      <v-table v-else density="compact" class="emails-table">
        <thead>
          <tr>
            <th width="88">Actions</th>
            <th>Email</th>
            <th>Notes</th>
            <th>Port(s)</th>
            <th>Airport(s)</th>
            <th>Noty Type(s)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in emails" :key="`cus-email-${index}`">
            <td>
              <div class="d-flex gap-1">
                <v-btn
                  size="x-small"
                  variant="tonal"
                  icon="mdi-pencil-outline"
                  color="blue"
                  @click="openEditModal(item)"
                />
                <v-btn
                  size="x-small"
                  variant="tonal"
                  icon="mdi-delete-outline"
                  color="error"
                  @click="showConfirmDelete(item.id)"
                />
              </div>
            </td>
            <td>
              <div class="d-flex align-center gap-1">
                <v-icon size="x-small" color="medium-emphasis">mdi-at</v-icon>
                <span class="text-body-2 font-weight-medium">{{ item.email }}</span>
              </div>
              <div v-if="hasCustomAgents(item)" class="text-caption text-medium-emphasis mt-1">
                <span v-for="(agent, agentIndex) in getCustomAgents(item)" :key="`agent-${agentIndex}`">
                  {{ agent }}<span v-if="agentIndex < getCustomAgents(item).length - 1">, </span>
                </span>
              </div>
            </td>
            <td>
              <span class="text-caption text-medium-emphasis">{{ item.notes || '—' }}</span>
            </td>
            <td>
              <div v-if="item.ports && item.ports.length > 0" class="d-flex flex-wrap gap-1 py-1">
                <v-chip
                  v-for="(port, pIndex) in item.ports"
                  :key="`port-${pIndex}`"
                  size="x-small"
                  color="blue"
                  variant="tonal"
                >
                  <v-icon start size="x-small">mdi-anchor</v-icon>
                  {{ port.name }}
                </v-chip>
              </div>
              <span v-else class="text-caption text-medium-emphasis">—</span>
            </td>
            <td>
              <div v-if="item.airports && item.airports.length > 0" class="d-flex flex-wrap gap-1 py-1">
                <v-chip
                  v-for="(airport, aIndex) in item.airports"
                  :key="`airport-${aIndex}`"
                  size="x-small"
                  color="deep-purple"
                  variant="tonal"
                >
                  <v-icon start size="x-small">mdi-airplane</v-icon>
                  {{ airport.name }}
                </v-chip>
              </div>
              <span v-else class="text-caption text-medium-emphasis">—</span>
            </td>
            <td>
              <div v-if="!item.mail_notifications?.length" class="text-caption text-medium-emphasis">—</div>
              <div v-else class="noty-list py-1">
                <div
                  v-for="(mailNoty, nIndex) in visibleNotifications(item)"
                  :key="`email-mail-noti-${nIndex}`"
                  class="noty-row"
                  :class="mailNoty.pivot.type === 'CC' ? 'noty-row--cc' : 'noty-row--to'"
                >
                  <span class="noty-type">{{ mailNoty.pivot.type }}</span>
                  <span class="noty-name">{{ formatNotificationName(mailNoty.short_name) }}</span>
                  <v-icon
                    v-if="isPortFilterableNotification(mailNoty.short_name) && item.ports && item.ports.length > 0"
                    size="x-small"
                    color="blue"
                    v-tooltip="'Filtered by port'"
                  >mdi-anchor</v-icon>
                </div>
                <button
                  v-if="item.mail_notifications.length > NOTY_PREVIEW"
                  class="noty-toggle-btn"
                  @click="toggleRow(item.id)"
                >
                  <v-icon size="x-small">{{ expandedRows.has(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  {{ expandedRows.has(item.id) ? 'Show less' : `+${item.mail_notifications.length - NOTY_PREVIEW} more` }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
    <ConsigneeEmailModal
      v-model:show="showModal"
      :mode="modalMode"
      :email-data="selectedEmail"
      :catalogs="catalogs"
      :customer-id="id"
      @refresh="emit('refresh')"
    />
    <ConsigneeNotificationsMatrix
      v-model:show="showMatrix"
      :emails="emails"
      :catalogs="catalogs"
      :id="id"
      @refresh="emit('refresh')"
    />
  </v-card>
</template>
<script setup lang="ts">
import { isPortFilterableNotification, formatNotificationName } from '~/utils/mailNotifications'
import ConsigneeEmailModal from './ConsigneeEmailModal.vue'
import ConsigneeNotificationsMatrix from './ConsigneeNotificationsMatrix.vue'

const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps(['emails', 'catalogs', 'id'])
const emit = defineEmits(['refresh'])

const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedEmail = ref<any>(null)
const showMatrix = ref(false)

const NOTY_PREVIEW = 3
const expandedRows = ref<Set<number>>(new Set())

const toggleRow = (id: number) => {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
  expandedRows.value = new Set(expandedRows.value)
}

const visibleNotifications = (item: any) => {
  if (expandedRows.value.has(item.id)) return item.mail_notifications
  return item.mail_notifications.slice(0, NOTY_PREVIEW)
}

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedEmail.value = null
  showModal.value = true
}

const openEditModal = (item: any) => {
  modalMode.value = 'edit'
  selectedEmail.value = item
  showModal.value = true
}

const showConfirmDelete = async (id: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm this action.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.loading = true
      await $api.consignees.deleteEmail(id)

      snackbar.add({ type: 'success', text: 'Deleted' })
      emit('refresh')
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const hasCustomAgents = (item: any) => {
  const warrantyAgents = (item.warranty_letters || []).map((wl: any) => wl.custom_agent?.short_name || wl.custom_agent?.name).filter(Boolean)
  const entrustAgents = (item.entrust_letters || []).map((el: any) => el.custom_agent?.short_name || el.custom_agent?.name).filter(Boolean)
  return warrantyAgents.length > 0 || entrustAgents.length > 0
}

const getCustomAgents = (item: any) => {
  const warrantyAgents = (item.warranty_letters || []).map((wl: any) => wl.custom_agent?.short_name || wl.custom_agent?.name).filter(Boolean)
  const entrustAgents = (item.entrust_letters || []).map((el: any) => el.custom_agent?.short_name || el.custom_agent?.name).filter(Boolean)
  const allAgents = [...warrantyAgents, ...entrustAgents]
  return [...new Set(allAgents)]
}
</script>

<style scoped>
.emails-table :deep(thead th) {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.02);
}

.emails-table :deep(tbody tr:hover td) {
  background: rgba(var(--v-theme-primary), 0.03);
}

.emails-table :deep(td) {
  vertical-align: top;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

.noty-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.noty-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.78rem;
  line-height: 1.4;
}

.noty-row--to {
  background: rgba(var(--v-theme-primary), 0.07);
}

.noty-row--cc {
  background: rgba(255, 179, 0, 0.1);
}

.noty-type {
  font-weight: 700;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  flex-shrink: 0;
  opacity: 0.75;
}

.noty-name {
  flex: 1;
}

.noty-toggle-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 3px;
  padding: 2px 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(var(--v-theme-primary), 1);
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.15s;
}

.noty-toggle-btn:hover {
  opacity: 1;
  background: rgba(var(--v-theme-primary), 0.08);
}
</style>
