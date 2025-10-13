<template>
  <div>
    <v-btn color="green" variant="outlined" size="small" class="cursor-pointer" @click="addCE"
      >+ Carta Encomienda / Garantía por evento</v-btn
    >

    <div v-if="ceForm.show" class="bg-slate-100 dark:bg-slate-800 p-4 rounded">
      <v-autocomplete
        v-model="ceForm.customs_agent_id"
        density="compact"
        label="Customs Agent"
        :items="customsAgents"
        item-title="short_name"
        item-value="id"
        variant="solo-filled"
      />
      <div class="flex flex-col justify-center gap-1 ml-2">
        <v-checkbox
          v-model="ceForm.letter_types"
          :value="'encomienda'"
          label="Carta Encomienda"
          density="compact"
          hide-details
        />
        <v-checkbox
          v-model="ceForm.letter_types"
          :value="'garantia'"
          label="Carta Garantía"
          density="compact"
          hide-details
        />
        <span v-if="ceForm.showError" class="text-xs text-red-600">Selecciona al menos un tipo de carta.</span>
      </div>
      <div class="flex justify-start gap-2">
        <v-btn color="red" variant="outlined" size="small" @click="cancelCeForm">Cancel</v-btn>
        <v-btn color="green" variant="outlined" size="small" @click="saveCe">Save</v-btn>
      </div>
    </div>

    <!-- Tabla Cartas Encomienda -->
    <div class="mt-6">
      <h4 class="font-bold mb-2">Cartas Encomienda</h4>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left w-10">Actions</th>
            <th class="text-left">Entrust letter A.A. (by event)</th>
            <th class="text-left">User</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cartaEncomienda, index) in cartasEncomiendas" :key="`ref-ce-encomienda-${index}`">
            <td>
              <v-btn color="red" variant="outlined" size="small" @click="removeCe(cartaEncomienda)">Remove</v-btn>
            </td>
            <td>{{ cartaEncomienda.customs_agent?.short_name }}</td>
            <td>
              <UserInfoBadge :item="cartaEncomienda" />
            </td>
          </tr>
          <tr v-if="cartasEncomiendas.length === 0">
            <td colspan="3" class="text-center text-gray-400">No hay cartas encomienda registradas.</td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Tabla Cartas Garantía -->
    <div class="mt-8">
      <h4 class="font-bold mb-2">Cartas Garantía</h4>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left w-10">Actions</th>
            <th class="text-left">Warranty Letter A.A. (by event)</th>
            <th class="text-left">User</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cartaGarantia, index) in cartasGarantia" :key="`ref-ce-garantia-${index}`">
            <td>
              <v-btn color="red" variant="outlined" size="small" @click="removeCe(cartaGarantia)">Remove</v-btn>
            </td>
            <td>{{ cartaGarantia.customs_agent?.short_name }}</td>
            <td>
              <UserInfoBadge :item="cartaGarantia" />
            </td>
          </tr>
          <tr v-if="cartasGarantia.length === 0">
            <td colspan="3" class="text-center text-gray-400">No hay cartas garantía registradas.</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const props = defineProps({
  referencia: {
    type: Object,
    required: true,
  },
})

const customsAgents = ref<any>([])
const emits = defineEmits(['update:referencia'])
const cartasEncomiendas = ref<any>([])
const cartasGarantia = ref<any>([])

const ceForm = reactive({
  show: false,
  customs_agent_id: null,
  letter_types: [] as string[],
  showError: false,
})

const addCE = () => {
  ceForm.show = true
  ceForm.letter_types = []
  ceForm.showError = false
}

const cancelCeForm = () => {
  ceForm.show = false
  ceForm.customs_agent_id = null
  ceForm.letter_types = []
  ceForm.showError = false
}

const saveCe = async () => {
  if (!ceForm.customs_agent_id) {
    snackbar.add({
      text: 'Please select a customs agent',
      type: 'warning',
    })
    return
  }
  if (!ceForm.letter_types.length) {
    ceForm.showError = true
    return
  }
  ceForm.showError = false

  try {
    loadingStore.start()
    const body = {
      customs_agent_id: ceForm.customs_agent_id,
      letter_types: ceForm.letter_types,
    }
    await $api.referencias.addCartaEncomienda(props.referencia.id, body)
    cancelCeForm()
    emits('update:referencia')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 500)
  }
}

const removeCe = async (cartaEncomienda: any) => {
  loadingStore.start()

  try {
    await $api.referencias.removeCartaEncomienda(props.referencia.id, cartaEncomienda)

    snackbar.add({
      text: 'Carta Encomienda removed successfully',
      type: 'success',
    })

    emits('update:referencia')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 500)
  }
}

const getCustomsAgents = async () => {
  try {
    const response = await $api.customAgents.getAll()
    customsAgents.value = response
  } catch (e) {
    console.error(e)
  }
}

watch(
  () => props.referencia,
  (newReferencia) => {
    if (newReferencia) {
      cartasEncomiendas.value = newReferencia.ref_entrusts
      cartasGarantia.value = newReferencia.ref_warranty_letters
    }
  },
  { immediate: true, deep: true }
)

await getCustomsAgents()
</script>
