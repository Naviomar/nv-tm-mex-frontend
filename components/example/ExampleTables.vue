<template>
  <div>
    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">Actions</th>
          <th class="text-left">Ships</th>
          <th class="text-left">ETA</th>
          <th class="text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in ships" :key="item.name">
          <td>
            <v-btn variant="text" icon="mdi-eye-outline" color="blue-lighten-2" density="compact"></v-btn>
            <v-btn variant="text" icon="mdi-pencil-outline" color="blue-lighten-2" density="compact"></v-btn>
            <v-btn variant="text" icon="mdi-trash-can-outline" color="red-lighten-2" density="compact"></v-btn>
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.eta }}</td>
          <td><v-chip class="" color="green" text-color="white"> Status </v-chip></td>
        </tr>
      </tbody>
    </v-table>
    <v-pagination v-model="page" :length="4" rounded-sm="circle"></v-pagination>
  </div>
</template>
<script setup lang="ts">
// demo data
const ships = [
  { name: 'HMS Victory', eta: '18:00' },
  { name: 'USS Constitution', eta: '18:00' },
  { name: 'HMS Surprise', eta: '18:00' },
  { name: 'HMS Dauntless', eta: '18:00' },
  { name: 'HMS Interceptor', eta: '18:00' },
  { name: 'HMS Endeavour', eta: '18:00' },
  { name: 'HMS Revenge', eta: '18:00' },
]

const page = ref(1)
</script>
