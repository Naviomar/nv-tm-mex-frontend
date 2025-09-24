<template>
  <div>
    <v-card density="compact" class="mb-2">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-train-car-container</v-icon>
            <div class="ml-2 font-bold">Service containers</div>
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
        <div v-if="!hasCargoType">
          <v-alert type="info" density="compact">
            <div class="">No condition type selected</div>
          </v-alert>
        </div>
        <div v-if="hasCargoType">
          <SeaImportContainerForm
            v-if="showForm"
            @cancel="closeContainerForm"
            @add="addContainer"
            :impoExpo="impoExpo"
            :containerTypes="customContainerTypes"
          />
          <SeaImportContainerEditForm
            :referenciaId="props.referenciaId"
            :container="containerToEdit"
            :containerTypes="customContainerTypes"
            @cancel="cancelEditContainer"
            @updated="setUpdatedContainer"
          />
        </div>

        <div>Total containers: {{ containers.length }}</div>
        <div v-if="pendingSaveChanges">
          <v-alert type="warning" density="compact">
            <div class="">Save service form to reflect changes.</div>
          </v-alert>
        </div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="10"></th>
              <th class="text-left">#</th>
              <th class="text-left">Container #</th>
              <th class="text-left">Type</th>
              <th class="text-left">m<sup class="">3</sup></th>
              <th class="text-left">Kgs</th>
              <th class="text-left"># Paquetes</th>
              <th class="text-left">notes</th>
              <th class="text-left"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in containers" :key="`mbl-${index}`">
              <td>
                <div class="flex gap-2">
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-pencil-outline"
                    color="blue-lighten-2"
                    density="compact"
                    @click="editContainer(item)"
                  ></v-btn>
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-delete-outline"
                    color="red-lighten-2"
                    density="compact"
                    @click="removeContainer(item, index)"
                  ></v-btn>
                </div>
              </td>
              <td>{{ index + 1 }}</td>
              <td>{{ item.container_number }}</td>
              <td>{{ containerTypeName(item.container_type_id) }}</td>
              <td>{{ item.volume }}</td>
              <td>{{ item.weight }}</td>
              <td>{{ item.num_packages }}</td>
              <td>{{ item.notes }}</td>
              <td>
                <UserInfoBadge :item="item" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referenciaId: {
    type: [Number, String],
    required: false,
  },
  impoExpo: {
    type: [String],
    required: true,
  },
  currentContainers: {
    type: [Array, null],
    required: false,
    default: () => [],
  },
  catalogs: {
    type: Object,
    required: true,
  },
  cargoType: {
    type: [String, null],
    required: false,
    default: '',
  },
})

const emit = defineEmits(['update:containers', 'refresh'])

const showForm = ref(false)
const containers = ref<any[]>([])
const hasPendingChanges = ref(false)
const containerToEdit = ref<any>(null)

const toggleForm = () => {
  showForm.value = !showForm.value
}

const pendingSaveChanges = computed(() => {
  // if containers id is null return true
  return containers.value.some((c) => c.id == null) || hasPendingChanges.value
})

const isFcl = computed(() => props.cargoType === 'FCL')
const isLcl = computed(() => props.cargoType === 'LCL')

const customContainerTypes = computed(() => {
  return props.catalogs.container_types
})

const hasCargoType = computed(() => {
  return props.cargoType != null || props.cargoType !== ''
})

// watch
watch(
  () => props.currentContainers,
  (currentContainers) => {
    if (currentContainers) {
      containers.value = [...currentContainers]
      // console.log('containers', containers)
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
  // if container_number already in containers do not add
  if (containers.value.some((c) => c.container_number === container.container_number)) {
    snackbar.add({ type: 'warning', text: 'Container already on list of containers.' })
    return
  }
  container.uuid = container.uuid || Math.random().toString(36).substring(7)
  containers.value.push(container)
  // toggleForm()
}

const editContainer = (container: any) => {
  containerToEdit.value = container
}

const setUpdatedContainer = (container: any) => {
  let index = containers.value.findIndex((c) => c.id === container.id)

  // If the container does not have an id yet, use uuid instead
  if (index === -1 && container.uuid) {
    index = containers.value.findIndex((c) => c.uuid === container.uuid)
  }

  if (index !== -1) {
    // Ensure reactivity is properly triggered
    containers.value.splice(index, 1, container)
  } else {
    snackbar.add({ type: 'error', text: 'Container not found' })
    console.warn(`Container with id ${container.id} or uuid ${container.uuid} not found`)
  }

  containerToEdit.value = null
}

const cancelEditContainer = () => {
  containerToEdit.value = null
}

const tryDeleteContainer = async (container: any, index: number) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: `Yes, delete container ${container.container_number}`,
    content: `Please confirm you want to delete container ${container.container_number}. This action cannot be undone.`,
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'red',
    },
  })

  if (result) {
    deleteContainer(container, index)
  }
}

const deleteContainer = async (container: any, index: number) => {
  try {
    loadingStore.start()

    const body = {
      ...container,
    }
    const response = await $api.referencias.deleteContainer(props.referenciaId!.toString(), body)

    snackbar.add({ type: 'success', text: 'Container deleted' })
    emit('refresh')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const removeContainer = (container: any, index: number) => {
  if (container.id != null) {
    tryDeleteContainer(container, index)
  }
  if (container.id == null) {
    containers.value.splice(index, 1)
    hasPendingChanges.value = true
  }
}
</script>
