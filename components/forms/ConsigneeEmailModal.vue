<template>
  <v-dialog :model-value="show" @update:model-value="emit('update:show', $event)" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span v-if="mode === 'create'">Add Email</span>
        <span v-if="mode === 'edit'">Edit Email #{{ emailData?.id }}</span>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2">
              <v-text-field
                v-model="emailValue"
                density="compact"
                label="Email"
                variant="outlined"
                hide-details="auto"
                :error-messages="errors.email"
              />
            </div>
            <div class="col-span-2">
              <v-text-field
                v-model="notesValue"
                density="compact"
                label="Notes (optional)"
                variant="outlined"
                hide-details
              />
            </div>
            <!-- Group Selection -->
            <div class="col-span-2">
              <v-autocomplete
                v-model="selectedGroups"
                :items="notificationGroups"
                item-title="name"
                item-value="id"
                label="Select notification groups (optional)"
                density="compact"
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
              <p class="text-gray-500 text-xs mt-1">Selecting groups will pre-select notifications from all of them</p>
            </div>
            <div class="col-span-2">
              <v-autocomplete
                v-model="mailNotificationsValue"
                label="Notification type"
                :items="customerMailNotifications"
                item-value="id"
                item-title="short_name"
                density="compact"
                variant="outlined"
                :return-object="true"
                chips
                closable-chips
                multiple
                hide-details
              />
            </div>
            <div class="col-span-2">
              <v-autocomplete
                v-model="ports"
                :items="catalogs?.ports || []"
                :item-title="(row: any) => `[${row.country?.code2}] ${row.name}`"
                item-value="id"
                label="Filter by Ports (optional)"
                density="compact"
                variant="outlined"
                clearable
                multiple
                chips
                closable-chips
                hide-details
                :disabled="!!lockedPort"
              />
              <div v-if="lockedPort" class="mt-1">
                <v-chip size="default" color="orange" variant="tonal">
                  <v-icon start size="small">mdi-lock</v-icon>
                  Port locked to: {{ `[${lockedPort.country?.code2}] ${lockedPort.name}` }}
                </v-chip>
              </div>
            </div>
            <div class="col-span-2">
              <v-autocomplete
                v-model="airports"
                :items="catalogs?.airports || []"
                item-title="name"
                item-value="id"
                label="Filter by Airports (optional)"
                density="compact"
                variant="outlined"
                clearable
                multiple
                chips
                closable-chips
                hide-details
              />
            </div>
            <div class="col-span-2">
              <div v-for="(notification, index) in values.mail_notifications" :key="index">
                <div v-if="customerMailNotifications.find((item: any) => item.id === notification.id)"
                     class="grid grid-cols-2 items-center gap-2 mb-4">
                  <div class="col-span-1 min-h-[1.5rem] flex items-center gap-2">
                    {{ displayNameForNotification(notification) }}
                    <v-chip
                      v-if="isPortFilterableNotification(displayNameForNotification(notification)) && ports && ports.length > 0"
                      size="x-small"
                      color="blue"
                      variant="tonal"
                    >
                      by port
                    </v-chip>
                  </div>
                  <v-autocomplete
                    :model-value="notification.type"
                    label="Select CC / TO"
                    :items="[
                      { title: 'TO:', value: 'TO' },
                      { title: 'CC:', value: 'CC' },
                    ]"
                    item-value="value"
                    item-title="title"
                    density="compact"
                    variant="outlined"
                    hide-details
                    @update:model-value="onChangeType($event, notification)"
                  />
                </div>
              </div>
            </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" @click="close">Cancel</v-btn>
        <v-btn color="primary" @click="submitForm">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
import { schema } from '~~/forms/emailNotificationTypeForm'
import { isPortFilterableNotification } from '~/utils/mailNotifications'
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
    mail_notifications: Array.from(notificationsMap.values()),
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
        mail_notifications: props.emailData.mail_notifications?.map((notification: any) => ({
          short_name: notification.short_name,
          id: notification.id,
          type: notification.pivot?.type,
        })) || [],
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

const mailNotificationsValue = computed({
  get: () => values.mail_notifications || [],
  set: (val: any[]) => {
    const notifications = val.map((item: any) => ({
      id: item.id,
      short_name: item.short_name,
      type: item.type || 'TO', // Default type if not set
    }))
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

const onSuccess = async (values: any) => {
  const body = {
    ...values,
  }
  if (props.warrantyLetterId) {
    body.warranty_letter_id = props.warrantyLetterId
  }
  if (props.entrustLetterId) {
    body.entrust_letter_id = props.entrustLetterId
  }
  await $api.consignees.upsertEmail(props.customerId, body)
  snackbar.add({ type: 'success', text: 'Email saved successfully' })
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
}

const submitForm = handleSubmit(onSuccess, onInvalidSubmit)
</script>
