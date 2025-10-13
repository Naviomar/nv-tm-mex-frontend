<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Container Delay Rates</div>
        <v-btn color="primary" size="small" to="/configuration/container-delay-rates/add">
          Add container delay rate
        </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <ContainerDelayRatesTable />
    </div>
  </v-container>
</template>
