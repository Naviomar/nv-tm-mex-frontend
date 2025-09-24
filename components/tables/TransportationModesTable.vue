<template>
  <div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(transportMode, index) in transportsModes.data"
              :key="`transporteMode-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': transportMode.deleted_at }"
            >
              <td></td>
              <td>{{ transportMode.name }}</td>

              <td>{{ transportMode.created_at }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="transportsModes.current_page"
          :length="transportsModes.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref({
  name: '',
})

const transportsModes = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  
  transportsModes.value.current_page = page
  await getTransportsModes()
}

const getTransportsModes = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.transportationModes.getTransportionModes({
      key: 'transpotsModes',
      query: {
        page: transportsModes.value.current_page,
        perPage: transportsModes.value.perPage,
         ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    transportsModes.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

await getTransportsModes()

const clearFilters = async () => {
  filters.value = {
    name: '',
  }
  await getTransportsModes()
}
</script>
