<template>
  <v-dialog v-model="localShow" max-width="800" persistent>
    <v-card>
      <v-card-title class="bg-orange text-white">
        <div class="flex items-center gap-2">
          <v-icon size="large">mdi-alert-octagon</v-icon>
          <span class="font-bold">Duplicate {{ houseLabel }} Found</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-alert type="warning" density="compact" class="mb-4" border="start">
          <div class="font-bold mb-1">{{ duplicateAlertTitle }}</div>
          <div class="text-sm">Review the information below. You can click on any reference to open it in a new tab.</div>
        </v-alert>

        <div v-if="duplicates.length > 0" class="space-y-3">
          <v-card
            v-for="(ref, index) in duplicates"
            :key="`duplicate-${index}`"
            variant="outlined"
            color="orange"
            class="cursor-pointer hover:shadow-md transition-shadow"
            @click="openReference(ref.id)"
          >
            <v-card-text class="pa-3">
              <div class="flex items-start gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <v-chip color="orange" size="default" class="font-bold text-white" variant="elevated">
                      {{ ref.reference_number }}
                    </v-chip>
                    <v-icon size="small" color="grey">mdi-open-in-new</v-icon>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-grey-darken-2 font-medium">{{ carrierLabel }}:</span>
                      <span class="font-bold ml-1">{{ ref.line?.name || ref.airline?.name || '—' }}</span>
                    </div>
                    <div>
                      <span class="text-grey-darken-2 font-medium">Client:</span>
                      <span class="font-bold ml-1">{{ ref.consignee?.name || '—' }}</span>
                    </div>
                    <div>
                      <span class="text-grey-darken-2 font-medium">FF:</span>
                      <span class="font-bold ml-1">{{ ref.freight_forwarder?.name || '—' }}</span>
                    </div>
                    <div>
                      <span class="text-grey-darken-2 font-medium">{{ masterFieldLabel }}:</span>
                      <span class="font-bold ml-1">{{ getMasterName(ref) || '—' }}</span>
                    </div>
                    <div v-if="serviceType === 'air-import' && ref.house_awb">
                      <span class="text-grey-darken-2 font-medium">House AWB:</span>
                      <span class="font-bold ml-1">{{ ref.house_awb }}</span>
                    </div>
                    <div v-if="ref.eta_date">
                      <span class="text-grey-darken-2 font-medium">ETA:</span>
                      <span class="font-bold ml-1">{{ formatDate(ref.eta_date) }}</span>
                    </div>
                    <div v-if="ref.etd_date">
                      <span class="text-grey-darken-2 font-medium">ETD:</span>
                      <span class="font-bold ml-1">{{ formatDate(ref.etd_date) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <v-alert v-else type="info" density="compact" class="mt-4" border="start">
          No duplicates found. You can proceed safely.
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="grey" variant="text" @click="onCancel">
          Cancel
        </v-btn>
        <v-btn
          color="orange"
          prepend-icon="mdi-alert"
          variant="elevated"
          @click="onConfirm"
        >
          {{ confirmButtonLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  houseName: {
    type: String,
    required: true,
  },
  duplicates: {
    type: Array as () => any[],
    default: () => [],
  },
  serviceType: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:show', 'confirm', 'cancel'])

const localShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

const houseLabel = computed(() => {
  if (props.serviceType === 'air-export') return 'House AWB'
  if (props.serviceType === 'air-import') return 'MAWB + HAWB pair'
  return 'House BL'
})

const duplicateAlertTitle = computed(() => {
  if (props.serviceType === 'air-import') {
    return `The combination "${props.houseName}" is already registered in the following references:`
  }
  return `${houseLabel.value} "${props.houseName}" already exists in the following references:`
})

const carrierLabel = computed(() => {
  return props.serviceType === 'air-export' || props.serviceType === 'air-import' ? 'Airline' : 'Line'
})

const masterFieldLabel = computed(() => {
  return props.serviceType === 'air-export' || props.serviceType === 'air-import' ? 'Master AWB' : 'Master BL'
})

const confirmButtonLabel = computed(() => {
  if (props.serviceType === 'air-import') return 'Confirm and Save Reference'
  if (props.serviceType === 'air-export') return 'Confirm and Add House AWB'
  return `Confirm and Add ${houseLabel.value}`
})

const getMasterName = (ref: any) => {
  if (props.serviceType === 'air-export') {
    return ref.master_awb?.name
  }
  if (props.serviceType === 'air-import') {
    return typeof ref.master_awb === 'string' ? ref.master_awb : ref.master_awb?.name
  }
  return ref.master_bls?.length > 0 ? ref.master_bls[0].name : null
}

const formatDate = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString()
}

const openReference = (id: number) => {
  let url = ''
  switch (props.serviceType) {
    case 'sea-import':
      url = `/maritime/import/view-details-${id}`
      break
    case 'sea-export':
      url = `/maritime/export/view-details-${id}`
      break
    case 'air-import':
      url = `/air/import/view-details-${id}`
      break
    case 'air-export':
      url = `/air/export/view-details-${id}`
      break
    default:
      return
  }
  window.open(url, '_blank')
}

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
  emit('update:show', false)
}
</script>
