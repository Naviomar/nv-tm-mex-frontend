<template>
  <v-container fluid>
    <div>
      <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>

      <div class="flex items-center justify-between w-full mb-4">
        <div class="text-xl">Mail Notification Groups</div>
        <v-btn color="primary" size="small" @click="openAddDialog">
          <v-icon left>mdi-plus</v-icon>
          Add Group
        </v-btn>
      </div>
    </div>

    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th width="100">Actions</th>
              <th>Name</th>
              <th>Entity Type</th>
              <th>Notifications</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="groups.length === 0">
              <td colspan="5" class="text-center py-4">No groups found</td>
            </tr>
            <tr v-for="group in groups" :key="group.id" :class="{ 'opacity-50': group.deleted_at }">
              <td>
                <div class="flex gap-1">
                  <v-btn size="x-small" variant="text" icon="mdi-pencil" color="primary" @click="openEditDialog(group)" />
                  <v-btn size="x-small" variant="text" :icon="group.deleted_at ? 'mdi-restore' : 'mdi-delete'" :color="group.deleted_at ? 'success' : 'error'" @click="toggleDelete(group)" />
                </div>
              </td>
              <td>
                <div class="font-medium">{{ group.name }}</div>
                <div class="text-xs text-gray-500">{{ group.description }}</div>
              </td>
              <td>
                <v-chip size="small" :color="getEntityTypeColor(group.entity_type)">
                  {{ getEntityTypeName(group.entity_type) }}
                </v-chip>
              </td>
              <td>
                <div class="flex flex-wrap gap-1 max-w-md">
                  <v-chip v-for="noty in group.mail_notifications?.slice(0, 3)" :key="noty.id" size="x-small" color="blue-lighten-4">
                    {{ noty.pivot?.default_type }}: {{ noty.short_name }}
                  </v-chip>
                  <v-chip v-if="group.mail_notifications?.length > 3" size="x-small" color="grey">
                    +{{ group.mail_notifications.length - 3 }} more
                  </v-chip>
                </div>
              </td>
              <td>
                <v-chip size="small" :color="group.deleted_at ? 'error' : 'success'">
                  {{ group.deleted_at ? 'Inactive' : 'Active' }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="800" persistent>
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Edit' : 'Add' }} Mail Notification Group
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <v-text-field v-model="form.name" label="Group Name *" density="compact" variant="outlined" />
            <v-autocomplete
              v-model="form.entity_type"
              :items="entityTypes"
              item-title="name"
              item-value="value"
              label="Entity Type"
              density="compact"
              variant="outlined"
              clearable
            />
          </div>
          <v-textarea v-model="form.description" label="Description" density="compact" variant="outlined" rows="2" class="mb-4" />

          <!-- Notifications Selection -->
          <div class="border rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <label class="font-medium">Mail Notifications</label>
              <div class="flex gap-2">
                <v-btn size="x-small" variant="tonal" @click="selectAllNotifications">Select All (TO)</v-btn>
                <v-btn size="x-small" variant="tonal" @click="clearAllNotifications">Clear All</v-btn>
              </div>
            </div>
            <div class="max-h-[400px] overflow-y-auto">
              <div
                v-for="notification in availableNotifications"
                :key="notification.id"
                class="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div class="flex-1">
                  <span class="font-medium">{{ notification.short_name }}</span>
                  <p class="text-xs text-gray-500">{{ notification.description }}</p>
                </div>
                <v-btn-toggle
                  v-model="selectedNotifications[notification.id]"
                  density="compact"
                  mandatory
                  divided
                  variant="outlined"
                >
                  <v-btn size="x-small" value="">OFF</v-btn>
                  <v-btn size="x-small" value="TO" color="primary">TO</v-btn>
                  <v-btn size="x-small" value="CC" color="amber">CC</v-btn>
                </v-btn-toggle>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="secondary" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveGroup" :disabled="!form.name">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { mailNotifications as allMailNotifications } from '~/utils/data/systemData'

definePageMeta({
  title: 'Mail Notification Groups',
  layout: 'default',
})

const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const groups = ref<any[]>([])
const showDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  name: '',
  description: '',
  entity_type: null as string | null,
})

const selectedNotifications = ref<Record<number, string>>({})

const entityTypes = [
  { value: 'consignee', name: 'Customers' },
  { value: 'custom_agent', name: 'Customs Agents' },
  { value: 'supplier', name: 'Suppliers' },
  { value: 'freight_forwarder', name: 'F.F. Agents' },
  { value: 'line', name: 'Freight Lines' },
]

const availableNotifications = computed(() => allMailNotifications)

const getEntityTypeName = (type: string) => {
  return entityTypes.find((e) => e.value === type)?.name || type || 'All'
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

const loadGroups = async () => {
  try {
    loadingStore.start()
    const response = await $api.mailNotificationGroups.getList()
    groups.value = response.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingStore.stop()
  }
}

const selectAllNotifications = () => {
  availableNotifications.value.forEach((n) => {
    selectedNotifications.value[n.id] = 'TO'
  })
}

const clearAllNotifications = () => {
  availableNotifications.value.forEach((n) => {
    selectedNotifications.value[n.id] = ''
  })
}

const openAddDialog = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', description: '', entity_type: null }
  selectedNotifications.value = {}
  availableNotifications.value.forEach((n) => {
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
  availableNotifications.value.forEach((n) => {
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
    loadingStore.start()

    const mailNotificationsData = Object.entries(selectedNotifications.value)
      .filter(([_, type]) => type !== '')
      .map(([id, type]) => ({
        id: parseInt(id),
        default_type: type,
      }))

    const body = {
      ...form.value,
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
  await loadGroups()
})
</script>
