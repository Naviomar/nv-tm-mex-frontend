<template>
  <div>
    <v-tabs v-model="tab" bg-color="red-lighten-2" class="tabs1" fixed-tabs>
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
            <AirExportHouseCbmForm :airReference="airReference" :houseawb="houseawb" />
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

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  impoExpo: {
    type: String,
    required: true,
    default: 'expo',
  },
  refreshData: {
    type: Function,
    required: false,
    default: () => {},
  },
})

const tab = ref('house-0')
const airReference = ref<any>({})

const getData = async () => {
  try {
    loadingStore.start()
    let response = null
    if (props.impoExpo === 'impo') {
      response = (await $api.airImport.getReferenceById(props.id)) as any
    } else {
      response = (await $api.airExport.getReferenceById(props.id)) as any
    }
    // const response = (await $api.airExport.getReferenceById(props.id)) as any

    airReference.value = response
    // cbms.value = response.cbms.map((cbm: any) => {
    //   return {
    //     num_packages: cbm.num_packages,
    //     largo: cbm.length,
    //     ancho: cbm.width,
    //     alto: cbm.height,
    //   }
    // })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()
props.refreshData(getData)
</script>
