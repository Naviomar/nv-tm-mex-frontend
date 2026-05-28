<template>
  <v-container fluid>
    <v-btn
      color="slate"
      size="small"
      variant="outlined"
      to="/configuration/freight-forwarders"
      class="mb-4"
      >Back</v-btn
    >

    <div class="flex justify-between gap-3">
      <h1 class="text-xl font-bold">Freight Forwarder groups</h1>
      <v-btn color="success" @click="openCreateModal"
        ><v-icon>mdi-plus</v-icon> Add new group
      </v-btn>
    </div>
    <div class="pt-4">
      <FreightForwardersGroupsTable ref="freightForwardersGroupsTableRef" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
const freightForwardersGroupsTableRef = ref<InstanceType<typeof FreightForwardersGroupsTable> | null>(null)

const openCreateModal = () => {
  freightForwardersGroupsTableRef.value?.openCreate()
}
</script>
