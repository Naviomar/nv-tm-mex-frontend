<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Customer {{ item.name }}</div>
          </v-card-title>
          <v-card-text>
            <v-card>
              <v-card-text>
                <div class="grid grid-cols-3 items-center gap-2">
                  <div class="font-bold">Name:</div>
                  <div class="col-span-2">{{ item.name }}</div>
                  <div class="font-bold">Code:</div>
                  <div class="col-span-2">{{ item.code }}</div>
                  <div class="font-bold">Finance code:</div>
                  <div class="col-span-2">{{ item.finance_code }}</div>
                  <div class="font-bold">Contact:</div>
                  <div class="col-span-2">{{ item.contact_name }}</div>
                  <div class="font-bold">RFC:</div>
                  <div class="col-span-2">{{ item.tax_number }}</div>
                  <div class="font-bold">CURP:</div>
                  <div class="col-span-2">{{ item.curp }}</div>
                  <div class="font-bold">Country:</div>
                  <div class="col-span-2">{{ item.country?.name }}</div>
                  <div class="font-bold">Active</div>
                  <div class="col-span-2">
                    <v-switch
                      v-model="item.is_active"
                      label="Active"
                      color="green"
                      density="compact"
                      :value="1"
                      variant="solo-filled"
                      readonly
                      hide-details
                    />
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="my-2">
              <v-card-title>
                <div class="flex items-center gap-2">
                  <v-icon>mdi-ferry</v-icon>
                  <div class="font-bold">Maritime services</div>
                </div>
              </v-card-title>
              <v-card-text>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <div>
                      <v-switch
                        v-model="item.is_import"
                        label="import"
                        color="green"
                        :value="1"
                        variant="solo-filled"
                        readonly
                        hide-details
                      />
                    </div>
                    <div>
                      <v-text-field
                        v-model="item.import_credit_days"
                        density="compact"
                        variant="solo-filled"
                        label="Credit days (Import)"
                        readonly
                      />
                    </div>
                    <div>
                      <v-text-field
                        v-model="item.import_free_days"
                        density="compact"
                        variant="solo-filled"
                        label="Free days (Import)"
                        readonly
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <v-switch
                        v-model="item.is_export"
                        label="export"
                        color="green"
                        :value="1"
                        variant="solo-filled"
                        readonly
                        hide-details
                      />
                    </div>
                    <div>
                      <v-text-field
                        v-model="item.export_credit_days"
                        density="compact"
                        variant="solo-filled"
                        label="Credit days (Export)"
                        readonly
                      />
                    </div>
                    <div>
                      <v-text-field
                        v-model="item.export_free_days"
                        density="compact"
                        variant="solo-filled"
                        label="Free days (Export)"
                        readonly
                      />
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="my-2">
              <v-card-title>
                <div class="flex items-center gap-2">
                  <v-icon>mdi-airplane</v-icon>
                  <div class="font-bold">Air services</div>
                </div>
              </v-card-title>
              <v-card-text>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <div>
                      <v-switch
                        v-model="item.is_air_import"
                        label="import"
                        color="green"
                        :value="1"
                        variant="solo-filled"
                        readonly
                        hide-details
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <v-switch
                        v-model="item.is_air_export"
                        label="export"
                        color="green"
                        :value="1"
                        variant="solo-filled"
                        readonly
                        hide-details
                      />
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card class="mb-4">
          <v-card-title>Address book </v-card-title>
          <v-card-text>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-left">Street</th>
                  <th class="text-left">Neighborhood</th>
                  <th class="text-left">City</th>
                  <th class="text-left">State</th>
                  <th class="text-left">Country</th>
                  <th class="text-left">Zip code</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(address, index) in item.addresses" :key="`consg-address-${index}`">
                  <td>
                    <div class="flex items-center gap-2">
                      <v-chip color="yellow-darken-4" v-if="address.is_default" size="small"
                        ><v-icon>mdi-star</v-icon></v-chip
                      >
                      {{ address.name }}
                    </div>
                  </td>
                  <td>{{ address.street }} {{ address.number }}</td>
                  <td>{{ address.neighborhood }}</td>
                  <td>{{ address.city }}</td>
                  <td>{{ address.state }}</td>
                  <td>{{ address.country?.name }}</td>
                  <td>{{ address.zip_code }}</td>
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

const item = ref<any>({})

const getData = async () => {
  try {
    loadingStore.start()
    const response = await $api.consignees.getById(props.id)
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
