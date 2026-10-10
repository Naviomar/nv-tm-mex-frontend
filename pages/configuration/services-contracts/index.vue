<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Services contracts</div>
        <Can permission="services-contracts-create">
          <v-btn color="primary" to="/configuration/services-contracts/add"> Add service contract </v-btn>
        </Can>
      </div>
    </div>
    <div class="pt-4">
      <ServicesContractsTable />
    </div>
  </v-container>
</template>
