<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Charges</div>
        <v-btn color="primary" to="/configuration/charges/add"> Add charge </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <ChargesTable />
    </div>
  </v-container>
</template>
<script setup lang="ts"></script>
