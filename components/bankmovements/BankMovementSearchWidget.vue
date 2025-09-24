<template>
  <div>
    <v-card color="lime-lighten-5">
      <v-card-title class="font-bold! text-base!">🔍 Search bank movement</v-card-title>
      <v-card-text @keyup.enter="searchBankMovement">
        <div class="grid grid-cols-8 gap-1">
          <div class="col-span-5">
            <v-text-field v-model="form.id" label="Search by ID" density="compact" hide-details />
          </div>
          <div class="col-span-3 ml-4">
            <v-btn prepend-icon="mdi-refresh" color="red-lighten-3" size="small" @click="resetForm">Reset</v-btn>
          </div>
        </div>
        <div class="flex justify-end">
          <v-btn color="primary" class="mt-4" size="small" @click="searchBankMovement">Search</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  type: {
    type: [String, null],
    required: false,
    default: null,
  },
})

const emits = defineEmits(['update:modelValue'])

const bankMovement = ref(null)

const form = reactive({
  id: null,
})

const resetForm = () => {
  form.id = null
  emits('update:modelValue', null)
}

const searchBankMovement = async () => {
  try {
    bankMovement.value = null
    loadingStore.start()
    const body = {
      type: props.type,
      id: form.id,
    }
    const response: any = await $api.bankMovements.searchBankMovement(body)
    if (response.bank_movement_type_id === 2 && response.sbc_status !== 'approved') {
      snackbar.add({
        text: 'Cheque not approved',
        type: 'error',
      })
      return
    }

    bankMovement.value = response
    emits('update:modelValue', bankMovement)
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
