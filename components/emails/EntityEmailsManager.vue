<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <v-icon>mdi-email-outline</v-icon>
          <span>Emails</span>
        </div>
        <v-btn icon size="x-small" @click="openAddEmailsDialog" color="success">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text>
      <div v-if="!emails || emails.length === 0" class="text-center py-4 text-gray-500">
        No emails registered
      </div>
      <v-table v-else density="compact">
        <thead>
          <tr>
            <th class="text-left" width="100">Actions</th>
            <th class="text-left">Email</th>
            <th class="text-left">Notifications</th>
            <th class="text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(email, index) in emails" :key="`email-${index}`">
            <td>
              <div class="flex gap-1">
                <v-btn
                  size="x-small"
                  variant="text"
                  icon="mdi-cog-outline"
                  color="blue"
                  @click="openNotificationsModal(email)"
                  v-tooltip="'Configure notifications'"
                />
                <v-btn
                  size="x-small"
                  variant="text"
                  icon="mdi-delete-outline"
                  color="red-lighten-2"
                  @click="confirmDeleteEmail(email)"
                />
              </div>
            </td>
            <td>
              <span class="font-medium">{{ email.email }}</span>
            </td>
            <td>
              <div class="flex flex-wrap gap-1 max-w-md">
                <v-chip
                  v-for="(noty, nIndex) in email.mail_notifications?.slice(0, 3)"
                  :key="`noty-${nIndex}`"
                  size="x-small"
                  :color="noty.pivot?.type === 'TO' ? 'primary' : 'amber'"
                >
                  {{ noty.pivot?.type }}: {{ noty.short_name }}
                </v-chip>
                <v-chip
                  v-if="email.mail_notifications?.length > 3"
                  size="x-small"
                  color="grey"
                >
                  +{{ email.mail_notifications.length - 3 }} more
                </v-chip>
              </div>
            </td>
            <td>
              <span class="text-sm text-gray-600">{{ email.notes || '-' }}</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>

    <!-- Add Emails Dialog -->
    <v-dialog v-model="showAddDialog" max-width="700" persistent>
      <v-card>
        <v-card-title class="flex items-center gap-2">
          <v-icon>mdi-email-plus-outline</v-icon>
          Add Emails
        </v-card-title>
        <v-card-text>
          <!-- Email chips input -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Email addresses</label>
            <div
              class="border rounded-lg p-2 min-h-[80px] flex flex-wrap gap-2 items-start cursor-text bg-white dark:bg-neutral-800"
              @click="focusEmailInput"
            >
              <v-chip
                v-for="(email, index) in emailsToAdd"
                :key="`add-email-${index}`"
                closable
                size="small"
                color="primary"
                @click:close="removeEmailToAdd(index)"
              >
                {{ email }}
              </v-chip>
              <input
                ref="emailInputRef"
                v-model="currentEmailInput"
                type="email"
                class="flex-1 min-w-[200px] outline-none bg-transparent py-1"
                placeholder="Type email and press Enter or comma"
                @keydown="handleEmailInputKeydown"
                @blur="addCurrentEmail"
                @paste="handlePaste"
              />
            </div>
            <p v-if="emailError" class="text-red-500 text-sm mt-1">{{ emailError }}</p>
            <p class="text-gray-500 text-xs mt-1">Press Enter, comma, or Tab to add multiple emails</p>
          </div>

          <!-- Notes -->
          <div class="mb-4">
            <v-textarea
              v-model="emailNotes"
              label="Notes (optional)"
              density="compact"
              variant="outlined"
              rows="2"
              hide-details
              placeholder="Add notes about the usage of these emails..."
            />
          </div>

          <!-- Notification Group Selection -->
          <div class="mb-4">
            <v-autocomplete
              v-model="selectedGroup"
              :items="notificationGroups"
              item-title="name"
              item-value="id"
              label="Select a notification group (optional)"
              density="compact"
              variant="outlined"
              clearable
              return-object
              hide-details
              @update:model-value="applyGroupNotifications"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:subtitle>
                    {{ item.raw.mailNotifications?.length || 0 }} notifications
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
            <p class="text-gray-500 text-xs mt-1">Selecting a group will pre-select notifications</p>
          </div>

          <!-- Notifications Selection with Switches -->
          <div class="border rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <label class="font-medium">Mail Notifications</label>
              <div class="flex gap-2">
                <v-btn size="x-small" variant="tonal" @click="selectAllNotifications">Select All</v-btn>
                <v-btn size="x-small" variant="tonal" @click="clearAllNotifications">Clear All</v-btn>
              </div>
            </div>
            <div class="max-h-[300px] overflow-y-auto">
              <div
                v-for="notification in availableNotifications"
                :key="`noty-select-${notification.id}`"
                class="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div class="flex-1">
                  <span class="font-medium">{{ notification.short_name }}</span>
                  <p class="text-xs text-gray-500">{{ notification.description }}</p>
                </div>
                <div class="flex items-center gap-2">
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
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="secondary" @click="closeAddDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveEmails" :disabled="emailsToAdd.length === 0">
            Save Emails
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Configure Notifications Modal -->
    <v-dialog v-model="showNotificationsModal" max-width="600" persistent>
      <v-card>
        <v-card-title class="flex items-center gap-2">
          <v-icon>mdi-bell-cog-outline</v-icon>
          Configure Notifications
        </v-card-title>
        <v-card-subtitle v-if="editingEmail">
          {{ editingEmail.email }}
        </v-card-subtitle>
        <v-card-text>
          <!-- Notes for this email -->
          <div class="mb-4">
            <v-textarea
              v-model="editingEmailNotes"
              label="Notes"
              density="compact"
              variant="outlined"
              rows="2"
              hide-details
            />
          </div>

          <!-- Group quick apply -->
          <div class="mb-4">
            <v-autocomplete
              v-model="editSelectedGroup"
              :items="notificationGroups"
              item-title="name"
              item-value="id"
              label="Apply notification group"
              density="compact"
              variant="outlined"
              clearable
              return-object
              hide-details
              @update:model-value="applyGroupToEdit"
            />
          </div>

          <!-- Notifications switches -->
          <div class="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
            <div
              v-for="notification in availableNotifications"
              :key="`edit-noty-${notification.id}`"
              class="flex items-center justify-between py-2 border-b last:border-b-0"
            >
              <div class="flex-1">
                <span class="font-medium">{{ notification.short_name }}</span>
              </div>
              <v-btn-toggle
                v-model="editNotifications[notification.id]"
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
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="secondary" @click="closeNotificationsModal">Cancel</v-btn>
          <v-btn color="primary" @click="saveEmailNotifications">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { mailNotifications as allMailNotifications } from '~/utils/data/systemData'

const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps({
  emails: {
    type: Array as PropType<any[]>,
    required: false,
    default: () => [],
  },
  entityId: {
    type: [String, Number],
    required: true,
  },
  entityType: {
    type: String as PropType<'consignee' | 'custom_agent' | 'supplier' | 'freight_forwarder' | 'line'>,
    required: true,
    default: 'consignee',
  },
  filterForEntity: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['refresh'])

// Add emails dialog
const showAddDialog = ref(false)
const emailsToAdd = ref<string[]>([])
const currentEmailInput = ref('')
const emailError = ref('')
const emailNotes = ref('')
const emailInputRef = ref<HTMLInputElement | null>(null)
const selectedGroup = ref<any>(null)
const selectedNotifications = ref<Record<number, string>>({})

// Notifications modal
const showNotificationsModal = ref(false)
const editingEmail = ref<any>(null)
const editingEmailNotes = ref('')
const editSelectedGroup = ref<any>(null)
const editNotifications = ref<Record<number, string>>({})

// Data
const notificationGroups = ref<any[]>([])

const availableNotifications = computed(() => {
  if (props.filterForEntity && props.entityType === 'consignee') {
    return allMailNotifications.filter((n) => n.is_for_consignee)
  }
  return allMailNotifications
})

// Load notification groups
const loadNotificationGroups = async () => {
  try {
    const groups = await $api.mailNotificationGroups.getAll(props.entityType)
    notificationGroups.value = groups
  } catch (e) {
    console.error('Error loading notification groups:', e)
  }
}

// Email input handling
const focusEmailInput = () => {
  emailInputRef.value?.focus()
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

const addCurrentEmail = () => {
  const email = currentEmailInput.value.trim()
  if (email && isValidEmail(email)) {
    if (!emailsToAdd.value.includes(email)) {
      emailsToAdd.value.push(email)
    }
    currentEmailInput.value = ''
    emailError.value = ''
  } else if (email) {
    emailError.value = 'Invalid email format'
  }
}

const handleEmailInputKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
    e.preventDefault()
    addCurrentEmail()
  } else if (e.key === 'Backspace' && !currentEmailInput.value && emailsToAdd.value.length > 0) {
    emailsToAdd.value.pop()
  }
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pastedText = e.clipboardData?.getData('text') || ''
  const emails = pastedText.split(/[,;\s\n]+/).filter((email) => email.trim())

  emails.forEach((email) => {
    if (isValidEmail(email) && !emailsToAdd.value.includes(email.trim())) {
      emailsToAdd.value.push(email.trim())
    }
  })
}

const removeEmailToAdd = (index: number) => {
  emailsToAdd.value.splice(index, 1)
}

// Notification selection
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

const applyGroupNotifications = (group: any) => {
  if (!group) return
  // First clear all
  clearAllNotifications()
  // Then apply group notifications
  group.mailNotifications?.forEach((noty: any) => {
    selectedNotifications.value[noty.id] = noty.pivot?.default_type || 'TO'
  })
}

const applyGroupToEdit = (group: any) => {
  if (!group) return
  // Clear all
  availableNotifications.value.forEach((n) => {
    editNotifications.value[n.id] = ''
  })
  // Apply group
  group.mailNotifications?.forEach((noty: any) => {
    editNotifications.value[noty.id] = noty.pivot?.default_type || 'TO'
  })
}

// Dialog management
const openAddEmailsDialog = async () => {
  emailsToAdd.value = []
  currentEmailInput.value = ''
  emailError.value = ''
  emailNotes.value = ''
  selectedGroup.value = null
  selectedNotifications.value = {}
  
  // Initialize all notifications as OFF
  availableNotifications.value.forEach((n) => {
    selectedNotifications.value[n.id] = ''
  })
  
  await loadNotificationGroups()
  showAddDialog.value = true
}

const closeAddDialog = () => {
  showAddDialog.value = false
}

const openNotificationsModal = async (email: any) => {
  editingEmail.value = email
  editingEmailNotes.value = email.notes || ''
  editSelectedGroup.value = null
  editNotifications.value = {}
  
  // Initialize all as OFF
  availableNotifications.value.forEach((n) => {
    editNotifications.value[n.id] = ''
  })
  
  // Set current email notifications
  email.mail_notifications?.forEach((noty: any) => {
    editNotifications.value[noty.id] = noty.pivot?.type || 'TO'
  })
  
  await loadNotificationGroups()
  showNotificationsModal.value = true
}

const closeNotificationsModal = () => {
  showNotificationsModal.value = false
  editingEmail.value = null
}

// Save operations
const saveEmails = async () => {
  try {
    loadingStore.start()
    
    // Build notifications array
    const mailNotificationsData = Object.entries(selectedNotifications.value)
      .filter(([_, type]) => type !== '')
      .map(([id, type]) => ({
        id: parseInt(id),
        type,
      }))
    
    // Save each email
    for (const email of emailsToAdd.value) {
      const body = {
        email,
        notes: emailNotes.value,
        mail_notifications: mailNotificationsData,
      }
      
      await $api.consignees.upsertEmail(props.entityId.toString(), body)
    }
    
    snackbar.add({ type: 'success', text: `${emailsToAdd.value.length} email(s) added successfully` })
    closeAddDialog()
    emit('refresh')
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e.message || 'Error adding emails' })
  } finally {
    loadingStore.stop()
  }
}

const saveEmailNotifications = async () => {
  if (!editingEmail.value) return
  
  try {
    loadingStore.start()
    
    const mailNotificationsData = Object.entries(editNotifications.value)
      .filter(([_, type]) => type !== '')
      .map(([id, type]) => ({
        id: parseInt(id),
        type,
      }))
    
    const body = {
      id: editingEmail.value.id,
      email: editingEmail.value.email,
      notes: editingEmailNotes.value,
      mail_notifications: mailNotificationsData,
    }
    
    await $api.consignees.upsertEmail(props.entityId.toString(), body)
    
    snackbar.add({ type: 'success', text: 'Email notifications updated' })
    closeNotificationsModal()
    emit('refresh')
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e.message || 'Error updating notifications' })
  } finally {
    loadingStore.stop()
  }
}

const confirmDeleteEmail = async (email: any) => {
  const result = await confirm({
    title: 'Delete email?',
    confirmationText: 'Delete',
    content: `Are you sure you want to delete "${email.email}"?`,
    dialogProps: {
      persistent: true,
      maxWidth: 400,
    },
    confirmationButtonProps: {
      color: 'error',
    },
  })
  
  if (result) {
    try {
      loadingStore.start()
      await $api.consignees.deleteEmail(email.id)
      snackbar.add({ type: 'success', text: 'Email deleted' })
      emit('refresh')
    } catch (e: any) {
      console.error(e)
      snackbar.add({ type: 'error', text: e.message || 'Error deleting email' })
    } finally {
      loadingStore.stop()
    }
  }
}
</script>
