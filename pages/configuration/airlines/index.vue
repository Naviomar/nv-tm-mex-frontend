<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Airlines</div>
        <div class="flex gap-2">
          <v-btn color="info" prepend-icon="mdi-format-list-numbered" to="/configuration/airlines/guide-numbers">
            Guide Numbers
          </v-btn>
          <v-btn color="primary" to="/configuration/airlines/add"> Add airline </v-btn>
        </div>
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
