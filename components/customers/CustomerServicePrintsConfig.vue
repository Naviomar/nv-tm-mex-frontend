<template>
  <div>
    <v-card>
      <v-card-title>
        <div class="flex gap-2 items-center">
          <v-icon>mdi-printer</v-icon>
          <span>Services print data</span>
        </div>
      </v-card-title>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left w-10">Actions</th>
              <th class="text-left">Service</th>
              <th class="text-left">Postage stamp</th>
              <th class="text-left">Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(service, index) in services" :key="`serv-print-${index}`">
              <td>
                <div class="flex items-center gap-2">
                  <EditButton :item="service.item" @click="editItem(service)" />
                </div>
              </td>
              <td class="whitespace-nowrap">{{ service.name }}</td>
              <td>
                <div class="flex justify-center">
                  <v-icon size="32" class="cursor-pointer" @click="showServPrint(service)">mdi-postage-stamp</v-icon>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="service.item">
                  {{ formatDateString(service.item?.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="form.show" width="500">
      <v-card color="amber">
        <v-card-title>
          <div class="flex gap-2 justify-between">
            <div class="flex gap-2 items-center">
              <v-icon>mdi-printer</v-icon>
              <span>{{ form.service.name }} print info</span>
            </div>
            <div>
              <v-btn icon size="x-small" @click="toggle" color="black">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="">
            <v-textarea v-model="form.item.envelope" density="compact" label="Postage stamp" :rows="6" />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="cancelForm"> Cancel </v-btn>
          <v-btn color="primary" @click="save"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="serviceInfo.show" width="500">
      <v-card color="amber">
        <v-card-title>
          <div class="flex gap-2 justify-between">
            <div class="flex gap-2 items-center">
              <v-icon>mdi-printer</v-icon>
              <span>{{ serviceInfo.service.name }} print info</span>
            </div>
            <div>
              <v-btn icon size="x-small" @click="serviceInfo.show = false" color="black">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div v-html="formattedEnvelope" class="border-2 border-dashed border-amber-700 p-4"></div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: [Number, String],
    required: true,
  },
})

const services = ref<any>([
  { type: 'mi', name: 'Sea Import', item: { id: null, envelope: null } },
  { type: 'me', name: 'Sea Export', item: { id: null, envelope: null } },
  { type: 'ai', name: 'Air Import', item: { id: null, envelope: null } },
  { type: 'ae', name: 'Air Export', item: { id: null, envelope: null } },
])

const servicePrints = ref<any>([])
const serviceInfo = ref<any>({
  show: false,
  service: {},
})

const showServPrint = (service: any) => {
  serviceInfo.value.service = service
  serviceInfo.value.show = true
}

const form = ref<any>({
  show: false,
  service: {},
  item: {},
})

const formattedEnvelope = computed(() => {
  if (!serviceInfo.value.service.item.envelope) {
    return ''
  }
  return serviceInfo.value.service.item?.envelope.replace(/\n/g, '<br>')
})

const toggle = () => {
  form.value.show = !form.value.show
}

const editItem = (service: any) => {
  form.value.show = true
  form.value.service = service
  form.value.item = service.item
}

const cancelForm = () => {
  form.value.service = {}
  form.value.item = {}

  form.value.show = false
}

const save = async () => {
  try {
    loadingStore.start()
    if (form.value.item.type == null) {
      form.value.item.type = form.value.service.type
    }
    const response = await $api.consignees.saveServicePrint(props.id!.toString(), form.value.item)

    form.value.service = {}
    form.value.item = {}
    form.value.show = false

    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    servicePrints.value = []
    loadingStore.start()
    const response = await $api.consignees.getServicePrints(props.id!.toString())
    servicePrints.value = response
    // add the service print data to the services array
    services.value.forEach((service: any) => {
      const servicePrint = servicePrints.value.find((sp: any) => sp.type === service.type)
      if (servicePrint) {
        service.item = servicePrint
      }
    })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  if (props.id) {
    await getData()
  }
})
</script>
