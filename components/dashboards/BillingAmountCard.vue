<template>
  <v-card class="billing-card elevation-2 rounded-lg">
    <v-card-text class="pa-4">
      <div class="flex items-center justify-between mb-3">
        <v-icon :icon="icon" size="32" :color="getIconColor()" />
        <v-chip size="small" :color="getChipColor()" variant="tonal" class="font-semibold">
          {{ subtitle }}
        </v-chip>
      </div>
      
      <div class="text-xs text-grey-600 dark:text-grey-400 mb-1 font-medium uppercase tracking-wide">
        {{ title }}
      </div>
      
      <div class="mb-3">
        <div class="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1">
          {{ formatToCurrency(amount) ?? '0.00' }}
        </div>
        <div class="text-sm text-grey-600 dark:text-grey-400">
          Total Amount
        </div>
      </div>
      
      <v-divider class="mb-2" />
      
      <div class="flex items-center justify-between">
        <div class="text-xs text-grey-600 dark:text-grey-400 font-medium">Paid:</div>
        <div class="text-sm font-bold text-green-700 dark:text-green-400">
          {{ formatToCurrency(paid) ?? '0.00' }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  title: String,
  subtitle: String,
  amount: [Number, String],
  paid: Number,
  icon: {
    type: String,
    default: 'mdi-file-document-outline',
  },
})

const getIconColor = () => {
  if (props.icon?.includes('airplane')) return 'indigo'
  if (props.icon?.includes('ferry') || props.icon?.includes('ship')) return 'blue'
  return 'grey-darken-1'
}

const getChipColor = () => {
  if (props.subtitle?.includes('USD')) return 'green'
  if (props.subtitle?.includes('MXN')) return 'blue'
  return 'grey'
}
</script>

<style scoped>
.billing-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.billing-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
}
</style>
