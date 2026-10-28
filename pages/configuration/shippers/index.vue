<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Shippers (POL) / Consignees (POD outside Mexico)</div>
        <Can permission="shippers-create">
          <v-btn color="primary" to="/configuration/shippers/add"> Add new </v-btn>
        </Can>
      </div>
    </div>
    <div class="pt-4">
      <ShippersTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Shippers / Consignees',
  layout: 'default',
})
</script>
