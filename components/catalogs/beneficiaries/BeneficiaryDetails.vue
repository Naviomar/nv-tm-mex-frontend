<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Beneficiary {{ item.name }}</div>
          </v-card-title>
          <v-card-text>
            <v-card>
              <v-card-text>
                <div class="grid grid-cols-3 items-center gap-2">
                  <div class="font-bold">Name:</div>
                  <div class="col-span-2">{{ item.name }}</div>
                  <div class="font-bold">Legal name:</div>
                  <div class="col-span-2">{{ item.legal_name }}</div>
                  <div class="font-bold">Tax number:</div>
                  <div class="col-span-2">{{ item.tax_number }}</div>
                  <div class="font-bold">Contact:</div>
                  <div class="col-span-2">{{ item.contact_name }}</div>
                  <div class="font-bold">Email:</div>
                  <div class="col-span-2">{{ item.email }}</div>
                  <div class="font-bold">Phone:</div>
                  <div class="col-span-2">{{ item.phone }}</div>
                  <div class="font-bold">Country:</div>
                  <div class="col-span-2">{{ item.country?.name }}</div>
                  <div class="font-bold">Notes:</div>
                  <div class="col-span-2">{{ item.notes }}</div>
                  <div class="font-bold">Active</div>
                  <div class="col-span-2">
                    <v-switch
                      v-model="item.is_active"
                      label="Active"
                      color="green"
                      density="compact"
                      :true-value="1"
                      :false-value="0"
                      variant="solo-filled"
                      readonly
                      hide-details
                    />
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card class="mb-4">
          <v-card-title>Bank accounts</v-card-title>
          <v-card-text>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Alias</th>
                  <th class="text-left">Bank</th>
                  <th class="text-left">Account number</th>
                  <th class="text-left">Currency</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(bank, index) in item.banks" :key="`beneficiary-view-bank-${index}`">
                  <td>
                    <div class="flex items-center gap-2">
                      <v-chip color="yellow-darken-4" v-if="bank.is_default" size="small"><v-icon>mdi-star</v-icon></v-chip>
                      {{ bank.name }}
                    </div>
                  </td>
                  <td>{{ bank.bank?.name }}</td>
                  <td>{{ bank.account_number }}</td>
                  <td>{{ bank.currency?.name }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const item = ref<any>({
  banks: [],
})

const getData = async () => {
  try {
    loadingStore.start()
    const response = await $api.beneficiaries.getById(props.id)
    item.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getData()
})
</script>
