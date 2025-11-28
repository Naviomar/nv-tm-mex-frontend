<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/consignees-mbl" class="mb-4"
      >Back to consignee MBLs</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New consignee MBL</h3>
      </v-card-title>
      <v-card-text>
        <ConsigneeMblForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts"></script>
