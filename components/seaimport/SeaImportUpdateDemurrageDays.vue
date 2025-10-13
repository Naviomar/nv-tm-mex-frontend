<template>
  <div>
    <v-btn size="small" class="chip-ocean cursor-pointer btn-border-slide" @click="showDialog">
      Update demurrages free days
    </v-btn>
    <div>
      <v-dialog v-model="dialog.show" max-width="500">
        <v-card class="">
          <v-toolbar class="">
            <v-btn icon @click="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Update demurrages free days</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <div v-if="hasVOyageDischargeInitDemurrages">
              <v-alert density="compact" type="warning">
                <span>Demurrages already initialized. Days can not be updated here.</span>
              </v-alert>
            </div>
            <div v-if="!hasVOyageDischargeInitDemurrages">
              <v-text-field
                v-model="form.demurrage_days"
                density="compact"
                type="number"
                label="Update demurrages free days"
              />
              <div class="flex justify-center">
                <v-btn size="small" color="primary" @click="onClickUpdateDemurrageDays">Save changes</v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referencia: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['refresh'])

const form = ref<any>({
  demurrage_days: null,
})

const hasVOyageDischargeInitDemurrages = computed(() => {
  return props.referencia?.voyage_discharge?.init_demurrage_at != null
})

const dialog = ref<any>({
  show: false,
})

const showDialog = () => {
  dialog.value.show = true
}

const closeDialog = () => {
  dialog.value.show = false
}

const onClickUpdateDemurrageDays = async () => {
  try {
    if (form.value.demurrage_days == null || form.value.demurrage_days === '') {
      snackbar.add({ type: 'error', text: 'Please fill all the fields' })
      return
    }
    if (form.value.demurrage_days < 0) {
      snackbar.add({ type: 'error', text: 'Please enter a positive number' })
      return
    }
    loadingStore.start()
    const body = {
      referencia_id: props.referencia.id,
      demurrage_days: form.value.demurrage_days,
    }
    const response = await $api.referencias.updateSeaImportDemurrageDays(props.referencia.id, body)
    snackbar.add({ type: 'success', text: 'Demurrage free days updated' })
    closeDialog()
    emits('refresh')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

watch(
  () => props.referencia,
  async () => {
    if (props.referencia) {
      form.value.demurrage_days = props.referencia.demurrage_days
    }
  },
  { immediate: true }
)
</script>
