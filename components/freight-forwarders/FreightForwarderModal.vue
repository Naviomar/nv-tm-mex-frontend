<template>
  <v-dialog v-model="dialog.show" :max-width="dialog.mode === 'view' ? 1200 : 1400" scrollable persistent>
    <v-card rounded="xl">
      <v-toolbar :color="dialog.mode === 'view' ? 'info' : 'primary'" density="comfortable">
        <v-toolbar-title>
          {{ dialog.mode === 'create' ? 'Create Freight Forwarder' : dialog.mode === 'edit' ? 'Edit Freight Forwarder' : 'View Freight Forwarder' }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
      </v-toolbar>
      <v-card-text class="space-y-4 pt-4">
        <!-- View Mode -->
        <div v-if="dialog.mode === 'view'" class="space-y-4">
          <v-card variant="tonal" color="info">
            <v-card-title class="text-h6">General Information</v-card-title>
            <v-card-text>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-grey-darken-1">Name</div>
                  <div class="text-body-1 font-medium">{{ form.name || '—' }}</div>
                </div>
                <div>
                  <div class="text-sm text-grey-darken-1">RFC</div>
                  <div class="text-body-1">{{ form.tax_number || '—' }}</div>
                </div>
                <div>
                  <div class="text-sm text-grey-darken-1">Contact Name</div>
                  <div class="text-body-1">{{ form.contact_name || '—' }}</div>
                </div>
                <div>
                  <div class="text-sm text-grey-darken-1">Contact Phone</div>
                  <div class="text-body-1">{{ form.contact_phone || '—' }}</div>
                </div>
                <div>
                  <div class="text-sm text-grey-darken-1">Country</div>
                  <div class="text-body-1">{{ getCountryName(form.country_id) || '—' }}</div>
                </div>
                <div>
                  <div class="text-sm text-grey-darken-1">Freight Group</div>
                  <div class="text-body-1">{{ getFreightGroupName(form.freight_group_id) || '—' }}</div>
                </div>
                <div class="md:col-span-2">
                  <div class="text-sm text-grey-darken-1">Address</div>
                  <div class="text-body-1">{{ form.address || '—' }}</div>
                </div>
                <div>
                  <div class="text-sm text-grey-darken-1">State</div>
                  <div class="text-body-1">{{ form.state || '—' }}</div>
                </div>
                <div>
                  <div class="text-sm text-grey-darken-1">Zip Code</div>
                  <div class="text-body-1">{{ form.zip_code || '—' }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Bank and Email for view mode -->
          <div v-if="dialog.itemId" class="space-y-3">
            <FreightBankForm :id="dialog.itemId.toString()" :readonly="dialog.mode === 'view'" />
            <FFagentEmailsForm :freight-forwarder="form" :readonly="dialog.mode === 'view'" @refresh="() => loadFreightForwarder(dialog.itemId!)" />
          </div>
        </div>

        <!-- Create/Edit Mode -->
        <div v-else class="grid grid-cols-12 gap-4">
          <div v-if="dialog.mode === 'edit'" class="text-red-600 text-sm font-medium mb-4 col-span-12">
            Please note: editing the freight forwarder name should only be done to correct typographical errors. The name is used in various reference contexts.
          </div>

          <!-- Main form fields -->
          <div class="col-span-12 lg:col-span-7">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <v-text-field
                v-model="form.name"
                label="Name *"
                variant="outlined"
                density="compact"
                :error-messages="errors.name"
              />
              <v-text-field
                v-model="form.tax_number"
                label="RFC"
                variant="outlined"
                density="compact"
              />
              <v-text-field
                v-model="form.contact_name"
                label="Contact Name *"
                variant="outlined"
                density="compact"
                :error-messages="errors.contact_name"
              />
              <v-text-field
                v-model="form.contact_phone"
                label="Contact Phone *"
                variant="outlined"
                density="compact"
                :error-messages="errors.contact_phone"
              />
              <v-autocomplete
                v-model="form.country_id"
                label="Country"
                :items="catalogs.countries"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="compact"
                clearable
              />
              <v-autocomplete
                v-model="form.freight_group_id"
                label="Freight group"
                :items="catalogs.freightGroups"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="compact"
                clearable
              />
              <v-text-field
                v-model="form.address"
                label="Address"
                variant="outlined"
                density="compact"
                class="md:col-span-2"
              />
              <v-text-field
                v-model="form.state"
                label="State"
                variant="outlined"
                density="compact"
              />
              <v-text-field
                v-model="form.zip_code"
                label="Zip code"
                variant="outlined"
                density="compact"
              />
            </div>
          </div>

          <!-- Similar items search -->
          <div class="col-span-12 lg:col-span-5">
            <v-card variant="tonal" color="info" class="mb-3">
              <v-card-text class="pa-3">
                <div class="flex items-center gap-2">
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <span class="text-sm">Search for similar freight forwarders before saving</span>
                </div>
              </v-card-text>
            </v-card>

            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              size="small"
              @click="searchSimilar"
              :loading="searching"
            >
              Search similar
            </v-btn>

            <div v-if="similarItems.length > 0" class="mt-3 space-y-2 max-h-96 overflow-y-auto">
              <div class="text-sm font-medium text-grey-darken-1">Similar freight forwarders:</div>
              <v-card
                v-for="item in similarItems"
                :key="item.id"
                variant="outlined"
                density="compact"
                class="pa-2"
              >
                <div class="text-sm font-medium">{{ item.name }}</div>
                <div class="text-xs text-grey-darken-1">#{{ item.id }}</div>
              </v-card>
            </div>

            <!-- Bank and Email forms for edit mode -->
            <div v-if="dialog.mode === 'edit' && dialog.itemId" class="mt-4 space-y-3">
              <FreightBankForm :id="dialog.itemId.toString()" :readonly="false" />
              <FFagentEmailsForm :freight-forwarder="form" :readonly="false" @refresh="() => loadFreightForwarder(dialog.itemId!)" />
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn
          v-if="dialog.mode !== 'view'"
          color="primary"
          prepend-icon="mdi-content-save"
          :loading="saving"
          @click="save"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const dialog = reactive({
  show: false,
  mode: 'create' as 'create' | 'edit' | 'view',
  itemId: null as number | null,
})

const form = reactive({
  name: '',
  tax_number: '',
  contact_name: '',
  contact_phone: '',
  country_id: null as number | null,
  freight_group_id: null as number | null,
  address: '',
  state: '',
  zip_code: '',
})

const errors = reactive({
  name: '',
  contact_name: '',
  contact_phone: '',
})

const catalogs = ref({
  countries: [] as any[],
  freightGroups: [] as any[],
})

const similarItems = ref<any[]>([])
const searching = ref(false)
const saving = ref(false)

const openCreate = () => {
  dialog.mode = 'create'
  dialog.itemId = null
  resetForm()
  dialog.show = true
}

const openEdit = async (id: number) => {
  dialog.mode = 'edit'
  dialog.itemId = id
  await loadFreightForwarder(id)
  dialog.show = true
}

const openView = async (id: number) => {
  dialog.mode = 'view'
  dialog.itemId = id
  await loadFreightForwarder(id)
  dialog.show = true
}

const closeDialog = () => {
  dialog.show = false
  resetForm()
  similarItems.value = []
}

const resetForm = () => {
  form.name = ''
  form.tax_number = ''
  form.contact_name = ''
  form.contact_phone = ''
  form.country_id = null
  form.freight_group_id = null
  form.address = ''
  form.state = ''
  form.zip_code = ''
  errors.name = ''
  errors.contact_name = ''
  errors.contact_phone = ''
}

const loadFreightForwarder = async (id: number) => {
  try {
    loadingStore.start()
    const response = await $api.freightForwarders.getById(id.toString())
    Object.assign(form, response)
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading freight forwarder' })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const searchSimilar = async () => {
  if (!form.name) {
    snackbar.add({ type: 'warning', text: 'Name is required to search' })
    return
  }

  try {
    searching.value = true
    const body = { name: form.name }
    const response = await $api.freightForwarders.searchByName(body)
    const items = Array.isArray(response) ? response : []
    similarItems.value = dialog.mode === 'edit' && dialog.itemId
      ? items.filter((ff: any) => String(ff.id) !== String(dialog.itemId))
      : items
  } catch (e) {
    console.error(e)
  } finally {
    searching.value = false
  }
}

const validate = () => {
  errors.name = ''
  errors.contact_name = ''
  errors.contact_phone = ''

  let isValid = true

  if (!form.name || form.name.trim() === '') {
    errors.name = 'Name is required'
    isValid = false
  }

  if (!form.contact_name || form.contact_name.trim() === '') {
    errors.contact_name = 'Contact name is required'
    isValid = false
  }

  if (!form.contact_phone || form.contact_phone.trim() === '') {
    errors.contact_phone = 'Contact phone is required'
    isValid = false
  }

  return isValid
}

const save = async () => {
  if (!validate()) {
    return
  }

  try {
    saving.value = true
    loadingStore.start()

    if (dialog.mode === 'create') {
      await $api.freightForwarders.create(form)
      snackbar.add({ type: 'success', text: 'Freight forwarder created' })
    } else if (dialog.mode === 'edit' && dialog.itemId) {
      await $api.freightForwarders.update(dialog.itemId.toString(), form)
      snackbar.add({ type: 'success', text: 'Freight forwarder updated' })
    }

    closeDialog()
    // Emit event to refresh table
    emit('refresh')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error saving freight forwarder' })
  } finally {
    saving.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const getCatalogs = async () => {
  try {
    const response = await $api.freightForwarders.getCatalogs()
    catalogs.value = response as any
  } catch (e) {
    console.error(e)
  }
}

const getCountryName = (countryId: number | null) => {
  if (!countryId) return null
  const country = catalogs.value.countries?.find((c: any) => c.id === countryId)
  return country?.name || null
}

const getFreightGroupName = (groupId: number | null) => {
  if (!groupId) return null
  const group = catalogs.value.freightGroups?.find((g: any) => g.id === groupId)
  return group?.name || null
}

const emit = defineEmits(['refresh'])

defineExpose({
  openCreate,
  openEdit,
  openView,
})

onMounted(() => {
  getCatalogs()
})
</script>
