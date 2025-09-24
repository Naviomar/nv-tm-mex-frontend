<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Services contracts</div>
        <v-btn color="primary" to="/configuration/services-contracts/add"> Add service contract </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <ServicesContractsTable />
    </div>
  </v-container>
</template>
