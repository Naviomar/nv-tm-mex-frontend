<template>
  <div>
    <v-tabs v-model="tab" bg-color="red-lighten-2" fixed-tabs>
      <v-tab
        v-for="(houseawb, index) in airReference.house_awbs"
        :key="`house-${index}`"
        prepend-icon="mdi-text-box-outline"
        :text="houseawb.name"
        :value="`house-${index}`"
      ></v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item
        v-for="(houseawb, index) in airReference.house_awbs"
        :key="`house-window-${index}`"
        :value="`house-${index}`"
      >
        <v-card flat>
          <v-card-text>
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
                    </div>
                  </v-card-title>
                  <v-card-text>
                    <div v-for="(cbm, index) in houseawb.cbms" :key="`cbm-${index}`">
                      <div class="grid grid-cols-5 gap-5">
                        <div>
                          <v-text-field
                            v-model="cbm.num_packages"
                            type="number"
                            density="compact"
                            variant="solo-filled"
                            label="Packages"
                            readonly
                          />
                        </div>
                        <div>
                          <v-text-field
                            v-model="cbm.gross_weight"
                            type="number"
                            density="compact"
                            variant="solo-filled"
                            label="Gross weight"
                            readonly
                          />
                        </div>
                        <div>
                          <v-text-field
                            v-model="cbm.length"
                            type="number"
                            density="compact"
                            variant="solo-filled"
                            label="Largo"
                            readonly
                          />
                        </div>
                        <div>
                          <v-text-field
                            v-model="cbm.width"
                            type="number"
                            density="compact"
                            variant="solo-filled"
                            label="Ancho"
                            readonly
                          />
                        </div>
                        <div class="flex items-start gap-2">
                          <v-text-field
                            v-model="cbm.height"
                            type="number"
                            density="compact"
                            variant="solo-filled"
                            label="Alto"
                            readonly
                          />
                        </div>
                      </div>
                    </div>
                    <div class="totals">
                      <div class="flex justify-end">
                        <div class="font-bold">Chargeable weight: {{ getTotalM3.toFixed(2) }}</div>
                      </div>
                      <div class="flex justify-end">
                        <div class="font-bold">CBM: {{ getTotalCbm.toFixed(2) }}</div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  airReference: {
    type: Object,
    required: true,
  },
})

const tab = ref('house-0')

const getTotalM3 = computed(() => {
  if (props.airReference.chargeable_weight) {
    return parseFloat(props.airReference.chargeable_weight)
  }
  // loop house_awbs.cmbs and calculate total m3
  let total_m3 = 0
  props.airReference.house_awbs.forEach((houseawb: any) => {
    houseawb.cbms.forEach((cbm: any) => {
      total_m3 +=
        ((parseFloat(cbm.length) * parseFloat(cbm.width) * parseFloat(cbm.height)) / 6000) * parseInt(cbm.num_packages)
    })
  })

  return total_m3
})

const getTotalCbm = computed(() => {
  let total_cbm = getTotalM3.value / 167
  return isNaN(total_cbm) ? 0 : total_cbm
})
</script>
