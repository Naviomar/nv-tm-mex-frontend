<template>
  <div>
  <v-dialog :model-value="show" @update:model-value="emit('update:show', $event)" max-width="900px">
    <v-card>
      <v-card-title>
        Emails for Entrust Letter #{{ entrustLetterId }}
      </v-card-title>
      <v-card-text>
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <v-table v-else-if="emails.length > 0" density="compact">
          <thead>
            <tr>
              <th class="text-left">Actions</th>
              <th class="text-left">Email</th>
              <th class="text-left">Notes</th>
              <th class="text-left">Customs Agent</th>
              <th class="text-left">Port(s)</th>
              <th class="text-left">Airport(s)</th>
              <th class="text-left">Noty Type(s)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in emails" :key="`el-email-${index}`">
              <td>
                <div class="flex gap-2">
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-pencil-outline"
                    color="blue-lighten-2"
                    density="compact"
                    @click="openEditModal(item)"
                  >
                  </v-btn>
                </div>
              </td>
              <td>{{ item.email }}</td>
              <td>
                <span class="text-sm text-gray-600">{{ item.notes || '-' }}</span>
              </td>
              <td>
                <span v-if="item.custom_agent" class="text-sm font-medium">
                  {{ item.custom_agent.short_name || item.custom_agent.name || '-' }}
                </span>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td>
                <div v-if="item.ports && item.ports.length > 0" class="flex flex-wrap gap-1">
                  <v-chip
                    v-for="(port, pIndex) in item.ports"
                    :key="`port-${pIndex}`"
                    size="small"
                    color="blue"
                    variant="tonal"
                  >
                    <v-icon start size="small">mdi-anchor</v-icon>
                    {{ port.name }}
                  </v-chip>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td>
                <div v-if="item.airports && item.airports.length > 0" class="flex flex-wrap gap-1">
                  <v-chip
                    v-for="(airport, aIndex) in item.airports"
                    :key="`airport-${aIndex}`"
                    size="small"
                    color="purple"
                    variant="tonal"
                  >
                    <v-icon start size="small">mdi-airplane</v-icon>
                    {{ airport.name }} ({{ airport.code }})
                  </v-chip>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td>
                <div class="overflow-y-auto max-h-32 my-2 border">
                  <div v-for="(mailNoty, index) in item.mail_notifications" :key="`email-mail-noti-${index}`" class="flex items-center gap-2">
                    <div>
                      <span class="font-bold">{{ mailNoty.pivot.type }}</span
                      >: {{ mailNoty.short_name }}
                    </div>
                    <v-chip
                      v-if="isPortFilterableNotification(mailNoty.short_name) && item.ports && item.ports.length > 0"
                      size="x-small"
                      color="blue"
                      variant="tonal"
                    >
                      by port
                    </v-chip>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
        <div v-else class="text-center py-8 text-gray-500">
          No emails associated with this entrust letter
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" @click="close">Close</v-btn>
        <v-btn color="primary" @click="openCreateModal">Add Email</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </div>
  <ConsigneeEmailModal
    v-if="showEmailModalMounted"
    :show="showEmailModal"
    :mode="emailModalMode"
    :email-data="selectedEmail"
    :catalogs="catalogs"
    :customer-id="customerId"
    :entrust-letter-id="entrustLetterId"
    :locked-port="lockedPort"
    @update:show="onEmailModalUpdate"
    @refresh="refreshEmails"
  />
</template>

<script setup lang="ts">
import { isPortFilterableNotification } from '~/utils/mailNotifications'
import ConsigneeEmailModal from './ConsigneeEmailModal.vue'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  entrustLetterId: {
    type: String,
    required: true
  },
  catalogs: {
    type: Object,
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
  lockedPort: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show', 'refresh'])

const emails = ref<any[]>([])
const loading = ref(false)
const showEmailModal = ref(false)
const showEmailModalMounted = ref(false)
const emailModalMode = ref<'create' | 'edit'>('create')
const selectedEmail = ref<any>(null)

const onEmailModalUpdate = (val: boolean) => {
  showEmailModal.value = val
  if (!val) {
    setTimeout(() => {
      showEmailModalMounted.value = false
    }, 400)
  }
}

const loadEmails = async () => {
  try {
    loading.value = true
    const response = await $api.consignees.getEntrustLetterEmails(props.customerId, props.entrustLetterId)
    emails.value = response
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading emails' })
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('update:show', false)
}

const openCreateModal = () => {
  emailModalMode.value = 'create'
  selectedEmail.value = null
  showEmailModalMounted.value = true
  nextTick(() => { showEmailModal.value = true })
}

const openEditModal = (item: any) => {
  emailModalMode.value = 'edit'
  selectedEmail.value = item
  showEmailModalMounted.value = true
  nextTick(() => { showEmailModal.value = true })
}

const refreshEmails = () => {
  loadEmails()
  emit('refresh')
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    loadEmails()
  }
})
</script>
