<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Group(s)</h1>
    <div class="mt-4">
      <v-btn color="slate" size="small" variant="outlined" to="/configuration/executives" class="mb-4"
        >Back to executives</v-btn
      >
    </div>
    <div class="flex justify-end gap-3">
      <v-btn to="/configuration/executives/groups/add" color="success"><v-icon>mdi-plus</v-icon> Add new group </v-btn>
    </div>
    <div class="pt-4">
      <GroupsTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()
</script>
