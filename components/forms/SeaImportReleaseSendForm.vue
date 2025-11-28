<template>
  <div>
    <div>
      <div class="flex gap-2 items-center">
        <div class="font-bold">Release send</div>
        <v-btn icon size="x-small" @click="toggle" :color="showForm ? 'black' : 'success'">
          <v-icon v-if="showForm">mdi-close</v-icon>
          <v-icon v-if="!showForm">mdi-plus</v-icon>
        </v-btn>
      </div>
      <div v-if="showForm">
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Release ? *</th>
              <th class="text-left">Send instruction *</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <v-radio-group v-model="form.is_released">
                  <v-radio label="Yes" value="1"></v-radio>
                  <v-radio label="No" value="0"></v-radio>
                </v-radio-group>
              </td>
              <td>
                <v-text-field
                  v-model="form.instruction_date"
                  density="compact"
                  type="date"
                  label="Send instruction *"
                />
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <v-textarea v-model="form.notes" dense :rows="2" :counter="3000" label="Notes" />
              </td>
            </tr>
          </tbody>
        </v-table>
        <div class="flex justify-center">
          <v-btn size="small" color="primary" @click="saveReleaseInstructionClick"
            >Save Release - Send instruction</v-btn
          >
        </div>
      </div>
    </div>

    <v-table>
      <thead>
        <tr>
          <th class="text-left">is released?</th>
          <th class="text-left">Date</th>
          <th class="text-left">Notes</th>
          <th class="text-left">By</th>
          <th class="text-left">Created at</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!hasReleaseInstructions">
          <td colspan="3" class="text-center">No release instructions</td>
        </tr>
        <tr v-for="(release, index) in reference.release_instructions" :key="`release-${index}`">
          <td>
            {{ release.is_released === 1 ? 'Yes' : 'No' }}
          </td>
          <td>
            {{ release.instruction_date }}
          </td>
          <td>
            {{ release.notes }}
          </td>
          <td>
            {{ release.created_by.name }}
          </td>
          <td>
            {{ release.created_at }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  reference: {
    type: Object,
    required: true,
  },
})

const form = ref({
  is_released: null,
  instruction_date: '',
  notes: '',
})

const showForm = ref(false)

const toggle = () => {
  showForm.value = !showForm.value
}

const hasReleaseInstructions = computed(() => {
  return props.reference.release_instructions.length > 0
})

const saveReleaseInstructionClick = () => {
  if (form.value.is_released == null || form.value.instruction_date == '') {
    snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
    return
  }
  submitReleaseInstruction()
}

const submitReleaseInstruction = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.referencias.saveReleaseInstruction(props.reference.id, form.value)

    snackbar.add({ type: 'success', text: 'Release instruction saved' })

    props.reference.release_instructions.push(response)
    // clear form
    form.value = {
      is_released: null,
      instruction_date: '',
      notes: '',
    }
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    loadingStore.stop()
  }
}
</script>
