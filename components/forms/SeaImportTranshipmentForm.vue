<template>
  <div>
    <v-card density="compact" class="mb-2">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-multicast</v-icon>
            <div class="ml-2 font-bold">Transhipment information</div>
          </div>
          <div>
            <v-btn icon="mdi-plus" size="x-small" color="success" @click="addTranshipment"></v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div v-for="(tranship, index) in transhipments" :key="`tranship-${index}`" class="grid grid-cols-2 gap-2">
          <div>
            <AGlobalSearch
              v-model="tranship.port_id"
              :onSearch="searchPorts"
              append-inner-icon="mdi-ferry"
              :set-id="tranship.port_id"
              :validate-key="`port_id_${index}`"
              :item-title="(row : any) => `[${row.country?.code2}] ${row.name} (${row.code})`"
              label="T/S Port"
            />
          </div>
          <div class="flex items-start gap-2">
            <v-text-field
              v-model="tranship.tranship_date"
              type="date"
              density="compact"
              variant="solo-filled"
              label="Date"
            />

            <v-btn
              icon="mdi-delete-outline"
              size="x-small"
              color="red"
              class="mt-2"
              @click="removeTranshipment(index)"
            ></v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const confirm = $notifications.useConfirm()

const props = defineProps({
  referenciaId: {
    required: false,
    type: [String, Number],
  },
  currentTranshipments: {
    type: Array,
    required: false,
  },
  isExport: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['update:transhipments'])

const transhipments = ref<any[]>([])

const searchPorts = async (search: any) => {
  try {
    // Define the allowed keys you want to search by
    const allowedKeys = ['name', 'id']

    // Create the query object, filtering out any keys not in allowedKeys
    const query = Object.keys(search)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = search[key]
        return obj
      }, {})

    const response = await $api.ports.searchPorts({
      query: query,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching ports',
    })
  }
}

// watch
watch(
  () => props.currentTranshipments,
  (currentTranshipments) => {
    if (currentTranshipments) {
      transhipments.value = [...currentTranshipments]
    }
  },
  { immediate: true }
)

// emit transhipments
watch(
  () => transhipments.value,
  (transhipments) => {
    emit('update:transhipments', transhipments)
  },
  { deep: true }
)

const addTranshipment = () => {
  transhipments.value.push({
    referencia_id: props.referenciaId,
    port_id: null,
    tranship_date: '',
  })
}

const removeTranshipment = async (index: number) => {
  const tranship = transhipments.value[index]

  // Un tranship ya guardado (id != null) solo se borra via el endpoint
  // dedicado: depender del guardado completo del form es lo que causaba
  // bajas masivas por payload desactualizado (mismo patron ya corregido
  // en el resto de entidades).
  if (tranship?.id != null) {
    const result = await confirm({
      title: 'Are you sure?',
      confirmationText: 'Yes, delete transhipment',
      content: 'Please confirm you want to delete this transhipment. This action cannot be undone.',
      dialogProps: {
        persistent: true,
        maxWidth: 500,
      },
      confirmationButtonProps: {
        color: 'red',
      },
    })
    if (!result) return

    try {
      loadingStore.start()
      const api = props.isExport ? $api.referenciasExport : $api.referencias
      await api.removeTranshipment(props.referenciaId!.toString(), { transhipment_id: tranship.id })
      snackbar.add({ type: 'success', text: 'Transhipment deleted' })
      // Splice local en vez de emit('refresh'): un refresh completo del
      // form descartaria ediciones sin guardar en otros campos.
      const realIndex = transhipments.value.findIndex((t) => t.id === tranship.id)
      if (realIndex !== -1) transhipments.value.splice(realIndex, 1)
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
    return
  }

  transhipments.value.splice(index, 1)
}
</script>
