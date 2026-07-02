<template>
  <v-dialog :model-value="show" @update:model-value="emit('update:show', $event)" max-width="1800" width="99vw" persistent scrollable>
    <v-card style="height: 95vh; display: flex; flex-direction: column;">
      <v-card-title class="d-flex align-center gap-2 pa-5 pb-4">
        <v-icon color="primary">mdi-email-outline</v-icon>
        <span v-if="mode === 'create'" class="text-h6">
          Add Email(s)
          <v-chip v-if="emailsToCreate.length > 0" color="primary" variant="tonal" size="small" class="ml-2">
            {{ emailsToCreate.length }} added
          </v-chip>
        </span>
        <span v-if="mode === 'edit'" class="text-h6">Edit Email #{{ emailData?.id }}</span>
        <v-spacer />
        <v-btn icon variant="text" size="small" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-5">
        <div class="form-layout">

          <!-- Email -->
          <div class="form-row-2">
            <div>
              <template v-if="mode === 'create'">
                <div class="d-flex gap-2 align-start">
                  <v-text-field
                    v-model="emailPasteInput"
                    density="comfortable"
                    label="Add email(s)"
                    variant="outlined"
                    hide-details
                    placeholder="email1@example.com, email2@example.com"
                    prepend-inner-icon="mdi-at"
                    class="flex-1"
                    @keydown.enter.prevent="parseAndAddEmails"
                    @paste="onEmailPasteEvent"
                  />
                  <v-btn icon color="primary" variant="tonal" size="large" @click="parseAndAddEmails">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
                <p class="text-caption text-medium-emphasis mt-1">
                  Separate by commas, spaces or line breaks. Press Enter or + to add.
                </p>
                <div v-if="emailsToCreate.length > 0" class="d-flex flex-wrap gap-1 mt-2 pa-3 bg-grey-lighten-5 rounded-lg">
                  <v-chip
                    v-for="(email, i) in emailsToCreate"
                    :key="i"
                    closable
                    color="primary"
                    variant="tonal"
                    size="default"
                    @click:close="removeEmail(i)"
                  >
                    {{ email }}
                  </v-chip>
                </div>
                <p v-else class="text-caption text-orange-darken-2 mt-1">No emails added yet.</p>
              </template>
              <template v-else>
                <v-text-field
                  v-model="emailValue"
                  density="comfortable"
                  label="Email"
                  variant="outlined"
                  hide-details="auto"
                  :error-messages="errors.email"
                  prepend-inner-icon="mdi-at"
                />
              </template>
            </div>

            <div>
              <v-text-field
                v-model="notesValue"
                density="comfortable"
                label="Notes (optional)"
                variant="outlined"
                hide-details
                prepend-inner-icon="mdi-note-text-outline"
              />
            </div>
          </div>

          <v-divider />

          <!-- Groups -->
          <div class="form-row-2">
            <div>
              <v-autocomplete
                v-model="selectedGroups"
                :items="notificationGroups"
                item-title="name"
                item-value="id"
                label="Notification groups (optional)"
                density="comfortable"
                variant="outlined"
                clearable
                multiple
                chips
                closable-chips
                return-object
                hide-details
                @update:model-value="applyGroupNotifications"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:subtitle>
                      {{ item.raw.mail_notifications?.length || 0 }} notifications
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>
              <p class="text-caption text-medium-emphasis mt-1">Pre-selects notifications from selected groups</p>
            </div>
          </div>

          <!-- Notification types — full row -->
          <div>
            <v-autocomplete
              v-model="mailNotificationsValue"
              label="Notification types"
              :items="customerMailNotifications"
              item-value="id"
              item-title="short_name"
              density="comfortable"
              variant="outlined"
              :return-object="true"
              multiple
              hide-details
            >
              <template v-slot:selection="{ index }">
                <v-chip v-if="index === 0" size="small" color="primary" variant="tonal">
                  {{ mailNotificationsValue.length }} selected
                </v-chip>
              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :title="formatNotificationName(item.raw.short_name)">
                  <template v-slot:prepend="{ isSelected }">
                    <v-icon :color="isSelected ? 'primary' : 'transparent'" size="small" class="mr-2">
                      mdi-check
                    </v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>

            <!-- Chip grid — full control outside autocomplete -->
            <div v-if="mailNotificationsValue.length > 0" class="noty-chip-grid mt-2">
              <v-chip
                v-for="item in mailNotificationsValue"
                :key="item.id"
                closable
                size="large"
                color="primary"
                variant="tonal"
                class="noty-chip"
                @click:close="removeNotification(item)"
              >
                {{ formatNotificationName(item.short_name) }}
              </v-chip>
            </div>
          </div>

          <v-divider />

          <!-- Ports + Airports -->
          <div class="form-row-2">
            <div>
              <v-autocomplete
                v-model="ports"
                :items="catalogs?.ports || []"
                :item-title="(row: any) => `[${row.country?.code2}] ${row.name}`"
                item-value="id"
                label="Filter by Ports (optional)"
                density="comfortable"
                variant="outlined"
                clearable
                multiple
                chips
                closable-chips
                hide-details
                :disabled="!!lockedPort"
              />
              <div v-if="lockedPort" class="mt-1">
                <v-chip size="small" color="orange" variant="tonal">
                  <v-icon start size="small">mdi-lock</v-icon>
                  Locked: {{ `[${lockedPort.country?.code2}] ${lockedPort.name}` }}
                </v-chip>
              </div>
            </div>

            <div>
              <v-autocomplete
                v-model="airports"
                :items="catalogs?.airports || []"
                item-title="name"
                item-value="id"
                label="Filter by Airports (optional)"
                density="comfortable"
                variant="outlined"
                clearable
                multiple
                chips
                closable-chips
                hide-details
              />
            </div>
          </div>

          <!-- Assigned Notifications grid -->
          <template v-if="values.mail_notifications && values.mail_notifications.length > 0">
            <v-divider />
            <div>
              <div class="d-flex align-center gap-2 mb-3">
                <v-icon color="primary" size="small">mdi-bell-outline</v-icon>
                <span class="text-subtitle-2 font-weight-medium">Assigned Notifications</span>
                <v-chip size="x-small" color="primary" variant="tonal">{{ values.mail_notifications.length }}</v-chip>
                <v-spacer />
                <span class="text-caption text-medium-emphasis">Set all:</span>
                <v-btn-toggle density="compact" rounded="lg" color="primary" variant="outlined">
                  <v-btn size="x-small" class="type-btn" @click="setAllType('TO')">TO</v-btn>
                  <v-btn size="x-small" class="type-btn" @click="setAllType('CC')">CC</v-btn>
                </v-btn-toggle>
              </div>
              <div class="notifications-grid">
                <template v-for="(notification, index) in sortedNotifications" :key="notification.id ?? index">
                  <div
                    class="notif-item"
                    :class="notification.type === 'CC' ? 'notif-item--cc' : 'notif-item--to'"
                  >
                    <div class="d-flex align-center gap-2 flex-1">
                      <v-icon
                        :color="notification.type === 'CC' ? 'amber-darken-2' : 'primary'"
                        size="x-small"
                        class="flex-shrink-0"
                      >mdi-bell</v-icon>
                      <span class="notif-name text-body-2 font-weight-medium">
                        {{ formatNotificationName(displayNameForNotification(notification)) }}
                      </span>
                      <v-chip
                        v-if="isPortFilterableNotification(displayNameForNotification(notification)) && ports && ports.length > 0"
                        size="x-small"
                        color="blue"
                        variant="tonal"
                        class="flex-shrink-0"
                      >
                        port
                      </v-chip>
                    </div>
                    <v-btn-toggle
                      :model-value="notification.type"
                      density="compact"
                      rounded="lg"
                      :color="notification.type === 'CC' ? 'amber-darken-2' : 'primary'"
                      variant="outlined"
                      mandatory
                      class="flex-shrink-0"
                      @update:model-value="onChangeType($event, notification)"
                    >
                      <v-btn value="TO" size="x-small" class="type-btn">TO</v-btn>
                      <v-btn value="CC" size="x-small" class="type-btn">CC</v-btn>
                    </v-btn-toggle>
                  </div>
                </template>
              </div>
            </div>
          </template>

        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="close">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="submitForm">
          <template v-if="mode === 'create' && emailsToCreate.length > 0">
            Save {{ emailsToCreate.length }} email(s)
          </template>
          <template v-else>Save</template>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
import { schema } from '~~/forms/emailNotificationTypeForm'
import { isPortFilterableNotification, formatNotificationName } from '~/utils/mailNotifications'
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String as () => 'create' | 'edit',
    default: 'create'
  },
  emailData: {
    type: Object,
    default: null
  },
  catalogs: {
    type: Object,
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
  warrantyLetterId: {
    type: String,
    default: null
  },
  entrustLetterId: {
    type: String,
    default: null
  },
  lockedPort: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show', 'refresh'])

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const selectedGroups = ref<any[]>([])
const notificationGroups = ref<any[]>([])

const emailPasteInput = ref('')
const emailsToCreate = ref<string[]>([])

const parseEmailsFromText = (text: string): string[] => {
  return text
    .split(/[\s,;|\n\r]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
}

const parseAndAddEmails = () => {
  const raw = emailPasteInput.value.trim()
  if (!raw) return
  const parsed = parseEmailsFromText(raw)
  if (parsed.length === 0) return
  const unique = parsed.filter((e) => !emailsToCreate.value.includes(e))
  emailsToCreate.value = [...emailsToCreate.value, ...unique]
  emailPasteInput.value = ''
}

const onEmailPasteEvent = (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text/plain') || ''
  const parsed = parseEmailsFromText(text)
  if (parsed.length > 1) {
    e.preventDefault()
    const unique = parsed.filter((em) => !emailsToCreate.value.includes(em))
    emailsToCreate.value = [...emailsToCreate.value, ...unique]
    emailPasteInput.value = ''
  }
}

const removeEmail = (index: number) => {
  emailsToCreate.value.splice(index, 1)
}

// Load notification groups
const loadNotificationGroups = async () => {
  try {
    const groups = await $api.mailNotificationGroups.getAll('consignee')
    notificationGroups.value = groups
  } catch (e) {
    console.error('Error loading notification groups:', e)
  }
}

// Apply group notifications when selected (supports multiple groups)
const applyGroupNotifications = (groups: any[] | null) => {
  if (!groups || groups.length === 0) {
    setValues({
      ...values,
      mail_notifications: [],
    })
    return
  }

  const notificationsMap = new Map<number, { id: number; short_name: string; type: string }>()

  groups.forEach((group: any) => {
    group.mail_notifications?.forEach((noty: any) => {
      if (!notificationsMap.has(noty.id)) {
        notificationsMap.set(noty.id, {
          id: noty.id,
          short_name: noty.short_name || noty.name?.replace('App\\Mail\\Mexico\\', ''),
          type: noty.pivot?.default_type || 'TO',
        })
      }
    })
  })

  setValues({
    ...values,
    mail_notifications: sortByName(Array.from(notificationsMap.values())),
  })
}

const { handleSubmit, values, errors, setValues, resetForm } = useForm<any>({
  validationSchema: schema,
  initialValues: {
    id: null,
    email: '',
    notes: '',
    mail_notifications: [],
    mail_notification_ids: [],
    ports: [],
    airports: [],
  },
})

onMounted(() => {
  loadNotificationGroups()
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.mode === 'edit' && props.emailData) {
      setValues({
        id: props.emailData.id,
        email: props.emailData.email,
        notes: props.emailData.notes || '',
        mail_notification_ids: props.emailData.mail_notifications?.map((m: any) => m.id) || [],
        mail_notifications: sortByName(props.emailData.mail_notifications?.map((notification: any) => ({
          short_name: notification.short_name,
          id: notification.id,
          type: notification.pivot?.type,
        })) || []),
        ports: props.emailData.ports?.map((p: any) => p.id) || [],
        airports: props.emailData.airports?.map((a: any) => a.id) || [],
      })
    } else {
      resetForm({
        values: {
          id: null,
          email: '',
          notes: '',
          mail_notifications: [],
          mail_notification_ids: [],
          ports: props.lockedPort ? [props.lockedPort.id] : [],
          airports: [],
        }
      })
    }
    emailsToCreate.value = []
    emailPasteInput.value = ''
    selectedGroups.value = []
  }
})

const emailValue = computed({
  get: () => values.email || '',
  set: (val: string) => setValues({ ...values, email: val })
})

const notesValue = computed({
  get: () => values.notes || '',
  set: (val: string) => setValues({ ...values, notes: val })
})

// Computed properties for ports and airports
const ports = computed({
  get: () => values.ports || [],
  set: (val: number[]) => {
    setValues({ ...values, ports: [...val] })
  }
})

const airports = computed({
  get: () => values.airports || [],
  set: (val: number[]) => {
    setValues({ ...values, airports: [...val] })
  }
})

const sortByName = (arr: any[]) =>
  [...arr].sort((a, b) => (a.short_name ?? '').localeCompare(b.short_name ?? ''))

const mailNotificationsValue = computed({
  get: () => values.mail_notifications || [],
  set: (val: any[]) => {
    const notifications = sortByName(val.map((item: any) => ({
      id: item.id,
      short_name: item.short_name,
      type: item.type || 'TO',
    })))
    setValues({ ...values, mail_notifications: notifications })
  }
})

const customerMailNotifications = computed(() => {
  return mailNotifications.filter((notify) => notify.is_for_consignee)
})

function displayNameForNotification(notification: { id: number; short_name?: string | null }) {
  const fromCatalog = customerMailNotifications.value.find((item: any) => item.id === notification.id)?.short_name
  const name = (fromCatalog ?? notification.short_name ?? '').toString().trim()
  return name || `(ID: ${notification.id})`
}

const sortedNotifications = computed(() => {
  return [...(values.mail_notifications || [])].sort((a, b) => {
    const nameA = displayNameForNotification(a)
    const nameB = displayNameForNotification(b)
    return nameA.localeCompare(nameB)
  })
})

const removeNotification = (item: any) => {
  const updated = (values.mail_notifications || []).filter((n: any) => n.id !== item.id)
  setValues({ ...values, mail_notifications: updated })
}

const setAllType = (type: 'TO' | 'CC') => {
  setValues({
    mail_notifications: values.mail_notifications!.map((item: any) => ({ ...item, type })),
  })
}

const onChangeType = (value: any, notification: any) => {
  setValues({
    mail_notifications: values.mail_notifications!.map((item: any) => {
      if (item.id === notification.id) {
        return {
          ...item,
          type: value,
        }
      }
      return item
    }),
  })
}

const onSuccess = async (formValues: any) => {
  const baseBody: any = { ...formValues }
  if (props.warrantyLetterId) baseBody.warranty_letter_id = props.warrantyLetterId
  if (props.entrustLetterId) baseBody.entrust_letter_id = props.entrustLetterId

  if (props.mode === 'create') {
    await Promise.all(
      emailsToCreate.value.map((email) =>
        $api.consignees.upsertEmail(props.customerId, { ...baseBody, email })
      )
    )
    snackbar.add({
      type: 'success',
      text: `${emailsToCreate.value.length} email(s) saved successfully`,
    })
  } else {
    await $api.consignees.upsertEmail(props.customerId, baseBody)
    snackbar.add({ type: 'success', text: 'Email saved successfully' })
  }
  emit('refresh')
  close()
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values)
  console.log(errors)
  console.log(results)
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const close = () => {
  emit('update:show', false)
  resetForm({
    values: {
      id: null,
      email: '',
      notes: '',
      mail_notification_ids: [],
      ports: [],
      airports: [],
    },
  })
  selectedGroups.value = []
  emailsToCreate.value = []
  emailPasteInput.value = ''
}

const submitForm = () => {
  if (props.mode === 'create') {
    parseAndAddEmails()
    if (emailsToCreate.value.length === 0) {
      snackbar.add({ type: 'warning', text: 'Add at least one email' })
      return
    }
    setValues({ ...values, email: emailsToCreate.value[0] })
  }
  handleSubmit(onSuccess, onInvalidSubmit)()
}
</script>

<style scoped>
.form-layout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 600px) {
  .form-row-2 {
    grid-template-columns: 1fr 1fr;
  }
}

/* Notifications grid */
.notifications-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.4rem;
}

@media (min-width: 600px) {
  .notifications-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 960px) {
  .notifications-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .notifications-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.notif-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: background 0.15s ease;
}

.notif-item--to {
  background: rgba(var(--v-theme-primary), 0.06);
  border-left-color: rgb(var(--v-theme-primary));
}

.notif-item--cc {
  background: rgba(255, 179, 0, 0.08);
  border-left-color: #f9a825;
}

.notif-item:hover {
  filter: brightness(0.97);
}

.notif-name {
  flex: 1;
  line-height: 1.35;
  word-break: break-word;
}

.type-btn {
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  min-width: 32px !important;
  padding: 0 6px !important;
}

.noty-chip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 6px;
}

.noty-chip {
  width: 100% !important;
  font-size: 0.85rem !important;
  font-weight: 500;
  justify-content: space-between !important;
}

.noty-chip :deep(.v-chip__content) {
  flex: 1;
  min-width: 0;
  white-space: normal;
  line-height: 1.3;
}
</style>
