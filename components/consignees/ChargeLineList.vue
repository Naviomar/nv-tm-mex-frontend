<template>
  <div class="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
    <div
      v-for="(charge, idx) in charges"
      :key="idx"
      class="flex items-center gap-3 px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
    >
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-gray-900 truncate">{{ charge.charge_name }}</div>
        <div v-if="charge.invoice_number" class="text-xs text-gray-400">
          Invoice #{{ charge.invoice_number }}
        </div>
      </div>
      <div class="text-sm font-semibold text-gray-700 whitespace-nowrap">
        ${{ Number(charge.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
      </div>
      <v-btn
        v-if="removable"
        icon
        size="x-small"
        variant="text"
        color="red"
        @click="$emit('remove', idx)"
      >
        <v-icon size="small">mdi-close</v-icon>
      </v-btn>
    </div>
    <div v-if="charges.length === 0" class="px-3 py-2 text-xs text-gray-400 italic">
      No charges added yet.
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  charges: { charge_name: string; invoice_number?: string; amount: number | string }[]
  removable?: boolean
}>()

defineEmits<{
  remove: [idx: number]
}>()
</script>
