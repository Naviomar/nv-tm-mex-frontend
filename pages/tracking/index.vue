<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <div class="flex gap-2">
          <v-icon>mdi-radar</v-icon>
          <h3>Tracking</h3>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-4">
          <v-btn color="primary" @click="$router.push('/tracking/sea')">Maritime tracking</v-btn>
          <v-btn color="green" @click="$router.push('/tracking/air')">Air tracking</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Home',
  layout: 'default',
})
</script>
