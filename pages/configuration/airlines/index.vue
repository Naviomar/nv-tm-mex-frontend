<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Airlines</div>
        <v-btn color="primary" to="/configuration/airlines/add"> Add airline </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <AirlinesTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Config Airlines',
  layout: 'default',
})
</script>
