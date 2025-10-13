<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Customers</h1>
    <div>
      <div class="flex justify-end gap-3">
        <v-btn color="secondary" to="/configuration/customers/groups">
          <v-icon>mdi-account-group-outline</v-icon> Customer groups
        </v-btn>
        <v-btn color="success" to="/configuration/customers/add"> <v-icon>mdi-plus</v-icon>Add customer </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <ConsigneesTable />
    </div>
  </v-container>
</template>
<script setup lang="ts"></script>
