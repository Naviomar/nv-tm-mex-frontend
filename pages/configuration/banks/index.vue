<script setup lang="ts"></script>
<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Banks</div>
        <v-btn color="primary" to="/configuration/banks/add"> Add bank </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <BanksTable />
    </div>
  </v-container>
</template>
