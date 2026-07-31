<template>
  <div class="notifications-panel">
    <!-- Copy from another user -->
    <v-card class="pa-4 mb-4 panel-card" rounded="lg" elevation="0">
      <div class="d-flex align-center gap-2 mb-3">
        <v-icon color="primary" size="18">mdi-content-copy</v-icon>
        <span class="text-subtitle-2 font-weight-bold">Copy notifications from another user</span>
      </div>
      <p class="text-caption text-medium-emphasis mb-3">
        Copies every notification assignment (type + ports) from the selected user onto this one.
        Existing assignments here are kept — matching ones are overwritten with the source's type/ports.
      </p>
      <div class="d-flex gap-2 align-center flex-wrap">
        <v-autocomplete
          v-model="copySourceUserId"
          :items="otherUsers"
          item-title="email"
          item-value="id"
          label="Search user to copy from"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="flex-grow-1"
          style="min-width: 260px"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" :title="item.raw.email" :subtitle="item.raw.name" />
          </template>
        </v-autocomplete>
        <v-btn color="primary" :loading="copying" :disabled="!copySourceUserId" @click="onClickCopy">
          <v-icon size="18" class="mr-1">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
    </v-card>

    <!-- Notification catalog -->
    <v-card class="pa-4 panel-card" rounded="lg" elevation="0">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center gap-2">
          <v-icon color="primary" size="18">mdi-email-multiple-outline</v-icon>
          <span class="text-subtitle-2 font-weight-bold">Notification types</span>
        </div>
        <v-chip size="small" color="primary" variant="tonal">{{ assignedCount }} / {{ notifications.length }} assigned</v-chip>
      </div>

      <v-text-field
        v-model="search"
        placeholder="Search notification..."
        variant="outlined"
        density="compact"
        hide-details
        prepend-inner-icon="mdi-magnify"
        clearable
        class="mb-3"
      />

      <v-data-table
        :headers="headers"
        :items="filteredNotifications"
        :items-per-page="-1"
        :loading="loading"
        density="compact"
        hide-default-footer
        item-value="id"
      >
        <template #item.short_name="{ item }">
          <div class="font-weight-medium">{{ item.short_name }}</div>
          <div v-if="item.description" class="text-caption text-medium-emphasis">{{ item.description }}</div>
        </template>
        <template #item.type="{ item }">
          <v-select
            v-model="rowState[item.id]!.type"
            :items="['TO', 'CC', 'BCC']"
            variant="outlined"
            density="compact"
            hide-details
            style="width: 100px"
          />
        </template>
        <template #item.ports="{ item }">
          <v-autocomplete
            v-model="rowState[item.id]!.ports"
            :items="ports"
            item-title="name"
            item-value="id"
            label="General"
            variant="outlined"
            density="compact"
            hide-details
            multiple
            chips
            closable-chips
            clearable
            style="min-width: 220px"
          />
        </template>
        <template #item.status="{ item }">
          <v-chip
            v-if="item.pivot"
            size="small"
            :color="item.pivot.type === 'TO' ? 'blue' : item.pivot.type === 'CC' ? 'green' : 'purple'"
          >
            {{ item.pivot.type }}
          </v-chip>
          <v-chip v-else size="small" color="grey" variant="outlined">Not assigned</v-chip>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-center gap-1">
            <v-btn
              icon="mdi-content-save-outline"
              size="x-small"
              variant="text"
              color="primary"
              :loading="savingId === item.id"
              @click="assignNotification(item)"
            />
            <v-btn
              v-if="item.pivot"
              icon="mdi-close-circle-outline"
              size="x-small"
              variant="text"
              color="error"
              :loading="savingId === item.id"
              @click="unassignNotification(item)"
            />
          </div>
        </template>
        <template #no-data>
          <div class="text-center pa-4 text-medium-emphasis">No notification types found</div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="showCopyConfirm" max-width="480">
      <v-card>
        <v-card-title>Copy notifications?</v-card-title>
        <v-card-text>
          This will copy every notification assignment from
          <strong>{{ copySourceUserLabel }}</strong> onto this user. Assignments already present here for the
          same notification type will be overwritten with the source's type/ports.
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" :loading="copying" @click="confirmCopy">Copy</v-btn>
          <v-btn color="secondary" @click="showCopyConfirm = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps({
  userId: {
    type: [String, Number],
    required: true,
  },
})

const loading = ref(true)
const notifications = ref<any[]>([])
const ports = ref<any[]>([])
const users = ref<any[]>([])
const search = ref('')
const savingId = ref<number | null>(null)

const rowState = reactive<Record<number, { type: string; ports: number[] }>>({})

const headers: any[] = [
  { title: 'Notification', key: 'short_name', sortable: true },
  { title: 'Type', key: 'type', sortable: false, width: 120 },
  { title: 'Ports', key: 'ports', sortable: false },
  { title: 'Status', key: 'status', sortable: false, width: 130 },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: 110 },
]

const otherUsers = computed(() => users.value.filter((u: any) => String(u.id) !== String(props.userId)))

const assignedCount = computed(() => notifications.value.filter((n: any) => !!n.pivot).length)

const filteredNotifications = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return notifications.value
  return notifications.value.filter((n: any) =>
    (n.short_name || '').toLowerCase().includes(q) || (n.description || '').toLowerCase().includes(q),
  )
})

const copySourceUserId = ref<number | null>(null)
const copying = ref(false)
const showCopyConfirm = ref(false)

const copySourceUserLabel = computed(() => {
  const user = users.value.find((u: any) => u.id === copySourceUserId.value)
  return user?.name || user?.email || 'this user'
})

function onClickCopy() {
  if (!copySourceUserId.value) {
    snackbar.add({ type: 'warning', text: 'Please select a user to copy from' })
    return
  }
  showCopyConfirm.value = true
}

async function confirmCopy() {
  showCopyConfirm.value = false
  copying.value = true
  try {
    const response: any = await $api.userMailNotifications.copyFromUser(props.userId, copySourceUserId.value as number)
    snackbar.add({ type: 'success', text: `${response.count} notification(s) copied` })
    copySourceUserId.value = null
    await fetchNotifications()
  } catch (e) {
    console.error('Error copying notifications:', e)
    snackbar.add({ type: 'error', text: 'Error copying notifications' })
  } finally {
    copying.value = false
  }
}

async function assignNotification(notification: any) {
  const state = rowState[notification.id]
  if (!state) return
  savingId.value = notification.id
  try {
    await $api.userMailNotifications.link(props.userId, notification.id, {
      type: state.type,
      ports: state.ports,
    })
    snackbar.add({ type: 'success', text: 'Notification assigned' })
    await fetchNotifications()
  } catch (e) {
    console.error('Error assigning notification:', e)
    snackbar.add({ type: 'error', text: 'Error assigning notification' })
  } finally {
    savingId.value = null
  }
}

async function unassignNotification(notification: any) {
  savingId.value = notification.id
  try {
    await $api.userMailNotifications.unlink(props.userId, notification.id)
    snackbar.add({ type: 'success', text: 'Notification unassigned' })
    await fetchNotifications()
  } catch (e) {
    console.error('Error unassigning notification:', e)
    snackbar.add({ type: 'error', text: 'Error unassigning notification' })
  } finally {
    savingId.value = null
  }
}

async function fetchNotifications() {
  loading.value = true
  try {
    const response: any = await $api.userMailNotifications.list(props.userId)
    notifications.value = response?.data ?? []
    notifications.value.forEach((n: any) => {
      rowState[n.id] = {
        type: n.pivot?.type ?? 'TO',
        ports: (n.pivot?.ports ?? []).map((p: any) => p.id),
      }
    })
  } catch (e) {
    console.error('Error loading notifications:', e)
    snackbar.add({ type: 'error', text: 'Error loading notifications' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const [formCatalogs, allUsers] = await Promise.all([
    $api.mailNotifications.getFormCatalogs(),
    $api.users.getAllUsers(),
  ])
  ports.value = formCatalogs?.ports ?? []
  users.value = allUsers ?? []
  await fetchNotifications()
})
</script>

<style scoped>
.notifications-panel {
  width: 100%;
}

.panel-card {
  border: 1px solid rgba(0, 0, 0, 0.07);
  background: rgba(0, 0, 0, 0.012);
}

.v-theme--dark .panel-card {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}
</style>
