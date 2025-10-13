<template>
  <v-card>
    <v-card-title class="text-overline">
      {{ title.toUpperCase() }}
    </v-card-title>
    <v-card-text>
      <div class="text-blue-darken-3 text-2xl font-weight-bold mb-2">{{ formatToCurrency(amount) ?? '0.00' }}</div>
      <div class="text-green-darken-2 text-sm">Paid: {{ formatToCurrency(paid) ?? '0.00' }}</div>
      <div class="text-xs text-gray-500 mt-1">{{ subtitle }}</div>
      <v-icon :icon="icon" size="48" class="absolute! right-4 top-1/2 -translate-y-1/2 opacity-10 z-0" />
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
  amount: Number | String,
  paid: Number,
  icon: {
    type: String,
    default: 'mdi-file-document-outline',
  },
})
</script>
