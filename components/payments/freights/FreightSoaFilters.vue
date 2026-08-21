<template>
  <div>
    <div class="d-flex justify-end">
      <v-btn size="small" variant="text" @click="showFilters = !showFilters">
        <v-icon>{{ showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        {{ showFilters ? 'Hide filters' : 'Show filters' }}
      </v-btn>
    </div>
    <div v-show="showFilters" class="mb-2" @keyup.enter="$emit('search')">
      <!-- FUTURE: Party type selector (FF / Consignee) hidden until Consignee SOA payment flow is fully enabled.
           When re-enabling, restore the partyTypeFilter autocomplete, the v-if guards on FF fields, and the
           consignee AGlobalSearch block. Also restore the consignee branch in sendToPay / getFreightSoa validation.
      -->
      <div class="grid grid-cols-3 md:grid-cols-6 gap-2 items-center">
        <div class="col-span-1">
          <v-autocomplete
            v-model="filters.freightId"
            clearable
            :items="freightForwarders"
            item-title="name"
            item-value="id"
            density="compact"
            label="Freight forwarder"
          />
        </div>
        <div class="col-span-1">
          <AGlobalSearch
            v-model="filters.freightGroupId"
            :onSearch="searchFfGroups"
            validate-key="freightGroupId"
            label="Freight Forwarder Group"
          />
        </div>
        <div class="col-span-1">
          <v-text-field v-model="filters.startDate" clearable type="date" density="compact" label="Start date" />
        </div>
        <div class="col-span-1">
          <v-text-field v-model="filters.endDate" clearable type="date" density="compact" label="End date" />
        </div>
        <div class="col-span-1">
          <v-autocomplete
            v-model="filters.currencyId"
            clearable
            :items="currencies"
            item-title="name"
            item-value="id"
            density="compact"
            label="Currency"
          />
        </div>
        <div class="col-span-1 flex gap-2">
          <v-btn size="small" color="secondary" @click="$emit('clear')"> Clear </v-btn>
          <v-btn size="small" color="primary" @click="$emit('search')"> Search </v-btn>
        </div>
        <div v-if="false" class="col-span-1">
          <v-text-field v-model="filters.folio" clearable density="compact" label="# Note" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  filters: any
  freightForwarders: any[]
  currencies: any[]
  searchFfGroups: (params: any) => Promise<any>
}>()

defineEmits<{
  search: []
  clear: []
}>()

const showFilters = ref(true)
</script>
