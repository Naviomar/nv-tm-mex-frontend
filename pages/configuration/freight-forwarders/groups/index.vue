<template>
  <v-container fluid>
    <v-btn
      color="slate"
      size="small"
      variant="outlined"
      @click="$router.push('/configuration/freight-forwarders')"
      class="mb-4"
      >Back</v-btn
    >

    <div class="flex justify-between gap-3">
      <h1 class="text-xl font-bold">Freight Forwarder groups</h1>
      <v-btn to="/configuration/freight-forwarders/groups/add" color="success"
        ><v-icon>mdi-plus</v-icon> Add new group
      </v-btn>
    </div>
    <div class="pt-4">
      <FreightForwardersGroupsTable />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
