<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-12">
        <div class="col-span-2 me-4">
          <v-text-field variant="outlined" label="Destination"></v-text-field>
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="clearFilters"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Actions</th>
              <th class="text-left">Destination (Truck/Rail)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in ships" :key="item.name">
              <td>
                <v-btn variant="text" icon="mdi-eye-outline" color="blue-lighten-2" density="compact"></v-btn>
              </td>
              <td>{{ item.name }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination v-model="page" :length="4" rounded-sm="circle"></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">


const filters = ref({
  name: "",
  country: "",
});
// demo data
const ships = [
  { name: 'HMS Victory' },
  { name: 'USS Constitution' },
  { name: 'HMS Surprise' },
  { name: 'HMS Dauntless' },
  { name: 'HMS Interceptor' },
  { name: 'HMS Endeavour' },
  { name: 'HMS Revenge' },
]


const clearFilters = async () => {
  filters.value = {
    name: "",
    country: "",
  };
};


const page = ref(1)
</script>
