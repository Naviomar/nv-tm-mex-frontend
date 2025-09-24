<template>
  <div>
    <v-card color="blue-lighten-4" variant="flat" class="mb-4" density="compact">
      <v-card-title>
        <div class="flex justify-between items-center text-base">
          <div>
            <div>{{ customsAgent?.name }}</div>
            <div class="font-bold">Choose bank account</div>
            <div v-if="hasCustomAgent">
              <v-btn size="x-small" @click="goToCustomAgents">Go to customs agent config</v-btn>
            </div>
          </div>

          <v-btn icon size="x-small" @click="showInfo = !showInfo" color="blue-grey-darken-2">
            <v-icon v-if="showInfo">mdi-eye-outline</v-icon>
            <v-icon v-if="!showInfo">mdi-eye-closed</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text v-if="showInfo">
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Bank</th>
              <th class="text-left">Date added</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="customsAgent.banks.length === 0">
              <td colspan="3" class="text-center">No bank accounts found</td>
            </tr>
            <tr v-for="(bank, index) in customsAgent.banks" :key="`customsAgent-${index}`">
              <td>
                <v-btn color="secondary" size="small" @click="selectBank(bank)">Choose</v-btn>
              </td>
              <td>
                <div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="grid grid-cols-2 gap-0">
                      <div class="font-bold">Bank:</div>
                      <div>
                        <v-chip color="yellow-darken-4" v-if="bank.is_default" size="small"
                          ><v-icon>mdi-star</v-icon></v-chip
                        >
                        {{ bank.bank?.name }} - alias ({{ bank.name }})
                      </div>

                      <div>Account number:</div>
                      <div>
                        <v-icon class="cursor-pointer" @click="clipboard.copyToClipboard(bank.account_number)">
                          mdi-content-copy
                        </v-icon>
                        {{ bank.account_number }} - {{ getCurrencyName(bank.currency_id) }}
                      </div>

                      <div>Beneficiary:</div>
                      <div>{{ bank.beneficiary_name }}</div>

                      <div>Address:</div>
                      <div>{{ bank.beneficiary_address }}</div>
                    </div>
                    <div class="grid grid-cols-2 gap-0">
                      <div>ABA:</div>
                      <div>{{ bank.aba }}</div>

                      <div>SWIFT:</div>
                      <div>{{ bank.swift }}</div>

                      <div>IBAN:</div>
                      <div>{{ bank.iban }}</div>
                    </div>
                  </div>
                </div>
              </td>
              <td>{{ formatDateString(bank.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const clipboard = useCopyToClipboard()

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const showInfo = ref(true)
const customsAgent = ref<any>({
  banks: [],
})

const hasCustomAgent = computed(() => !!customsAgent.value.id)

const emit = defineEmits(['update:modelValue'])

const selectBank = (bank: any) => {
  emit('update:modelValue', bank)
  showInfo.value = false
  snackbar.add({ type: 'success', text: 'Bank account selected' })
}

const goToCustomAgents = () => {
  navigateTo('/configuration/custom-agents/edit-' + props.id, {
    open: {
      target: '_blank',
    },
  })
}

const getCustomer = async () => {
  try {
    loadingStore.start()
    const response = await $api.customAgents.getById(props.id.toString())
    customsAgent.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
// watch props.id if null clear customsAgent
watch(
  () => props.id,
  (id) => {
    if (!id) {
      customsAgent.value = { banks: [] }
      emit('update:modelValue', null)
    } else {
      getCustomer()
    }
  },
  { immediate: true }
)
</script>
