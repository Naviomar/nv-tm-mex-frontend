<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Freight Forwarders</div>
        <div class="flex gap-2">
          <v-btn color="secondary" to="/configuration/freight-forwarders/groups">
            <v-icon>mdi-account-group-outline</v-icon> Freight forwarder groups
          </v-btn>
          <v-btn color="success" to="/configuration/freight-forwarders/add">
            <v-icon>mdi-plus</v-icon>Add freight forwarder
          </v-btn>
        </div>
      </div>
    </div>
    <div class="pt-4">
      <FreightForwardersTable />
    </div>
  </v-container>
</template>
<script setup lang="ts"></script>
