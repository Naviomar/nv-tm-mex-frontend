<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Bank Account types</div>
        <v-btn color="primary" to="/configuration/banks-accounts-types/add"> Add bank Account Type </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <BankAccountTypeTable />
    </div>
  </v-container>
</template>
<script setup lang="ts"></script>
