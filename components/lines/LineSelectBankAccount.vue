<template>
  <div>
    <v-card color="blue-lighten-4" variant="flat" class="mb-4" density="compact">
      <v-card-title>
        <div class="flex justify-between items-center text-base">
          <div>
            <div>{{ line?.name }}</div>
            <div class="font-bold">Choose bank account</div>
            <div v-if="hasLine"><v-btn size="x-small" @click="goToLine">Go to line config</v-btn></div>
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
            </tr>
          </thead>
          <tbody>
            <tr v-if="line.banks?.length === 0">
              <td colspan="3" class="text-center">No bank accounts found</td>
            </tr>
            <tr v-for="(bank, index) in line.banks" :key="`line-${index}`">
              <td>
                <v-btn color="secondary" size="small" @click="selectBank(bank)">Choose</v-btn>
              </td>
              <td class="whitespace-nowrap">
                <div>
                  <div class="grid grid-cols-[fr_fr] gap-4">
                    <div class="grid grid-cols-[auto_auto] gap-0">
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
                    <div class="grid grid-cols-[auto_auto] gap-0">
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
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import type { t } from '@wangeditor/editor'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const clipboard = useCopyToClipboard()
const router = useRouter()

const props = defineProps({
  id: {
    type: [Number, null],
    required: true,
  },
  currencyId: {
    type: [String, Number],
    required: false,
    default: null,
  },
})

const showInfo = ref(true)
const line = ref<any>({
  banks: [],
})
const hasLine = computed(() => !!line.value.id)

const emit = defineEmits(['update:modelValue'])

const selectBank = (bank: any) => {
  if (props.currencyId && props.currencyId && bank.currency_id !== props.currencyId) {
    snackbar.add({ type: 'error', text: 'The selected bank account does not match the currency selected' })
    return
  }
  emit('update:modelValue', bank)
  showInfo.value = false
  snackbar.add({ type: 'success', text: 'Bank account selected' })
}

const goToLine = () => {
  navigateTo(`/configuration/lines/edit-${props.id}`, {
    external: true,
    open: {
      target: '_blank',
    },
  })
}

const getLine = async () => {
  try {
    loadingStore.start()
    const response = await $api.lines.getById(props.id!.toString())
    line.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

watch(
  () => props.id,
  (id) => {
    if (!id) {
      line.value = { banks: [] }
      emit('update:modelValue', null)
    } else {
      getLine()
    }
  },
  { immediate: true }
)
</script>
