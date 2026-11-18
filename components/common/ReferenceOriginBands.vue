<template>
  <div class="flex flex-col gap-0">
    <div v-if="trackerNumber" class="bg-pink-200 dark:bg-pink-800 p-1 rounded-sm text-xs">
      <v-icon size="small" color="warning">mdi-arrow-right-bottom</v-icon>
      Tracker #{{ trackerNumber }}
    </div>
    <div v-if="chileReference" class="bg-gray-200 dark:bg-gray-800 p-1 rounded text-xs">
      <v-icon size="small" color="warning">mdi-arrow-right-bottom</v-icon>
      {{ chileReference }}
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ trackerNumber?: string | null; chileReference?: string | null }>()
</script>
