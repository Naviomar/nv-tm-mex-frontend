<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Ports</div>
        <v-btn color="primary" to="/configuration/ports/add"> Add port </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <PortsTable />
    </div>
  </v-container>
</template>
