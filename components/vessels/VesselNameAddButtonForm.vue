<template>
  <div>
    <v-btn color="green" size="small" variant="tonal" @click="addVesselName">Add new vessel name</v-btn>

    <v-dialog v-model="form.show" max-width="600">
      <v-card>
        <v-card-title>
          <h3>New vessel</h3>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" density="compact" label="Vessel name" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="form.show = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveVesselName">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const emits = defineEmits(['refresh'])

let form = reactive({
  show: false,
  name: '',
})

const addVesselName = () => {
  form.show = true
}

const saveVesselName = async () => {
  try {
    if (!form.name) {
      snackbar.add({ type: 'error', text: 'Vessel name is required' })
      return
    }
    loadingStore.start()
    await $api.vessels.newVesselName(form.name)
    snackbar.add({ type: 'success', text: 'Vessel name created' })
    form.name = ''
    form.show = false
    emits('refresh')
  } catch (error) {
    snackbar.add({ type: 'error', text: 'Error creating vessel name' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
