<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Consignee MBLs</div>
        <Can permission="consignee-mbl-create">
          <v-btn color="primary" to="/configuration/consignees-mbl/add"> Add consignee MBL </v-btn>
        </Can>
      </div>
    </div>
    <div class="pt-4">
      <ConsigneeMblsTable />
    </div>
  </v-container>
</template>
<script setup lang="ts"></script>
