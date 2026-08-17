<template>
  <div class="inline-block">
    <v-tooltip text="View linked references" location="top">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          size="x-small"
          variant="text"
          icon="mdi-information-outline"
          color="primary"
          @click="showDialog"
        />
      </template>
    </v-tooltip>

    <v-dialog v-model="dialog" max-width="700px">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <div class="flex items-center gap-2">
            <v-icon>mdi-format-list-bulleted</v-icon>
            <span>Linked References</span>
          </div>
        </v-card-title>
        <v-card-text class="pt-4">
          <div class="mb-4 p-3 bg-grey-lighten-4 rounded">
            <div class="font-weight-medium text-body-1">
              {{ props.voyageDest.voyage?.vessel?.name }}
              <span v-if="props.voyageDest.voyage?.vessel?.line?.commercial_name" class="text-grey-darken-1">
                ({{ props.voyageDest.voyage.vessel.line.commercial_name }})
              </span>
              — {{ props.voyageDest.voyage?.name }}
            </div>
            <div class="text-caption text-grey-darken-1 mt-1">
              {{ props.voyageDest.pod?.name }}
              <span v-if="props.voyageDest.pod?.country?.name">({{ props.voyageDest.pod.country.name }})</span>
            </div>
          </div>

          <div v-if="loading" class="flex justify-center py-6">
            <v-progress-circular indeterminate />
          </div>

          <div v-else-if="referencias.length === 0" class="text-caption text-grey py-2">
            No references found for this voyage destination.
          </div>

          <v-table v-else density="compact">
            <thead>
              <tr>
                <th width="40"></th>
                <th class="text-left">Reference</th>
                <th class="text-left">I/E</th>
                <th class="text-left">Consignee</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ref in referencias" :key="ref.id">
                <td>
                  <ViewButton :item="ref" @click="viewReference(ref)" />
                </td>
                <td>{{ ref.reference_number || `#${ref.id}` }}</td>
                <td>
                  <v-chip size="x-small">{{ ref.impoExpo === 'I' ? 'Import' : 'Export' }}</v-chip>
                </td>
                <td>{{ ref.consignee?.name }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()

const props = defineProps({
  voyageDest: {
    type: Object as () => any,
    required: true,
  },
})

const dialog = ref(false)
const loading = ref(false)
const referencias = ref<any[]>([])

const loadReferencias = async () => {
  loading.value = true
  try {
    const response = await $api.voyages.getDestiantionReferenciasById(String(props.voyageDest.id))
    referencias.value = (response as any)?.referencias ?? (response as any) ?? []
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Error loading references.' })
  } finally {
    loading.value = false
  }
}

const showDialog = async () => {
  dialog.value = true
  referencias.value = []
  await loadReferencias()
}

const viewReference = (ref: any) => {
  const path = ref.impoExpo === 'I' ? '/maritime/import/view-details' : '/maritime/export/view-details'
  router.push(`${path}-${ref.id}`)
}
</script>
