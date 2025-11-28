<template>
  <div>
    <div>Vessel details</div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Vessel {{ vessel.name }}</div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2">
              <div class="font-bold">Line</div>
              <div class="font-bold">{{ vessel.line?.name }}</div>
            </div>

            <div class="grid grid-cols-2">
              <div># Voyages</div>
              <div>{{ vessel.voyages.length }}</div>
              <div>Created at</div>
              <div>{{ formatDateString(vessel.created_at) }}</div>
              <div>Created by</div>
              <div>{{ vessel.creator?.name }}</div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <div class="grid grid-cols-1">
      <v-card class="mb-4">
        <v-card-title>
          <div class="font-bold">Voyages</div>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold!">Voyage</th>
                <th class="font-bold!">Import / Export</th>
                <th class="font-bold!">Destination(s)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(voyage, index) in vessel.voyages" :key="`voyage-${index}`">
                <td>
                  <div class="flex items-center gap-2">
                    <ViewButton :item="voyage" @click="viewVoyage" />
                  {{ voyage.name }}
                </div>
                </td>
                <td>{{ voyage.impoExpo == 'I' ? 'Import' : 'Export' }}</td>
                <td>
                  <ul>
                    <li v-for="(destination, index) in voyage.destinations" :key="`destination-${index}`">
                      {{ destination.name }}
                    </li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const vessel = ref<any>(null)

const viewVoyage = (voyage: any) => {
  router.push(`/configuration/voyages/view-${voyage.id}`)
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.vessels.getVesselDetails(props.id)
    vessel.value = response
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
