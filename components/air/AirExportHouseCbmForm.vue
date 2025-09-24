<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex items-center">
          <v-icon size="x-small">mdi-package-variant-closed</v-icon>
          <div class="ml-2 font-bold">{{ houseawb.name }} - cargo information</div>
        </div>
      </v-card-title>
      <v-card-text>
        <v-card density="compact" class="mb-2">
          <v-card-title>
            <div class="flex justify-between">
              <div class="flex items-center">
                <v-icon size="x-small">mdi-multicast</v-icon>
                <div class="ml-2 font-bold">CBM</div>
              </div>
              <div>
                <v-btn icon="mdi-plus" size="x-small" color="success" @click="addCbm"></v-btn>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-for="(cbm, index) in cbms" :key="`cbm-${index}`" class="grid grid-cols-5 gap-5">
              <div>
                <v-text-field
                  v-model="cbm.num_packages"
                  type="number"
                  density="compact"
                  variant="solo-filled"
                  label="Packages"
                />
              </div>
              <div>
                <v-text-field
                  v-model="cbm.gross_weight"
                  type="number"
                  density="compact"
                  variant="solo-filled"
                  label="Gross weight"
                />
              </div>
              <div>
                <v-text-field
                  v-model="cbm.length"
                  type="number"
                  density="compact"
                  variant="solo-filled"
                  label="Largo"
                />
              </div>
              <div>
                <v-text-field v-model="cbm.width" type="number" density="compact" variant="solo-filled" label="Ancho" />
              </div>
              <div class="flex items-start gap-2">
                <v-text-field v-model="cbm.height" type="number" density="compact" variant="solo-filled" label="Alto" />

                <v-btn
                  icon="mdi-delete-outline"
                  size="x-small"
                  color="red"
                  class="mt-2"
                  @click="removeCbm(index)"
                ></v-btn>
              </div>
            </div>
            <div class="totals">
              <div class="flex justify-end">
                <div class="font-bold">Chargeable weight: {{ cbm.total_m3 }}</div>
              </div>
              <div class="flex justify-end">
                <div class="font-bold">CBM: {{ cbm.total_cbm }}</div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-5 p-2">
              <div class="col-span-3 font-bold">Totals</div>
              <div>
                <v-text-field
                  v-model="totals.packages"
                  type="number"
                  density="compact"
                  variant="outlined"
                  readonly
                  label="Total packages"
                />
              </div>
              <div>
                <v-text-field
                  v-model="totals.gross_weight"
                  type="number"
                  density="compact"
                  variant="outlined"
                  readonly
                  label="Total gross weight"
                />
              </div>
              <div>
                <v-text-field
                  v-model="cbm.total_m3"
                  type="number"
                  density="compact"
                  variant="outlined"
                  readonly
                  label="Total chargeable weight"
                />
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="red" variant="tonal" @click="saveChanges"> Save CBM changes </v-btn>
          </v-card-actions>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  airReference: {
    type: Object as PropType<any>,
    required: true,
  },
  houseawb: {
    type: Object,
    required: true,
  },
})

const cbms = ref<any>([])

watch(
  () => props.houseawb,
  (value) => {
    cbms.value = toRaw(value.cbms)
  },
  { immediate: true }
)

const totals = computed(() => {
  let packages = cbms.value.reduce((acc: any, cbm: any) => {
    return acc + parseFloat(cbm.num_packages || 0)
  }, 0)
  let gross_weight = cbms.value.reduce((acc: any, cbm: any) => {
    return acc + parseFloat(cbm.gross_weight || 0)
  }, 0)

  gross_weight = parseFloat(gross_weight.toFixed(2))

  return {
    packages,
    gross_weight,
  }
})

const cbm = computed(() => {
  let total_cbm = ''
  let total_m3 = cbms.value.reduce((acc: any, cbm: any) => {
    return (
      acc +
      ((parseFloat(cbm.length) * parseFloat(cbm.width) * parseFloat(cbm.height)) / 6000) * parseInt(cbm.num_packages)
    )
  }, 0)

  if (props.airReference.chargeable_weight) {
    total_m3 = parseFloat(props.airReference.chargeable_weight)
  }

  let total_packages = cbms.value.reduce((acc: any, cbm: any) => {
    return acc + parseInt(cbm.num_packages)
  }, 0)

  total_m3 = isNaN(total_m3) ? 0 : parseFloat(total_m3).toFixed(2)
  total_packages = isNaN(total_packages) ? 0 : parseInt(total_packages)
  total_cbm = (total_m3 / 167).toFixed(2)

  return {
    total_m3,
    total_packages,
    total_cbm,
  }
})

const addCbm = () => {
  cbms.value.push({
    num_packages: 0,
    gross_weight: 0,
    length: 0,
    width: 0,
    height: 0,
  })
}

const removeCbm = (index: number) => {
  cbms.value.splice(index, 1)
}

const saveChanges = async () => {
  try {
    loadingStore.start()
    const response = await $api.airExport.updateHouseAwbs(props.airReference.id, props.houseawb.id, {
      cbms: cbms.value,
    })

    snackbar.add({ type: 'success', text: 'CBM updated' })

    cbms.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
