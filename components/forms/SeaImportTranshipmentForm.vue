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
              :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
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
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referenciaId: {
    required: false,
    type: [String, Number],
  },
  currentTranshipments: {
    type: Array,
    required: false,
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

const removeTranshipment = (index: number) => {
  transhipments.value.splice(index, 1)
}
</script>
