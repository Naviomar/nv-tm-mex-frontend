<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <v-icon>mdi-account-group</v-icon>
          <span>Contacts by Area</span>
        </div>
        <div>
          <v-btn icon size="x-small" @click="toggleForm" :color="showForm ? 'black' : 'success'">
            <v-icon v-if="showForm">mdi-close</v-icon>
            <v-icon v-if="!showForm">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-text>
      <!-- Form to add/edit contact -->
      <div v-if="showForm" class="p-4 mb-4 bg-slate-100 dark:bg-neutral-800 rounded-lg">
        <div class="font-bold mb-3">{{ isEditing ? 'Edit Contact' : 'Add New Contact' }}</div>
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2">
            <v-autocomplete
              v-model="form.contact_type"
              label="Area *"
              :items="contactTypes"
              item-value="value"
              item-title="name"
              variant="solo-filled"
              density="compact"
              :prepend-inner-icon="form.contact_type === 'import' ? 'mdi-arrow-down-bold' : 'mdi-arrow-up-bold'"
            />
          </div>
          <div class="col-span-2 md:col-span-1">
            <v-text-field
              v-model="form.name"
              label="Name *"
              variant="solo-filled"
              density="compact"
            />
          </div>
          <div class="col-span-2 md:col-span-1">
            <v-text-field
              v-model="form.position"
              label="Position"
              variant="solo-filled"
              density="compact"
              placeholder="e.g. Operations Manager"
            />
          </div>
          <div class="col-span-2 md:col-span-1">
            <v-text-field
              v-model="form.email"
              label="Email"
              variant="solo-filled"
              density="compact"
              type="email"
            />
          </div>
          <div class="col-span-2 md:col-span-1">
            <v-text-field
              v-model="form.phone"
              label="Phone"
              variant="solo-filled"
              density="compact"
            />
          </div>
          <div class="col-span-2">
            <div class="flex justify-end items-center gap-2">
              <v-btn color="secondary" @click="cancelForm">Cancel</v-btn>
              <v-btn color="primary" @click="saveContact" :loading="saving">
                {{ isEditing ? 'Update' : 'Save' }}
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs for Import/Export -->
      <v-tabs v-model="activeTab" color="primary" density="compact">
        <v-tab value="import">
          <v-icon class="mr-2">mdi-arrow-down-bold</v-icon>
          Import ({{ importContacts.length }})
        </v-tab>
        <v-tab value="export">
          <v-icon class="mr-2">mdi-arrow-up-bold</v-icon>
          Export ({{ exportContacts.length }})
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Import Contacts -->
        <v-window-item value="import">
          <v-table density="compact" class="mt-2">
            <thead>
              <tr>
                <th class="text-left" width="80">Actions</th>
                <th class="text-left">Name</th>
                <th class="text-left">Position</th>
                <th class="text-left">Email</th>
                <th class="text-left">Phone</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="importContacts.length === 0">
                <td colspan="5" class="text-center text-gray-500 py-4">
                  No import contacts registered
                </td>
              </tr>
              <tr v-for="contact in importContacts" :key="contact.id">
                <td>
                  <div class="flex gap-1">
                    <v-btn
                      size="small"
                      variant="text"
                      icon="mdi-pencil-outline"
                      color="primary"
                      @click="editContact(contact)"
                    />
                    <v-btn
                      size="small"
                      variant="text"
                      icon="mdi-delete-outline"
                      color="red-lighten-2"
                      @click="confirmDelete(contact)"
                    />
                  </div>
                </td>
                <td>{{ contact.name }}</td>
                <td>{{ contact.position || '-' }}</td>
                <td>{{ contact.email || '-' }}</td>
                <td>{{ contact.phone || '-' }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- Export Contacts -->
        <v-window-item value="export">
          <v-table density="compact" class="mt-2">
            <thead>
              <tr>
                <th class="text-left" width="80">Actions</th>
                <th class="text-left">Name</th>
                <th class="text-left">Position</th>
                <th class="text-left">Email</th>
                <th class="text-left">Phone</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="exportContacts.length === 0">
                <td colspan="5" class="text-center text-gray-500 py-4">
                  No export contacts registered
                </td>
              </tr>
              <tr v-for="contact in exportContacts" :key="contact.id">
                <td>
                  <div class="flex gap-1">
                    <v-btn
                      size="small"
                      variant="text"
                      icon="mdi-pencil-outline"
                      color="primary"
                      @click="editContact(contact)"
                    />
                    <v-btn
                      size="small"
                      variant="text"
                      icon="mdi-delete-outline"
                      color="red-lighten-2"
                      @click="confirmDelete(contact)"
                    />
                  </div>
                </td>
                <td>{{ contact.name }}</td>
                <td>{{ contact.position || '-' }}</td>
                <td>{{ contact.email || '-' }}</td>
                <td>{{ contact.phone || '-' }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps({
  line: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['refresh'])

const showForm = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const activeTab = ref('import')

const contactTypes = [
  { value: 'import', name: 'Import' },
  { value: 'export', name: 'Export' },
]

const form = ref({
  contact_type: 'import',
  name: '',
  email: '',
  phone: '',
  position: '',
})

const importContacts = computed(() => {
  return props.line.contacts?.filter((c: any) => c.contact_type === 'import') || []
})

const exportContacts = computed(() => {
  return props.line.contacts?.filter((c: any) => c.contact_type === 'export') || []
})

const toggleForm = () => {
  if (showForm.value) {
    cancelForm()
  } else {
    showForm.value = true
    form.value.contact_type = activeTab.value
  }
}

const cancelForm = () => {
  showForm.value = false
  isEditing.value = false
  editingId.value = null
  resetForm()
}

const resetForm = () => {
  form.value = {
    contact_type: activeTab.value,
    name: '',
    email: '',
    phone: '',
    position: '',
  }
}

const editContact = (contact: any) => {
  isEditing.value = true
  editingId.value = contact.id
  showForm.value = true
  form.value = {
    contact_type: contact.contact_type,
    name: contact.name,
    email: contact.email || '',
    phone: contact.phone || '',
    position: contact.position || '',
  }
}

const saveContact = async () => {
  if (!form.value.name || !form.value.contact_type) {
    snackbar.add({ type: 'warning', text: 'Name and Area are required' })
    return
  }

  try {
    saving.value = true
    loadingStore.start()

    if (isEditing.value && editingId.value) {
      await $api.lines.updateContact(props.line.id, editingId.value, form.value)
      snackbar.add({ type: 'success', text: 'Contact updated successfully' })
    } else {
      await $api.lines.addContact(props.line.id, form.value)
      snackbar.add({ type: 'success', text: 'Contact added successfully' })
    }

    cancelForm()
    emit('refresh')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error saving contact' })
  } finally {
    saving.value = false
    loadingStore.stop()
  }
}

const confirmDelete = async (contact: any) => {
  const result = await confirm({
    title: 'Delete Contact',
    confirmationText: 'Delete',
    content: `Are you sure you want to delete the contact "${contact.name}"?`,
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
      await $api.lines.deleteContact(props.line.id, contact.id)
      snackbar.add({ type: 'success', text: 'Contact deleted successfully' })
      emit('refresh')
    } catch (e) {
      console.error(e)
      snackbar.add({ type: 'error', text: 'Error deleting contact' })
    } finally {
      loadingStore.stop()
    }
  }
}
</script>
