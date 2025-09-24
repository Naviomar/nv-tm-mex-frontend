<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-12">
        <div class="col-span-2">
          <v-text-field variant="outlined" label="Name"></v-text-field>
        </div>
        <div class="col-span-2">
          <v-btn class="mx-4" color="secondary"> Clear </v-btn>
          <v-btn color="primary"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Actions</th>
              <th class="text-left">Group consignee</th>
              <th class="text-left">Consignee</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in ships" :key="item.consignee">
              <td>
                <v-btn variant="text" color="blue-lighten-2">Add consignee</v-btn>
              </td>
              <td>{{ item.groupConsignee }}</td>
              <td>{{ item.consignee }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination v-model="page" :length="4" rounded-sm="circle"></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
// demo data
const ships = [
  { groupConsignee: 'AAA Group', consignee: '-AAA Logistics & customs SA DE CV' },
  { groupConsignee: 'AEIOU Group', consignee: '-AEIOU Company SA DE CV' },
  { groupConsignee: 'Calkins', consignee: '-Calkins burke and zannie de Mexico SA DE CV' },
  { groupConsignee: 'Darose', consignee: '-NEPROMU SA DE CV' },
  { groupConsignee: 'AAA Group', consignee: '-AAA Logistics & customs SA DE CV' },
  { groupConsignee: 'AAA Group', consignee: '-AAA Logistics & customs SA DE CV' },
]

const page = ref(1)
</script>
