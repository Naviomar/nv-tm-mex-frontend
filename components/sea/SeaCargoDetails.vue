<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="font-bold">Cargo details</div>
    </v-card-title>
    <v-card-text>
      <div class="grid grid-cols-2 mb-2">
        <div>Condition type</div>
        <div>{{ referencia.cargo_type }}</div>

        <div>Tipo de embalaje</div>
        <div>{{ referencia.embalaje?.name }}</div>

        <div>Commodity description</div>
        <div>
          {{ referencia.commodity }}
        </div>
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left" id="container-number">Container #</th>
            <th class="text-left" id="container-type">Type</th>
            <th class="text-left" id="container-volume">m<sup>3</sup></th>
            <th class="text-left" id="container-weight">Kgs</th>
            <th class="text-left" id="container-packages"># Paquetes</th>
            <th class="text-left" id="container-notes">notes</th>
            <th class="text-left" id="container-created-by">Created by</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in referencia.containers" :key="`container-${index}`">
            <td>
              <div class="flex items-center gap-2">
                <div v-if="item.demurrage">
                  <v-tooltip text="Demurrages">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" color="warning">mdi-timer-outline</v-icon>
                    </template>
                  </v-tooltip>
                </div>
                {{ item.container_number }}
              </div>
            </td>
            <td>{{ item.container_type?.name }}</td>
            <td>{{ item.volume }}</td>
            <td>{{ item.weight }}</td>
            <td>{{ item.num_packages }}</td>
            <td>{{ item.notes }}</td>
            <td>
              <UserInfoBadge :item="item">
                {{ item.creator?.name }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
const props = defineProps({
  referencia: {
    type: Object,
    required: true,
  },
})
</script>
