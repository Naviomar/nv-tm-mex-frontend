<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Supplier types</div>
        <div class="flex gap-4">
          <v-btn color="secondary" variant="outlined" to="/configuration/suppliers"> Back </v-btn>
          <v-btn color="primary" to="/configuration/suppliers/types/add"> Add supplier type </v-btn>
        </div>
      </div>
    </div>
    <div class="pt-4">
      <SupplierTypesTable />
    </div>
  </v-container>
</template>
