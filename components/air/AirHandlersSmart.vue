<template>
  <div>
    <v-btn color="primary" size="small" variant="outlined" @click="formProcess.showDialog"> Add Handler </v-btn>

    <v-dialog v-model="formProcess.dialog.value" max-width="450">
      <v-card>
        <v-card-title>
          <span class="headline">New Handler</span>
        </v-card-title>
        <v-card-text>
          <v-text-field density="compact" label="Name" v-model="formProcess.form.value.name" />
          <v-text-field density="compact" label="Gaffette" v-model="formProcess.form.value.gaffette" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="formProcess.hideDialog">Cancel</v-btn>
          <v-btn color="primary" @click="formProcess.save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const loadingStore = useLoadingStore()
const emits = defineEmits(['refresh'])

const useForm = () => {
  const form = ref({
    name: '',
    gaffette: '',
  })

  const dialog = ref<boolean>(false)

  const showDialog = () => {
    dialog.value = true
  }

  const hideDialog = () => {
    form.value = {
      name: '',
      gaffette: '',
    }
    dialog.value = false
  }

  const save = async () => {
    try {
      loadingStore.start()
      const body = {
        name: form.value.name,
        gaffette: form.value.gaffette,
      }
      const response = await $api.airImport.addHandler(body)
      emits('refresh')
      hideDialog()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }

  return {
    form,
    showDialog,
    hideDialog,
    dialog,
    save,
  }
}

const formProcess = useForm()
</script>
