<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Suppliers</div>
        <div class="flex gap-4">
          <v-btn color="secondary" to="/configuration/suppliers/types"> Supplier types </v-btn>
          <v-btn color="primary" to="/configuration/suppliers/add"> Add supplier </v-btn>
        </div>
      </div>
    </div>
    <div class="pt-4">
      <SuppliersTable />
    </div>
  </v-container>
</template>
