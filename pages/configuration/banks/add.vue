<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>
    <v-card>
      <v-card-title>
        <h3>New Bank</h3>
      </v-card-title>
      <v-card-text>
        <BankForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts"></script>
