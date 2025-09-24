<template>
  <div class="">
    <v-list lines="two" density="compact">
      <v-list-item v-if="item.action === 'created'" :subtitle="className" :title="`${item.chargeable?.charge?.name}`">
        <template v-slot:prepend>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-avatar v-bind="props">
                <v-icon color="green">mdi-creation-outline</v-icon>
              </v-avatar>
            </template>
            <div class="">Created</div>
          </v-tooltip>
        </template>
        <template v-slot:subtitle="{ subtitle }">
          <div>{{ subtitle }}</div>
        </template>
      </v-list-item>
      <v-list-item v-if="item.action === 'updated'" :subtitle="className" :title="`${item.chargeable?.charge?.name}`">
        <template v-slot:prepend>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-avatar v-bind="props">
                <v-icon color="amber">mdi-update</v-icon>
              </v-avatar>
            </template>
            <div class="">Updated</div>
          </v-tooltip>
        </template>
        <template v-slot:subtitle="{ subtitle }">
          <div>{{ subtitle }}</div>
          <div>{{ item.changes }}</div>
        </template>
      </v-list-item>
      <v-list-item v-if="item.action === 'deleted'" :subtitle="className" :title="`${item.chargeable?.charge?.name}`">
        <template v-slot:prepend>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-avatar v-bind="props">
                <v-icon color="red">mdi-delete-outline</v-icon>
              </v-avatar>
            </template>
            <div class="">Deleted</div>
          </v-tooltip>
        </template>
        <template v-slot:subtitle="{ subtitle }">
          <div>{{ subtitle }}</div>
          <div>{{ item.changes }}</div>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

const props = defineProps({
  item: {
    type: Object,
    default: () => null,
  },
  chargeIdKey: {
    type: String,
    default: 'charge_id',
  },
  amountKey: {
    type: String,
    default: 'charge_id',
  },
})

const chargeStore = useChargeStore()
const charge = computed(() => chargeStore.getChargeById(parseInt(props.item?.changes?.[props.chargeIdKey])))

const className = computed(() => {
  const classN = props.item.chargeable_type.split('\\').pop() // Splits by backslashes and takes the last part
  return `${classN} #${props.item.chargeable_id}`
})

// Reactive states for tooltip and dialog
const showDetails = ref(false)

// Method to toggle the details modal
function toggleDetails() {
  showDetails.value = !showDetails.value
}

onMounted(() => {
  chargeStore.ensureCharges($api)
})
</script>

<style scoped>
/* Tooltip styles */
.tooltip {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

/* Content slot container */
.content-slot {
  position: relative;
  z-index: 1;
}
</style>
