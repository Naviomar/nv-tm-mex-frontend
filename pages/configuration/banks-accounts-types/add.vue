<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/banks-accounts-types" class="mb-4"
      >Back to banks accounts types</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New Bank Account Type</h3>
      </v-card-title>
      <v-card-text>
        <BankAccountType />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts"></script>
