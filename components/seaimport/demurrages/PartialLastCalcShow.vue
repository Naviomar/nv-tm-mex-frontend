<template>
  <div>
    <div v-if="!lastCalc">
      <div class="text-base font-bold">No calculation yet</div>
    </div>
    <div v-if="lastCalc" class="bg-slate-200 dark:bg-neutral-700">
      <div class="text-base font-bold">Last calculation</div>
      <div class="grid grid-cols-6 gap-2 border font-bold">
        <div>Start date</div>
        <div>End date</div>
        <div>Free days</div>
        <div>Subtotal</div>
        <div>IVA</div>
        <div>Total calculated</div>
      </div>
      <div class="grid grid-cols-6 gap-2 border">
        <div>{{ formatDateOnlyString(lastCalc.start_date) }}</div>
        <div>{{ formatDateOnlyString(lastCalc.end_date) }}</div>
        <div>{{ lastCalc.free_days }}</div>
        <div>
          <div class="flex flex-col gap-0">
            {{ formatToCurrency(lastCalc.amount) }}
            <div v-if="lastCalc.discount > 0">
              <v-chip color="red" class="text-xs" size="small" variant="outlined"
                ><v-icon>mdi-sale-outline</v-icon>-{{ formatToCurrency(lastCalc.discount) }}</v-chip
              >
            </div>
          </div>
        </div>
        <div>{{ formatToCurrency(lastCalc.amount_iva) }}</div>
        <div>{{ formatToCurrency(parseFloat(lastCalc.amount) + parseFloat(lastCalc.amount_iva)) }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  container: {
    type: Object as PropType<any>,
    required: true,
  },
})

const lastCalc = computed(() => {
  // return first calculation
  return props.container.demurrage?.calculations?.[0] || null
  // return props.container.demurrage?.calculations?.[props.container.demurrage?.calculations?.length - 1] || null
})
</script>
