<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex justify-between">
        <div>Linked Agents</div>
        <div>
          <v-btn icon size="x-small" @click="toggle" :color="showForm ? 'black' : 'success'">
            <v-icon v-if="showForm">mdi-close</v-icon>
            <v-icon v-if="!showForm">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-text>
      <div v-if="showForm" class="p-4 mb-4 grid grid-cols-2 gap-2">
        <div class="col-span-2">Freight Agent</div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="form.agent_id"
            label="Freight Agent *"
            :items="agents"
            item-value="id"
            item-title="name"
            variant="solo-filled"
            density="compact"
          />
        </div>
        <div class="col-span-2">
          <div class="flex justify-end items-center">
            <v-btn class="mr-4" color="secondary" @click="toggle"> Cancel </v-btn>
            <v-btn color="primary" @click="save"> Save </v-btn>
          </div>
        </div>
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th width="10px"></th>
            <th class="text-left">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in line.agents" :key="`line-agent-${index}`">
            <td>
              <div class="flex gap-2">
                <div class="flex">
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-delete-outline"
                    color="red-lighten-2"
                    density="comfortable"
                    @click="showConfirmDelete(item.id)"
                  ></v-btn>
                </div>
              </div>
            </td>
            <td>{{ item.name }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps({
  line: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['refresh'])

const form = reactive({
  agent_id: null,
})

const agents = ref<any>([])
const response = await $api.lines.getAgentsAll()
agents.value = response

const showForm = ref(false)

const toggle = () => {
  showForm.value = !showForm.value
}

const save = async (values: any) => {
  if (!form.agent_id) {
    snackbar.add({ type: 'error', text: 'Please select a freight agent.' })
    return
  }
  const body = {
    agent_id: form.agent_id,
  }
  const response: any = await $api.lines.linkAgent(props.line.id, body)

  snackbar.add({ type: 'success', text: 'Freight agent linked successfully.' })
  toggle()
  emit('refresh')
  form.agent_id = null
}

const showConfirmDelete = async (id: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete the agent from this line.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.loading = true
      await $api.lines.deleteLinkedAgent(props.line.id, id)

      snackbar.add({ type: 'success', text: 'Agent deleted' })
      emit('refresh')
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}
</script>
