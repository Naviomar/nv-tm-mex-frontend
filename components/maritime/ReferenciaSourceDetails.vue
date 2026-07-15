<template>
  <div>
    <div v-if="referencia.reference_number != referencia.ref_num_source" class="d-inline-block">
      <v-btn color="primary" variant="outlined" size="small" @click="getSourceReferencia" class="cursor-pointer">
        <v-icon size="small" class="me-1">mdi-source-branch</v-icon>
        {{ referencia.ref_num_source }} View details
      </v-btn>
    </div>

    <v-dialog v-model="dialog.show" fullscreen transition="dialog-bottom-transition">
      <v-card class="bg-gradient-to-r! from-slate-900! via-slate-800! to-slate-900! text-white! p-6">
        <v-toolbar class="bg-gradient-to-r! from-slate-900! via-slate-800! to-slate-900! text-white!">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title class="text-base md:text-lg font-semibold text-white!">
            Source referencia #{{ sourceReferencia?.reference_number }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-card-text class="pa-4 pa-md-6">
          <!-- Main Reference Details Card -->
          <v-card class="mb-6 rounded-lg!">
            <v-card-title class="border-b py-3 px-4">
              <h2 class="text-base md:text-lg font-bold">Reference Details</h2>
            </v-card-title>
            <v-card-text class="py-4 px-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <!-- Row 1: Core Identifiers -->
                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">Reference #</span>
                  <span class="font-bold text-base mt-0.5">
                    <ServiceNumberLabel :service="sourceReferencia" />
                  </span>
                </div>

                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">Booking Number</span>
                  <span class="mt-0.5 font-medium">{{ sourceReferencia.booking_number || '-' }}</span>
                </div>

                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">P.O. Number</span>
                  <span class="mt-0.5 font-medium">{{ sourceReferencia.po_num || '-' }}</span>
                </div>

                <!-- Row 2: Route & Transit -->
                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">Line</span>
                  <span class="mt-0.5 font-medium">{{ sourceReferencia.line?.name || '-' }}</span>
                </div>

                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">Vessel / Voyage / Destination</span>
                  <span class="mt-0.5 font-medium">{{ sourceReferencia.voyage_discharge?.name || '-' }}</span>
                </div>

                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">Origin</span>
                  <span class="mt-0.5 font-medium">{{ sourceReferencia.origin?.name || '-' }}</span>
                </div>

                <!-- Row 3: Ports -->
                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">POL (Port of Loading)</span>
                  <span class="mt-0.5 font-medium">{{ sourceReferencia.pol?.name || '-' }}</span>
                </div>

                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">POD (Port of Discharge)</span>
                  <span class="mt-0.5 font-medium">{{ sourceReferencia.pod?.name || '-' }}</span>
                </div>

                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">Final Destination</span>
                  <span class="mt-0.5 font-medium">{{ sourceReferencia.destination?.name || '-' }}</span>
                </div>

                <!-- Divider -->
                <div class="col-span-1 sm:col-span-2 md:col-span-3 my-2">
                  <v-divider />
                </div>

                <!-- Row 4: Audit & Logs -->
                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">Created</span>
                  <span class="mt-0.5 font-medium">
                    {{ formatDateString(sourceReferencia.created_at) }}
                    <span v-if="sourceReferencia.creator?.name" class="text-xs opacity-75 font-normal block sm:inline sm:ml-1">
                      by {{ sourceReferencia.creator.name }}
                    </span>
                  </span>
                </div>

                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">Migrated</span>
                  <span class="mt-0.5 font-medium">
                    {{ formatDateString(sourceReferencia.migrated_at) }}
                    <span v-if="sourceReferencia.migrator?.name" class="text-xs opacity-75 font-normal block sm:inline sm:ml-1">
                      by {{ sourceReferencia.migrator.name }}
                    </span>
                  </span>
                </div>

                <div class="flex flex-col">
                  <span class="text-xs font-semibold opacity-70 uppercase tracking-wider">Last Updated By</span>
                  <span class="mt-0.5 font-medium">{{ sourceReferencia.updator?.name || '-' }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Master / House BLs Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <v-card class="rounded-lg!">
              <v-card-title class="border-b py-3 px-4">
                <h3 class="text-sm md:text-base font-bold">Master BLs</h3>
              </v-card-title>
              <v-card-text class="pa-0">
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">Master BL #</th>
                      <th class="text-left">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in sourceReferencia.master_bls" :key="`mbl-${index}`">
                      <td class="font-medium">{{ item.name }}</td>
                      <td>
                        <ButtonDownloadS3Object :s3Path="item.attachment" />
                      </td>
                    </tr>
                    <tr v-if="!sourceReferencia.master_bls || sourceReferencia.master_bls.length === 0">
                      <td colspan="2" class="text-center py-4 opacity-70 text-xs">No Master BLs found</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>

            <v-card class="rounded-lg!">
              <v-card-title class="border-b py-3 px-4">
                <h3 class="text-sm md:text-base font-bold">House BLs</h3>
              </v-card-title>
              <v-card-text class="pa-0">
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">House BL #</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in sourceReferencia.house_bls" :key="`hbl-${index}`">
                      <td class="font-medium">{{ item.name }}</td>
                    </tr>
                    <tr v-if="!sourceReferencia.house_bls || sourceReferencia.house_bls.length === 0">
                      <td class="text-center py-4 opacity-70 text-xs">No House BLs found</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>

          <!-- Cargo Details Component -->
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
