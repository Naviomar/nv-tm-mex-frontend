<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Containers</div>
        <Can permission="containers-create">
          <v-btn color="primary" to="/configuration/containers/add"> Add container </v-btn>
        </Can>
      </div>
    </div>
    <div class="pt-4">
      <ContainersTable />
    </div>
  </v-container>
</template>
