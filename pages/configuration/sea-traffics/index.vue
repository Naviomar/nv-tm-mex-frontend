<script setup lang="ts"></script>
<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Sea traffics</div>
        <Can permission="sea-traffics-create">
          <v-btn color="primary" to="/configuration/sea-traffics/add"> Add sea traffic </v-btn>
        </Can>
      </div>
    </div>
    <div class="pt-4">
      <SeaTrafficsTable />
    </div>
  </v-container>
</template>
