<template>
  <div class="mb-4">
    <v-card density="compact" color="lime-accent-1" class="mb-2">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex justify-start items-center">
            <v-icon size="x-small">mdi-bell-outline</v-icon>
            <div class="ml-2 font-bold">Arrival notification(s)</div>
          </div>
          <div v-if="hasVoyageDischarge && hasPpCcSellBuy">
            <v-btn
              icon="mdi-email-plus-outline"
              size="x-small"
              color="success"
              @click="toggleNotifyArrivalDialog"
            ></v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div v-if="!hasVoyageDischarge" class="mb-2 font-bold">
          <div class="">No arrival voyage yet</div>
          <div class="">Complete the arrival voyage to unlock the arrival notification.</div>
        </div>
        <div v-if="!hasPpCcSellBuy" class="mb-2 font-bold">
          <div class="">Specify buy & sell if they are Prepaid or Collect.</div>
        </div>
        <div v-if="!hasArrivalNotification" class="">No arrival notifications sent yet</div>
        <v-table v-if="hasArrivalNotification" density="compact" fixed-header max-height="300px">
          <thead>
            <tr>
              <th class="text-left">Notification</th>
              <th class="text-left">Date</th>
              <th class="text-left">Sent by</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(arrivalNoty, index) in referencia.arrival_notys" :key="`ref-noty-${index}`">
              <td>{{ getEnumeratorByIndex(index) }}</td>
              <td>{{ formatDateString(arrivalNoty.created_at) }}</td>
              <td>{{ arrivalNoty.created_by?.name }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <MaritimeImportNotifyArrivalForm
      :referencia="referencia"
      :show="showNotifyArrivalDialog"
      @close="closeNotifyArrivalDialog"
      @refresh="refreshReferencia"
    />
  </div>
</template>
<script setup lang="ts">
const { $notifications } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps({
  referencia: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['refresh'])

const hasArrivalNotification = computed(() => {
  if (!props.referencia.arrival_notys) return false
  return props.referencia.arrival_notys.length > 0
})

const hasSellCharges = computed(() => {
  if (props.referencia == null) return false
  return props.referencia.charges.length > 0 && props.referencia.sell_rate_type != null
})

const hasVoyageDischarge = computed(() => {
  if (props.referencia == null) return false
  return props.referencia.voyage_discharge != null
})

const hasPpCcSellBuy = computed(() => {
  if (props.referencia == null) return false
  return props.referencia.sell_rate_type != null && props.referencia.buy_rate_type != null
})

const getEnumeratorByIndex = (index: number) => {
  if (index === 0) return '1st'
  if (index === 1) return '2nd'
  if (index === 2) return '3rd'
  return `${index + 1}th`
}

const showNotifyArrivalDialog = ref(false)

const toggleNotifyArrivalDialog = () => {
  console.log('showNotifyArrivalDialog')
  showNotifyArrivalDialog.value = !showNotifyArrivalDialog.value
}

const closeNotifyArrivalDialog = () => {
  showNotifyArrivalDialog.value = false
}

const refreshReferencia = () => {
  emits('refresh')
}
</script>
