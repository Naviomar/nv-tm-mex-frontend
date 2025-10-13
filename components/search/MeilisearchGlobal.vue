<template>
  <ais-instant-search :search-client="client" index-name="mexico_referencia">
    <ais-search-box placeholder="Search here…" class="searchbox"></ais-search-box>
    <ais-hits>
      <template v-slot="{ items }">
        <ul>
          <li v-for="{ id, customer_name, reference_number } in items" :key="id">
            <h1>{{ reference_number }} - {{ customer_name }}</h1>
          </li>
        </ul>
      </template>
    </ais-hits>
  </ais-instant-search>
</template>
<script setup>
import { AisInstantSearch, AisHits, AisSearchBox } from 'vue-instantsearch/vue3/es'

const client = useInstantSearch()
</script>
