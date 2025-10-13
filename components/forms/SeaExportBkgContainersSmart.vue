<template>
  <div>
    <v-card density="compact" class="mb-2">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-train-car-container</v-icon>
            <div class="ml-2 font-bold">Booking Container(s)</div>
          </div>
          <div>
            <v-btn icon size="x-small" @click="toggleForm" :color="showForm ? 'black' : 'success'">
              <v-icon v-if="showForm">mdi-close</v-icon>
              <v-icon v-if="!showForm">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div v-if="showForm">
          <div class="grid grid-cols-2 gap-2 mb-4">
            <div>
              <v-text-field
                v-model="container.total"
                name="container_number"
                type="number"
                density="compact"
                variant="solo-filled"
                label="Total containers"
              />
            </div>
            <div class="flex items-start gap-2">
              <v-autocomplete
                v-model="container.container_type_id"
                density="compact"
                label="Type"
                :items="catalogs.container_types"
                item-title="name"
                item-value="id"
                variant="solo-filled"
              />
            </div>
            <div class="">
              <v-btn density="compact" variant="outlined" color="red" @click="closeContainerForm">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-btn density="compact" variant="outlined" color="green" @click="addContainer(container)">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="20"></th>
              <th class="text-left" width="200">Total containers</th>
              <th class="text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in containers" :key="`mbl-${index}`">
              <td>
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-delete-outline"
                  color="red-lighten-2"
                  dense
                  @click="removeContainer(index)"
                ></v-btn>
              </td>
              <td>{{ item.total }}</td>
              <td>{{ containerTypeName(item.container_type_id) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const snackbar = useSnackbar()

const props = defineProps({
  referenciaId: {
    required: false,
  },
  currentContainers: {
    type: Array,
    required: false,
  },
  catalogs: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:containers'])

const showForm = ref(false)
const container = ref<any>({
  total: 1,
  container_type_id: null,
})
const containers = ref<any[]>([])

const toggleForm = () => {
  showForm.value = !showForm.value
  container.value = {
    total: 1,
    container_type_id: null,
  }
}

// watch
watch(
  () => props.currentContainers,
  (currentContainers) => {
    if (currentContainers) {
      containers.value = [...currentContainers]
      console.log('containers', containers)
    }
  },
  { immediate: true }
)

// emit transhipments
watch(
  () => containers.value,
  (containers) => {
    emit('update:containers', containers)
  },
  { deep: true }
)

const containerTypeName = (id: number) => {
  return props.catalogs.container_types.find((c: any) => c.id == id)?.name
}

const closeContainerForm = () => {
  toggleForm()
}

const addContainer = (container: any) => {
  if (!container.container_type_id) {
    snackbar.add({ type: 'error', text: 'Please select a container type' })
    return
  }
  containers.value.push(container)
  toggleForm()
}

const removeContainer = (index: number) => {
  containers.value.splice(index, 1)
}
</script>
