<template>
  <div>
    <div v-if="isLocked">
      <v-btn size="small" variant="tonal" color="purple" @click="showDialog"> Update Arrival Voyage </v-btn>
    </div>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-text>
          <div>Search a new arrival voyage</div>
          <AGlobalSearch
            v-model="newVoyage"
            :onSearch="searchImportVoyages"
            validate-key="update_voyage_discharge_id"
            label="Arrival voyage"
            prepend-inner-icon="mdi-ray-end-arrow"
          />
        </v-card-text>
        <v-card-actions>
          <div class="flex gap-4">
            <v-btn text @click="dialog = false">Cancel</v-btn>
            <v-btn color="lime" @click="saveChanges">Save changes</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referencia: {
    type: [Object, null],
    required: true,
  },
})

const emits = defineEmits(['refresh'])

const dialog = ref(false)
const newVoyage = ref<any>(null)
const showDialog = () => {
  dialog.value = true
}

interface SearchParams {
  name?: string
  id?: number
  [key: string]: any // Allow additional keys, but we will filter them
}

const isLocked = computed(() => {
  return props.referencia?.voyage_discharge?.locked_at != null
})

const searchImportVoyages = async (search: SearchParams) => {
  try {
    const response = await $api.voyages.searchImportVoyages({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching voyages',
    })
  }
}

const saveChanges = async () => {
  try {
    if (!newVoyage.value) {
      snackbar.add({
        type: 'warning',
        text: 'Please select a voyage to update.',
      })
      return
    }

    const body = {
      voyage_discharge_id: newVoyage.value,
    }
    await $api.referencias.updateLockedArrivalVoyage(props.referencia!.id, body)
    snackbar.add({
      type: 'success',
      text: 'Arrival voyage updated successfully.',
    })
    dialog.value = false
    emits('refresh')
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error saving changes. Please try again later.',
    })
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}
</script>
