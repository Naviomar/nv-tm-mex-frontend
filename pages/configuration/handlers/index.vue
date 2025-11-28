<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Air Handlers</div>
        <v-btn color="primary" to="/configuration/handlers/add"> Add handler </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <HandlersTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Config Handlers',
  layout: 'default',
})
</script>
