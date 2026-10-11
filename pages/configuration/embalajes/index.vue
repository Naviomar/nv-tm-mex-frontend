<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Embalajes</div>
        <Can permission="embalajes-create">
          <v-btn color="primary" to="/configuration/embalajes/add"> Add embalaje </v-btn>
        </Can>
      </div>
    </div>
    <div class="pt-4">
      <EmbalajesTable />
    </div>
  </v-container>
</template>
