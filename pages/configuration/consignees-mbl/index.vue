<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Consignee MBLs</div>
        <v-btn color="primary" to="/configuration/consignees-mbl/add"> Add consignee MBL </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <ConsigneeMblsTable />
    </div>
  </v-container>
</template>
<script setup lang="ts"></script>
