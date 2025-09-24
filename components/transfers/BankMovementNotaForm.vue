<template>
  <div>
    <v-autocomplete
      v-model="form.is_usable"
      :items="[
        { value: false, name: 'No' },
        { value: true, name: 'Yes' },
      ]"
      density="compact"
      label="It is bank movement an usable payment? "
      item-title="name"
      item-value="value"
      outlined
      clearable
    />
    <v-textarea v-model="form.usable_notes" density="compact" label="Usable notes" rows="3" />
    <div>
      Nota: Si se marca como un movimiento NO pagable este movimiento no se podrá usar para pagar ningún tipo de factura
      dentro del sistema.
    </div>

    <v-btn color="primary" @click="updateNota" :disabled="form.is_usable === null">Save changes</v-btn>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  bankMovement: {
    type: Object as any,
  },
})

const emits = defineEmits(['refresh'])

const form = ref<any>({
  is_usable: null,
  usable_notes: '',
})

watch(
  () => props.bankMovement,
  (value) => {
    if (value) {
      form.value.is_usable = value.is_usable == 1 ? true : false
      form.value.usable_notes = value.usable_notes
    }
  },
  { immediate: true }
)

const updateNota = async () => {
  try {
    if (form.value.is_usable == null) {
      return
    }
    loadingStore.loading = true
    const response = await $api.bankMovements.setBankMovementNota(props.bankMovement.id, form.value)

    snackbar.add({ type: 'success', text: 'Nota actualizada' })

    emits('refresh')
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 200)
  }
}
</script>
