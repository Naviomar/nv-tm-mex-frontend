<template>
  <v-dialog
    v-model="dialog.show"
    width="95%"
    max-width="1800"
    scrollable
    persistent
    :fullscreen="$vuetify.display.smAndDown"
  >
    <v-card rounded="xl">
      <v-toolbar color="primary" density="comfortable">
        <v-toolbar-title>
          {{ dialog.mode === 'create' ? 'Create Freight Group' : dialog.mode === 'edit' ? 'Edit Freight Group' : 'View Freight Group' }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
      </v-toolbar>
      <v-card-text class="space-y-4 pt-4">
        <div class="grid grid-cols-1 gap-3">
          <v-text-field
            v-model="form.name"
            label="Name *"
            variant="outlined"
            density="compact"
            :readonly="dialog.mode === 'view'"
            :error-messages="errors.name"
          />
          <v-autocomplete
            v-model="form.freight_ids"
            label="Freight forwarders"
            variant="outlined"
            density="compact"
            :items="freightForwarderOptions"
            item-value="id"
            item-title="name"
            multiple
            chips
            closable-chips
            :readonly="dialog.mode === 'view'"
            :loading="loadingFreights"
          >
            <template v-slot:item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps" :title="item.raw.name">
                <template v-if="item.raw.otherGroupName" v-slot:subtitle>
                  <span class="text-warning">Currently in: {{ item.raw.otherGroupName }}</span>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
          <div v-if="reassignedFreights.length" class="text-caption text-warning">
            <v-icon size="small">mdi-alert</v-icon>
            The following will be moved out of their current group: {{ reassignedFreights.map((f) => f.name).join(', ') }}
          </div>
        </div>

        <!-- Bank accounts for view/edit mode -->
        <FreightBankForm
          v-if="dialog.mode !== 'create' && dialog.itemId"
          :id="dialog.itemId.toString()"
          owner-type="freight_group"
          :readonly="dialog.mode === 'view'"
        />

        <!-- Similar items search -->
        <v-card variant="tonal" color="info" class="mt-3">
          <v-card-text class="pa-3">
            <div class="flex items-center gap-2">
              <v-icon size="small">mdi-information-outline</v-icon>
              <span class="text-sm">Search for similar groups before saving</span>
            </div>
          </v-card-text>
        </v-card>

        <v-btn
          v-if="dialog.mode !== 'view'"
          color="primary"
          prepend-icon="mdi-magnify"
          size="small"
          @click="searchSimilar"
          :loading="searching"
        >
          Search similar
        </v-btn>

        <div v-if="similarItems.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
          <div class="text-sm font-medium text-grey-darken-1">Similar groups:</div>
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

      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn
          v-if="dialog.mode !== 'view'"
          color="primary"
          prepend-icon="mdi-content-save"
          :loading="saving"
          :disabled="saving"
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
  freight_ids: [] as number[],
})

const errors = reactive({
  name: '',
})

const similarItems = ref<any[]>([])
const searching = ref(false)
const saving = ref(false)
const allFreightForwarders = ref<any[]>([])
const loadingFreights = ref(false)

// Items for the multiselect, annotated with the group each FF currently
// belongs to (if any other than this one) so picking it makes the
// reassignment obvious instead of silently stealing it on save.
const freightForwarderOptions = computed(() =>
  allFreightForwarders.value.map((ff: any) => ({
    ...ff,
    otherGroupName:
      ff.freight_group_id && ff.freight_group_id !== dialog.itemId ? ff.freight_group?.name : null,
  }))
)

const reassignedFreights = computed(() =>
  freightForwarderOptions.value.filter(
    (ff: any) => form.freight_ids.includes(ff.id) && ff.otherGroupName
  )
)

const loadAllFreightForwarders = async () => {
  try {
    loadingFreights.value = true
    const response = await $api.freightForwarders.getAllFreightForwarders()
    allFreightForwarders.value = Array.isArray(response) ? response : (response?.data ?? [])
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading freight forwarders catalog' })
  } finally {
    loadingFreights.value = false
  }
}

const openCreate = async () => {
  dialog.mode = 'create'
  dialog.itemId = null
  resetForm()
  dialog.show = true
  await loadAllFreightForwarders()
}

const openEdit = async (id: number) => {
  dialog.mode = 'edit'
  dialog.itemId = id
  await loadAllFreightForwarders()
  const loaded = await loadFreightGroup(id)
  const freightsLoaded = loaded && (await loadGroupFreights(id))
  if (freightsLoaded) {
    dialog.show = true
  } else {
    dialog.itemId = null
  }
}

const openView = async (id: number) => {
  dialog.mode = 'view'
  dialog.itemId = id
  await loadAllFreightForwarders()
  const loaded = await loadFreightGroup(id)
  const freightsLoaded = loaded && (await loadGroupFreights(id))
  if (freightsLoaded) {
    dialog.show = true
  } else {
    dialog.itemId = null
  }
}

const closeDialog = () => {
  dialog.show = false
  resetForm()
  similarItems.value = []
}

const resetForm = () => {
  form.name = ''
  form.freight_ids = []
  errors.name = ''
}

const loadFreightGroup = async (id: number) => {
  try {
    loadingStore.start()
    const response = await $api.freightForwardersGroups.getById(id.toString())
    Object.assign(form, response)
    return true
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading freight group' })
    return false
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const loadGroupFreights = async (id: number) => {
  try {
    const response = await $api.freightForwardersGroups.getFreightForwardersInAGroup(id.toString())
    const freights = Array.isArray(response) ? response : (response?.freightForwarders ?? [])
    // Deleted FFs aren't offered as options in the multiselect, so exclude
    // them here too - otherwise their id would sit in freight_ids without a
    // matching chip, and saving would silently keep them tied to the group.
    form.freight_ids = freights.filter((ff: any) => !ff.deleted_at).map((ff: any) => ff.id)
    return true
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading freight forwarders assigned to this group' })
    return false
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
    const response = await $api.freightForwardersGroups.searchByName(body)
    const items = Array.isArray(response) ? response : []
    similarItems.value = dialog.mode === 'edit' && dialog.itemId
      ? items.filter((group: any) => String(group.id) !== String(dialog.itemId))
      : items
  } catch (e) {
    console.error(e)
  } finally {
    searching.value = false
  }
}

const validate = () => {
  errors.name = ''

  let isValid = true

  if (!form.name || form.name.trim() === '') {
    errors.name = 'Name is required'
    isValid = false
  }

  return isValid
}

const save = async () => {
  if (saving.value) return

  if (!validate()) {
    return
  }

  try {
    saving.value = true
    loadingStore.start()

    if (dialog.mode === 'create') {
      const created: any = await $api.freightForwardersGroups.create(form)
      // Switch to edit mode right away so a retry (e.g. if the assignment
      // below fails) updates this group instead of creating a duplicate.
      dialog.mode = 'edit'
      dialog.itemId = created.id
      snackbar.add({ type: 'success', text: 'Freight group created' })

      try {
        await $api.freightForwardersGroups.assignFreights(created.id.toString(), form.freight_ids)
      } catch (e) {
        console.error(e)
        snackbar.add({ type: 'warning', text: 'Group created, but freight forwarders could not be assigned. Please edit the group and try again.' })
        emit('refresh')
        return
      }
    } else if (dialog.mode === 'edit' && dialog.itemId) {
      await $api.freightForwardersGroups.update(dialog.itemId.toString(), form)
      await $api.freightForwardersGroups.assignFreights(dialog.itemId.toString(), form.freight_ids)
      snackbar.add({ type: 'success', text: 'Freight group updated' })
    }

    closeDialog()
    emit('refresh')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error saving freight group' })
  } finally {
    saving.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const emit = defineEmits(['refresh'])

defineExpose({
  openCreate,
  openEdit,
  openView,
})
</script>
