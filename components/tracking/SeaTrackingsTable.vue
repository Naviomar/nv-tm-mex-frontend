<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-3 gap-4">
        <div class="">
          <v-autocomplete v-model="filters.year" :items="prefixYears" density="compact" label="Year" />
        </div>
        <div class="">
          <v-text-field
            v-model="filters.referencia"
            density="compact"
            label="Add reference #"
            hint="Separate multiple references with commas"
            @keyup.enter="addReferencia"
          />
        </div>
        <v-text-field v-model="filters.mbl" density="compact" label="Master BL" />
        <v-text-field v-model="filters.hbl" density="compact" label="House BL" />
        <v-text-field v-model="filters.containerNumber" density="compact" label="Container number" />
      </div>
      <div v-if="filters.referencias.length > 0" class="mb-4">
        <div>Filter by reference(s)</div>
        <div class="flex gap-2">
          <v-chip
            v-for="(ref, index) in filters.referencias"
            :key="`ref-search-${ref}`"
            closable
            density="compact"
            @click:close="removeReferencia(index)"
          >
            {{ ref }}
          </v-chip>
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Service</th>
              <th class="text-left">Type</th>
              <th class="text-left">Event date</th>
              <th class="text-left">Event</th>
              <th class="text-left">Details</th>
              <th class="text-left">is manual?</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(seaTracking, index) in seaTrackings.data"
              :key="`sea-tracking-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': seaTracking.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="seaTracking" @click="viewTrackingEvent(seaTracking)" />
                </div>
              </td>
              <td class="whitespace-nowrap">{{ seaTracking.referencia?.reference_number }}</td>
              <td>{{ seaTracking.type }}</td>
              <td class="whitespace-nowrap">{{ seaTracking.event_date }}</td>
              <td>{{ seaTracking.event?.name }}</td>
              <td>{{ seaTracking.event_description }}</td>
              <td>{{ seaTracking.is_manual ? 'Yes' : 'No' }}</td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="seaTracking">
                  {{ formatDateString(seaTracking.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="seaTrackings.current_page"
          :length="seaTrackings.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { prefixYears } from '~/utils/date'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingStore = useLoadingStore()

const filters = ref({
  year: null,
  referencia: '',
  referencias: [] as string[],
  mbl: null,
  hbl: null,
  containerNumber: null,
})

const seaTrackings = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const addReferencia = () => {
  if (filters.value.referencia) {
    // split by comma and remove empty spaces
    filters.value.referencia = filters.value.referencia.replace(/\s/g, '')
    const refs = Array.from(new Set(filters.value.referencia.split(','))).filter((ref) => ref !== '')
    // remove duplicates in refs array using set

    refs.forEach((ref) => {
      filters.value.referencias.push(ref)
    })
    filters.value.referencias = [...new Set(filters.value.referencias)]
    filters.value.referencia = ''
  }
}

const removeReferencia = (index: number) => {
  filters.value.referencias.splice(index, 1)
}

const onClickFilters = async () => {
  // set current page to 1
  seaTrackings.value.current_page = 1
  await getSeaTrackings()
}

const onClickPagination = async (page: number) => {
  seaTrackings.value.current_page = page
  await getSeaTrackings()
}

const editBank = (airline: any) => {
  router.push(`/configuration/seaTrackings/edit-${airline.id}`)
}

const viewTrackingEvent = (seaTracking: any) => {
  router.push(`/tracking/sea/add?seaTrackingId=${seaTracking.id}&referenciaId=${seaTracking.referencia_id}`)
}

const getSeaTrackings = async () => {
  try {
    loadingStore.start()
    const response = await $api.seaTrackings.getPaged({
      query: {
        page: seaTrackings.value.current_page,
        perPage: seaTrackings.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    seaTrackings.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const clearFilters = async () => {
  filters.value = {
    year: null,
    referencia: '',
    referencias: [] as string[],
    mbl: null,
    hbl: null,
    containerNumber: null,
  }
  await getSeaTrackings()
}

onMounted(async () => {
  await getSeaTrackings()
})
</script>
