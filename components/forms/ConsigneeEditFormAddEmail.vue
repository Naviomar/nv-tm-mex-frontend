<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex justify-between">
        <div>Emails</div>
        <div>
          <v-btn icon size="x-small" @click="openCreateModal" color="success">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-text>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">Actions</th>
            <th class="text-left">Email</th>
            <th class="text-left">Notes</th>
            <th class="text-left">Port(s)</th>
            <th class="text-left">Airport(s)</th>
            <th class="text-left">Noty Type(s)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in emails" :key="`cus-email-${index}`">
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
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-delete-outline"
                  color="red-lighten-2"
                  density="compact"
                  @click="showConfirmDelete(item.id)"
                ></v-btn>
              </div>
            </td>
            <td>
              <div>{{ item.email }}</div>
              <div v-if="item.warranty_letters && item.warranty_letters.length > 0" class="text-sm text-gray-600">
                <span v-for="(wl, wlIndex) in item.warranty_letters" :key="`wl-${wlIndex}`">
                  {{ wl.custom_agent?.short_name || wl.custom_agent?.name || '-' }}<span v-if="Number(wlIndex) < item.warranty_letters.length - 1">, </span>
                </span>
              </div>
              <div v-else class="text-sm text-gray-600">-</div>
            </td>
            <td>
              <span class="text-sm text-gray-600">{{ item.notes || '-' }}</span>
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
    </v-card-text>
    <ConsigneeEmailModal
      v-model:show="showModal"
      :mode="modalMode"
      :email-data="selectedEmail"
      :catalogs="catalogs"
      :customer-id="id"
      @refresh="emit('refresh')"
    />
  </v-card>
</template>
<script setup lang="ts">
import { isPortFilterableNotification } from '~/utils/mailNotifications'
import ConsigneeEmailModal from './ConsigneeEmailModal.vue'

const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps(['emails', 'catalogs', 'id'])
const emit = defineEmits(['refresh'])

const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedEmail = ref<any>(null)

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
</script>
