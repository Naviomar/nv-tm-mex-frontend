<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-xl font-bold underline">{{ appName }}</h1>
      </v-col>
      <v-col cols="4">
        <v-card color="blue-lighten-5">
          <v-card-title>
            <div class="flex gap-2 items-center">
              <v-icon>mdi-ship-wheel</v-icon>
              <h3>Maritime tracking</h3>
            </div>
          </v-card-title>
          <v-card-actions>
            <v-btn color="primary" size="small" variant="tonal" to="/public/tracking/maritime">Go to module</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const appName = config.public.appName

definePageMeta({
  sanctum: {
    excluded: true,
  },
  title: 'Home',
  layout: 'guest-empty',
})
</script>
