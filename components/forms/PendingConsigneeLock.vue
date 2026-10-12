<template>
  <v-card density="compact" variant="tonal" color="warning" class="pending-consignee-lock">
    <v-card-text class="d-flex align-center gap-3">
      <v-icon size="large">mdi-lock-outline</v-icon>
      <div>
        <div class="font-bold">{{ title }}</div>
        <div class="text-caption">Locked: register the customer to unlock it.</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'Locked',
  },
})
</script>
