<template>
  <div>
    <div>Voyage details</div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="flex gap-2">
              <EditButton :item="voyage" @click="editVoyageForm" />
              <div class="font-bold">Voyage {{ voyage.name }}</div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2">
              <div class="font-bold">Import/Export</div>
              <div class="font-bold">{{ voyage.impoExpo === 'I' ? 'Import' : 'Export' }}</div>
              <div class="font-bold">Freight line</div>
              <div class="font-bold">{{ voyage.vessel?.line?.name }}</div>
              <div class="font-bold">Vessel</div>
              <div>
                <div class="flex items-center gap-2">
                  <ViewButton :item="voyage.vessel" @click="goToVessel" />
                  <div class="font-bold">
                    {{ voyage.vessel?.name }}
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div># Destinations</div>
              <div>{{ voyage.destinations?.length }}</div>
              <div>Created at</div>
              <div>{{ formatDateString(voyage.created_at) }}</div>
              <div>Created by</div>
              <div>{{ voyage.creator?.name }}</div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <div class="grid grid-cols-1">
      <v-card class="mb-4">
        <v-card-title>
          <div class="font-bold">Destinations</div>
        </v-card-title>
        <v-card-text>
          <div>
            <VoyageAddDestinationForm :voyage="voyage" @refresh="getData" />
          </div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold! w-10">Actions</th>
                <th class="font-bold!">Port</th>
                <th class="font-bold!">ETA</th>
                <th class="font-bold!">ATA</th>
                <th class="font-bold!">Sailed</th>
                <th class="font-bold!">Linked services</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(destination, index) in voyage.destinations" :key="`destination-${index}`">
                <td>
                  <EditButton :item="destination" @click="goToVoyageDestination" />
                </td>
                <td>{{ destination.pod?.name }}</td>
                <td>{{ destination.eta_date }}</td>
                <td>{{ destination.arrival_date }}</td>
                <td>{{ destination.is_sailed === 0 ? 'No' : 'Yes' }}</td>
                <td>
                  <div
                    v-for="(reference, refIndex) in destination.referencias"
                    :key="`reference-${refIndex}`"
                    class="flex flex-col gap-2"
                  >
                    <nuxt-link
                      :to="
                        voyage.impoExpo === 'I'
                          ? `/maritime/import/${reference.id}`
                          : `/maritime/export/${reference.id}`
                      "
                      target="_blank"
                      class="underline"
                    >
                      <v-icon>mdi-open-in-new</v-icon>
                      {{ reference.reference_number }}
                    </nuxt-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>

    <v-dialog v-model="dialogForm.show" max-width="500">
      <v-card>
        <v-card-title>
          <div class="font-bold">Edit voyage</div>
        </v-card-title>
        <v-card-text>
          <VoyageEditForm :id="voyage.id" @refresh="getData" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const voyage = ref<any>({})

const dialogForm = ref<any>({
  show: false,
  form: {},
})

const goToVessel = (vessel: any) => {
  router.push(`/configuration/vessels/view-${vessel.id}`)
}

const editVoyageForm = (voyage: any) => {
  dialogForm.value.show = true
  dialogForm.value.form = voyage.value
}

const goToVoyageDestination = (destination: any) => {
  router.push(`/configuration/voyages/destination-${destination.id}`)
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.voyages.getById(props.id)
    voyage.value = response
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
