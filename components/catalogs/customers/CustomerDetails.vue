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
        <v-card color="" class="mb-4">
          <v-card-title>
            <div class="flex justify-between">
              <div>Executive(s)</div>
              
            </div>
          </v-card-title>
             <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Actions</th>
                  <th class="text-left">Executive</th>
                  <th class="text-left">From</th>
                  <th class="text-left">To</th>
                  <th class="text-left">Active</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cnn, index) in item?.consignee_executives" :key="`consig-exec-${index}`">
                 
                  <td>{{ cnn.executive.name }}</td>
                  <td>{{ cnn.valid_from }}</td>
                  <td>{{ cnn.undefined_time ? 'Undefined' : cnn.valid_to }}</td>
                  <td>{{ getExecutiveActiveByDates(item) }}</td>
                </tr>
              </tbody>
            </v-table>
        </v-card>
          
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

    
        <v-card class="mb-4">
          <v-card-title>
            <div class="flex justify-between">
              <div>Guarantee letter(s)</div>
            </div>
          </v-card-title>
          <v-card-text>
        
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Actions</th>
                  <th class="text-left">Customs agent</th>
                  <th class="text-left">Port</th>
                  <th class="text-left">Validity of</th>
                  <th class="text-left">To</th>
                  <th v-if="false" class="text-left">Attachment</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(warranty, index) in item?.warranty_letters" :key="`carta-encomienda-${index}`">
                  <td class="whitespace-nowrap">{{ warranty.custom_agent?.short_name }}</td>
                  <td class="whitespace-nowrap">{{ warranty.port?.name }}</td>
                  <td class="whitespace-nowrap">{{ warranty.valid_from }}</td>
                  <td class="whitespace-nowrap">{{ warranty.valid_to }}</td>
                  <td v-if="false">
                    <v-btn size="small" variant="outlined"
                      ><v-icon>mdi-download-circle-outline</v-icon>Adjunto.pdf/img</v-btn
                    >
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>
            <div class="flex justify-between">
              <div>Entrusts letter(s)</div>
            </div>
          </v-card-title>
          <v-card-text>
            <!-- <pre>{{ catalogs }}</pre> -->
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Actions</th>
                  <th class="text-left">Customs agent</th>
                  <th class="text-left">Port</th>
                  <th class="text-left">Validity of</th>
                  <th class="text-left">To</th>
                  <th v-if="false" class="text-left">Attachment</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entrust, index) in item?.entrust_letters" :key="`carta-encomienda-${index}`">
                  <td class="whitespace-nowrap">{{ entrust.custom_agent.short_name }}</td>
                  <td class="whitespace-nowrap">{{ entrust.port.name }}</td>
                  <td class="whitespace-nowrap">{{ entrust.valid_from }}</td>
                  <td class="whitespace-nowrap">{{ entrust.valid_to }}</td>
                  <td v-if="false">
                    <v-btn size="small" variant="outlined"
                      ><v-icon>mdi-download-circle-outline</v-icon>Adjunto.pdf/img</v-btn
                    >
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>Emails</v-card-title>
          <v-card-text>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Email</th>
                  <th class="text-left">Notes</th>
                  <th class="text-left">Port(s)</th>
                  <th class="text-left">Airport(s)</th>
                  <th class="text-left">Noty Type(s)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(mail, indexm) in item.consignee_emails" :key="`consg-email-${indexm}`">
                  <td>{{ mail.email }}</td>
                  <td>{{ mail.notes }}</td>
                  <td>
                    <div v-if="mail.ports && mail.ports.length > 0" class="d-flex flex-wrap gap-1 py-1">
                    <v-chip
                      v-for="(port, pIndex) in mail.ports"
                      :key="`port-${pIndex}`"
                      size="x-small"
                      color="blue"
                      variant="tonal"
                    >
                      <v-icon start size="x-small">mdi-anchor</v-icon>
                      {{ port.name }}
                    </v-chip>
                  </div>
                  <span v-else class="text-caption text-medium-emphasis">—</span>
                  </td>
                  <td>
                    <div v-if="mail.airports && mail.airports.length > 0" class="d-flex flex-wrap gap-1 py-1">
                      <v-chip
                        v-for="(airport, aIndex) in mail.airports"
                        :key="`airport-${aIndex}`"
                        size="x-small"
                        color="deep-purple"
                        variant="tonal"
                      >
                        <v-icon start size="x-small">mdi-airplane</v-icon>
                        {{ airport.name }}
                      </v-chip>
                    </div>
                    <span v-else class="text-caption text-medium-emphasis">—</span>
                  </td>
                  <td>
                    <div v-if="!mail.mail_notifications?.length" class="text-caption text-medium-emphasis">—</div>
                    <div v-else class="noty-list py-1">
                      <div
                        v-for="(mailNoty, nIndex) in mail.mail_notifications"
                        :key="`email-mail-noti-${nIndex}`"
                        class="noty-row"
                        :class="mailNoty.pivot.type === 'CC' ? 'noty-row--cc' : 'noty-row--to'"
                      >
                        <span class="noty-type">{{ mailNoty.pivot.type }}</span>
                        <span class="noty-name">{{ formatNotificationName(mailNoty.short_name) }}</span>
                        <v-icon
                          v-if="isPortFilterableNotification(mailNoty.short_name) && mail.ports && mail.ports.length > 0"
                          size="x-small"
                          color="blue"
                          v-tooltip="'Filtered by port'"
                        >mdi-anchor</v-icon>
                      </div>
                      
                    </div>

                  </td>
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
import { isPortFilterableNotification, formatNotificationName } from '~/utils/mailNotifications'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const item = ref<any>({})

const getExecutiveActiveByDates = (item: any) => {
  const today = new Date()
  const validFrom = new Date(item.valid_from)
  const validTo = new Date(item.valid_to)

  if (item.undefined_time) {
    return 'Yes'
  }

  if (today >= validFrom && today <= validTo) {
    return 'Yes'
  }

  return 'No'
}

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
<style scoped>
  .emails-table :deep(thead th) {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(0, 0, 0, 0.5);
    background: rgba(0, 0, 0, 0.02);
  }

  .emails-table :deep(tbody tr:hover td) {
    background: rgba(var(--v-theme-primary), 0.03);
  }

  .emails-table :deep(td) {
    vertical-align: top;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }
  .noty-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .noty-row {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .noty-row--to {
    background: rgba(var(--v-theme-primary), 0.07);
  }

  .noty-row--cc {
    background: rgba(255, 179, 0, 0.1);
  }

  .noty-type {
    font-weight: 700;
    font-size: 0.68rem;
    letter-spacing: 0.04em;
    flex-shrink: 0;
    opacity: 0.75;
  }

  .noty-name {
    flex: 1;
  }
</style>
