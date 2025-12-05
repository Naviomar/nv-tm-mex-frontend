<template>
  <div>
    <div v-if="hasReferenciaCl" class="">
      <v-btn color="blue" variant="outlined" size="small" @click="showDialog" class="cursor-pointer">
        <v-icon size="small">mdi-source-branch</v-icon>
        {{ referenciaCl.reference_number }} View detials
      </v-btn>
    </div>

    <v-dialog v-model="dialog.show" fullscreen>
      <v-card class="bg-gradient-to-r! from-blue-500! via-violet-600! to-pink-400! text-white! p-6">
        <v-toolbar class="bg-gradient-to-r! from-blue-500! via-violet-600! to-pink-400! text-white!">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>CL Source referencia #{{ referenciaCl?.reference_number }}</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-card class="mb-4">
            <v-card-title><div class="font-bold">Reference details</div></v-card-title>
            <v-card-text>
              <div class="grid grid-cols-[auto_1fr] gap-1">
                <div class="font-bold">Reference #</div>
                <div class="font-bold">
                  <ServiceNumberLabel :service="referenciaCl" />
                </div>

                <div>Booking Number #</div>
                <div>{{ referenciaCl.booking_number }}</div>

                <div>Line</div>
                <div>{{ referenciaCl.line?.name }}</div>

                <div>Departure vessel</div>
                <div>{{ referenciaCl.vessel_departure?.name }}</div>

                <div>Origin</div>
                <div>{{ referenciaCl.origin?.name }}</div>

                <div>POD</div>
                <div>{{ referenciaCl.pod?.name }}</div>

                <div>POL</div>
                <div>{{ referenciaCl.pol?.name }}</div>

                <div>Destination</div>
                <div>{{ referenciaCl.destination?.name }}</div>
                <div class="col-span-2">
                  <v-divider />
                </div>
                <div>Booking number</div>
                <div>{{ referenciaCl.booking_number }}</div>
                <div>P.O.</div>
                <div>{{ referenciaCl.po_num }}</div>
                <div class="col-span-2">
                  <v-divider />
                </div>
                <div>Embalaje</div>
                <div>{{ referenciaCl.embalaje?.name }}</div>
                <div class="col-span-2">
                  <v-divider />
                </div>
                <div class="font-bold col-span-2">Reference History (CL)</div>
                <div>Created by</div>
                <div>{{ referenciaCl.creator?.name || '-' }} <span v-if="referenciaCl.created_at" class="text-gray-500 text-xs">@ {{ formatDateString(referenciaCl.created_at) }}</span></div>

                <div>Migrated by</div>
                <div>{{ referenciaCl.migrator?.name || '-' }} <span v-if="referenciaCl.migrated_at" class="text-gray-500 text-xs">@ {{ formatDateString(referenciaCl.migrated_at) }}</span></div>

                <div>Last updated by</div>
                <div>{{ referenciaCl.updator?.name || '-' }} <span v-if="referenciaCl.updated_at" class="text-gray-500 text-xs">@ {{ formatDateString(referenciaCl.updated_at) }}</span></div>
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
                      <th class="text-left">Consignee MBL</th>
                      <th class="text-left">Type</th>
                      <th class="text-left">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in referenciaCl.master_bls" :key="`mbl-${index}`">
                      <td>{{ item.name }}</td>
                      <td>{{ item.consignee_mbl?.name }}</td>
                      <td>{{ item.type }}</td>
                      <td>
                        <ButtonDownloadS3Object :s3Path="item.attachment" />
                      </td>
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
                      <th class="text-left">Consignee</th>
                      <th class="text-left">Type</th>
                      <th class="text-left">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in referenciaCl.house_bls" :key="`hbl-${index}`">
                      <td>{{ item.name }}</td>
                      <td>{{ item.consignee?.name }}</td>
                      <td>{{ item.type }}</td>
                      <td>
                        <ButtonDownloadS3Object :s3Path="item.attachment" />
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>

          <SeaCargoDetailsCl :referencia="referenciaCl" />

        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  referenciaCl: {
    type: Object as PropType<any>,
    required: false,
    default: null,
  },
})

const hasReferenciaCl = computed(() => props.referenciaCl != null)

const dialog = ref<any>({
  show: false,
})

const showDialog = () => {
  dialog.value.show = true
}

const closeDialog = () => {
  dialog.value.show = false
}
</script>
