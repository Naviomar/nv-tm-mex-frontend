<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-xl font-bold underline">{{ appName }}</h1>
      </v-col>
      <v-col cols="12">
        <GlobalDashboard />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const appName = config.public.appName

definePageMeta({
  title: 'Home',
  layout: 'default',
})
</script>
