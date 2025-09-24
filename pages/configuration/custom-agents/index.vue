<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Customs agents</div>
        <v-btn color="primary" to="/configuration/custom-agents/add"> Add custom agent </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <CustomAgentTable />
    </div>
  </v-container>
</template>
