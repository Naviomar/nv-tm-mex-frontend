<template>
  <div>
    <!-- Blocking modal when reference has committed charges -->
    <v-dialog v-model="showBlockingModal" max-width="520" persistent>
      <v-card>
        <v-card-title class="text-h6 bg-red-darken-1 text-white pa-4">
          <v-icon class="mr-2">mdi-alert-circle-outline</v-icon>
          No se puede eliminar esta referencia
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="mb-3">La referencia cuenta con los siguientes cargos comprometidos:</p>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Descripción</th>
                <th class="text-center">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in blockingItems" :key="item.type">
                <td>
                  <v-icon color="red" size="small" class="mr-1">mdi-close-circle</v-icon>
                  {{ item.label }}
                </td>
                <td class="text-center">{{ item.count }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showBlockingModal = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation modal before cancelling -->
    <v-dialog v-model="showConfirmModal" max-width="480" persistent>
      <v-card>
        <v-card-title class="text-h6 bg-orange-darken-2 text-white pa-4">
          <v-icon class="mr-2">mdi-alert-outline</v-icon>
          Confirm cancellation
        </v-card-title>
        <v-card-text class="pa-4">
          <p>Are you sure you want to proceed with the cancellation of this reference?</p>
          <p class="text-red font-bold mt-2">This action cannot be easily undone.</p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showConfirmModal = false">No, go back</v-btn>
          <v-btn color="red" variant="elevated" @click="confirmAndEmit">Yes, proceed to cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div v-if="!props.canRestore && !props.item?.deleted_at && isVisible">
      <v-tooltip :text="props.item?.deleted_at ? 'Restore' : 'Cancel'">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-btn
            :color="props.item?.deleted_at ? 'blue-darken-4' : 'red'"
            text-color="white"
            size="x-small"
            variant="elevated"
            v-bind="tooltipProps"
            :icon="props.item?.deleted_at ? 'mdi-delete-empty-outline' : 'mdi-delete-outline'"
            :loading="validating"
            @click="handleClick(props.item)"
          ></v-btn>
        </template>
      </v-tooltip>
    </div>
    <div v-if="props.canRestore">
      <v-tooltip :text="props.item?.deleted_at ? 'Restore' : 'Cancel'">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-btn
            :color="props.item?.deleted_at ? 'blue-darken-4' : 'red'"
            text-color="white"
            size="x-small"
            variant="elevated"
            v-bind="tooltipProps"
            :icon="props.item?.deleted_at ? 'mdi-delete-empty-outline' : 'mdi-delete-outline'"
            @click="handleClick(props.item)"
          ></v-btn>
        </template>
      </v-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()

const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  canRestore: {
    type: Boolean,
    default: true,
  },
  serviceType: {
    type: String as PropType<'sea-import' | 'sea-export' | 'air-import' | 'air-export' | null>,
    default: null,
  },
})

const emit = defineEmits(['click'])

const showBlockingModal = ref(false)
const showConfirmModal = ref(false)
const blockingItems = ref<any[]>([])
const validating = ref(false)
const pendingItem = ref<any>(null)

const hasCommittedCharges = computed(() => {
  const item = props.item as any
  if (!item || !props.serviceType) return false

  const seaImportCounts = [
    'demurrages_count', 'proformas_tm_count', 'proformas_wm_count',
    'invoice_tms_count', 'invoice_wms_count', 'ff_notes_count',
    'supplier_invoices_count', 'line_invoice_refs_count',
  ]

  const seaExportCounts = [
    'proformas_tm_count', 'proformas_wm_count',
    'invoice_tms_count', 'invoice_wms_count', 'ff_notes_count',
    'supplier_invoices_count', 'line_invoice_refs_count',
  ]

  const airCounts = [
    'invoice_tms_count', 'invoice_wms_count',
    'ff_notes_count', 'supplier_invoices_count',
  ]

  let countsToCheck: string[] = []
  if (props.serviceType === 'sea-import') countsToCheck = seaImportCounts
  else if (props.serviceType === 'sea-export') countsToCheck = seaExportCounts
  else countsToCheck = airCounts

  return countsToCheck.some(key => (item[key] ?? 0) > 0)
    || (props.serviceType === 'sea-import' && item.arrival_notys?.length > 0)
    || (props.serviceType === 'sea-import' && item.revalidation)
    || (props.serviceType === 'air-import' && item.arrival_notys?.length > 0)
    || (props.serviceType === 'air-import' && item.sent_releases?.length > 0)
})

const isVisible = computed(() => {
  if (!props.serviceType) return true
  return !hasCommittedCharges.value
})

async function handleClick(item: any) {
  if (!props.serviceType) {
    emit('click', item)
    return
  }

  try {
    validating.value = true
    let response: any = null

    if (props.serviceType === 'sea-import') {
      response = await $api.referencias.checkDeletableSeaImport(item.id.toString())
    } else if (props.serviceType === 'sea-export') {
      response = await $api.referenciasExport.checkDeletableSeaExport(item.id.toString())
    } else if (props.serviceType === 'air-import') {
      response = await $api.airImport.checkDeletable(item.id.toString())
    } else if (props.serviceType === 'air-export') {
      response = await $api.airExport.checkDeletable(item.id.toString())
    }

    if (response?.can_delete) {
      pendingItem.value = item
      showConfirmModal.value = true
    } else {
      blockingItems.value = response?.blocking_items ?? []
      showBlockingModal.value = true
    }
  } catch (e) {
    console.error(e)
    emit('click', item)
  } finally {
    validating.value = false
  }
}

function confirmAndEmit() {
  showConfirmModal.value = false
  if (pendingItem.value) {
    emit('click', pendingItem.value)
    pendingItem.value = null
  }
}
</script>
