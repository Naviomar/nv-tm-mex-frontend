<template>
  <div>
    <div v-if="referencia.reference_number != referencia.ref_num_source" class="">
      <v-btn color="blue" variant="outlined" size="small" @click="getSourceReferencia" class="cursor-pointer">
        <v-icon size="small">mdi-source-branch</v-icon>
        {{ referencia.ref_num_source }} View detials
      </v-btn>
    </div>

    <v-dialog v-model="dialog.show" fullscreen>
      <v-card class="bg-gradient-to-r! from-blue-500! via-violet-600! to-pink-400! text-white! p-6">
        <v-toolbar class="bg-gradient-to-r! from-blue-500! via-violet-600! to-pink-400! text-white!">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Source referencia #{{ sourceReferencia?.reference_number }}</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-card class="mb-4">
            <v-card-title><div class="font-bold">Reference details</div></v-card-title>
            <v-card-text>
              <div class="grid grid-cols-[auto_1fr] gap-1">
                <div class="font-bold">Reference #</div>
                <div class="font-bold">
                  <ServiceNumberLabel :service="sourceReferencia" />
                </div>

                <div>Booking Number #</div>
                <div>{{ sourceReferencia.booking_number }}</div>

                <div>Line</div>
                <div>{{ sourceReferencia.line?.name }}</div>

                <div>Vessel / Voyage / destination</div>
                <div>{{ sourceReferencia.voyage_discharge?.name }}</div>

                <div>Origin</div>
                <div>{{ sourceReferencia.origin?.name }}</div>

                <div>POD</div>
                <div>{{ sourceReferencia.pod?.name }}</div>

                <div>POL</div>
                <div>{{ sourceReferencia.pol?.name }}</div>

                <div>Destination</div>
                <div>{{ sourceReferencia.destination?.name }}</div>
                <div class="col-span-2">
                  <v-divider />
                </div>
                <div>Booking number</div>
                <div>{{ sourceReferencia.booking_number }}</div>
                <div>P.O.</div>
                <div>{{ sourceReferencia.po_num }}</div>
                <div class="col-span-2">
                  <v-divider />
                </div>
                <div>Created</div>
                <div>{{ formatDateString(sourceReferencia.created_at) }} by {{ sourceReferencia.creator?.name }}</div>

                <div>Migrated</div>
                <div>{{ formatDateString(sourceReferencia.migrated_at) }} by {{ sourceReferencia.migrator?.name }}</div>

                <div>Last updated by</div>
                <div>{{ sourceReferencia.updator?.name }}</div>
              </div>
            </v-card-text>
          </v-card>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <v-card class="mb-4">
              <v-card-title><div class="font-bold">Master BLs</div></v-card-title>
              <v-card-text>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">Master BL #</th>
                      <th class="text-left">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in sourceReferencia.master_bls" :key="`mbl-${index}`">
                      <td>{{ item.name }}</td>
                      <td><ButtonDownloadS3Object :s3Path="item.attachment" /></td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>

            <v-card class="mb-4">
              <v-card-title><div class="font-bold">House BLs</div></v-card-title>
              <v-card-text>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">House BL #</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in sourceReferencia.house_bls" :key="`hbl-${index}`">
                      <td>{{ item.name }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>

          <SeaCargoDetailsCl :referencia="sourceReferencia" />

        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const props = defineProps({
  referencia: {
    type: Object as PropType<any>,
    required: true,
  },
})

const dialog = ref<any>({
  show: false,
})

const sourceReferencia = ref<any>(null)

const closeDialog = () => {
  dialog.value.show = false
  dialog.value.sourceReferencia = null
}

const getSourceReferencia = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referencias.getSourceReferencia(props.referencia?.id)) as any
    sourceReferencia.value = response
    dialog.value.show = true
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
