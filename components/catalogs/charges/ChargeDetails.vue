<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Charge {{ item.name }}</div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2">
              <div class="">Name</div>
              <div class="font-bold">{{ item.name }}</div>
              <div class="">Code</div>
              <div class="font-bold">{{ item.code }}</div>
              <div class="">Entity</div>
              <div class="font-bold">{{ item.charge_entity?.name }}</div>
              <div class="">Default amount</div>
              <div class="font-bold">{{ formatToCurrency(item.default_amount) }}</div>
            </div>
            <div class="grid grid-cols-2 py-4">
              <div class="font-bold">Service(s)</div>
              <div class="font-bold">
                <ul>
                  <li v-for="(service, index) in item.services" :key="`service-${index}`">
                    {{ service.name }} - {{ service.pivot?.is_import ? '(Import)' : '' }}
                    {{ service.pivot?.is_export ? '(Export)' : '' }} {{ service.pivot?.is_local ? '(local)' : '' }}
                    {{ service.pivot?.is_ocean_freight ? '(OCF)' : '' }}
                    {{ service.pivot?.is_warranty_deposit ? '(security deposit)' : '' }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="grid grid-cols-2 py-4">
              <div class="font-bold">CFDI mask names</div>
              <div class="font-bold">
                <ul>
                  <li v-for="(cfdiName, index) in item.cfdi_names" :key="`mask-${index}`">
                    {{ cfdiName.name }}
                  </li>
                </ul>
              </div>
            </div>
            
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
    const response = await $api.charges.getById(props.id)
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
