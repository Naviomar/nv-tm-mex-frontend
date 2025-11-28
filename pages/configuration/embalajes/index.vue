<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Embalajes</div>
        <v-btn color="primary" to="/configuration/embalajes/add"> Add embalaje </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <EmbalajesTable />
    </div>
  </v-container>
</template>
