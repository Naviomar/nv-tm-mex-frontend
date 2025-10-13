<template>
  <div>
    <v-tabs v-model="tab" bg-color="red-lighten-2" class="tabs1" fixed-tabs density="compact">
      <v-tab
        v-for="(houseawb, index) in airReference.house_awbs"
        :key="`print-house-${index}`"
        prepend-icon="mdi-text-box-outline"
        :text="houseawb.name"
        :value="`print-house-${index}`"
      ></v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item
        v-for="(houseawb, index) in airReference.house_awbs"
        :key="`print-house-window-${index}`"
        :value="`print-house-${index}`"
      >
        <v-card flat>
          <v-card-text>
            <AirExportPrintHouseAWB :airReference="airReference" :houseAwb="houseawb" @refresh="getData" />
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const tab = ref('print-house-0')
const airReference = ref<any>({})

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const getData = async () => {
  try {
    loadingStore.start()
    airReference.value = {
      house_awbs: [],
    }
    const response = (await $api.airExport.getReferenceById(props.id.toString())) as any

    airReference.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()
</script>
