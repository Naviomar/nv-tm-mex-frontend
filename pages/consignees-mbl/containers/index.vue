<script setup lang="ts"></script>
<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Containers</div>
        <v-btn color="primary" to="/configuration/containers/add"> Add container </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <ContainersTable />
    </div>
  </v-container>
</template>
