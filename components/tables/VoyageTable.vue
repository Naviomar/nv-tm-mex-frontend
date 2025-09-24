<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-2">
        <div class="col-span-1">
          <v-autocomplete
            v-model="filters.lineId"
            density="compact"
            :items="catalogs.lines"
            item-title="name"
            item-value="id"
            label="Freight line"
          />
        </div>
        <div class="col-span-1">
          <v-autocomplete
            v-model="filters.impoExpo"
            density="compact"
            :items="[
              { name: 'Import', value: 'I' },
              { name: 'Export', value: 'E' },
            ]"
            item-title="name"
            item-value="value"
            label="Import / Export"
          />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.text" density="compact" label="Voyage" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.vesselName" density="compact" label="Vessel name" />
        </div>

        <div v-if="false" class="col-span-1">
          <v-autocomplete
            v-model="filters.voyage"
            density="compact"
            :items="catalogs.voyages"
            item-title="name"
            item-value="id"
            label="Voyage"
          />
        </div>
        <div class="col-span-2">
          <AGlobalSearch
            v-model="filters.pod"
            :onSearch="searchPorts"
            validate-key="tranship.port_id"
            prepend-inner-icon="mdi-ferry"
            :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
            label="Port"
          />
        </div>
        <div class="col-span-1">
          <v-text-field v-model="filters.etaDate" density="compact" label="ETA" type="date" />
        </div>
        <div class="col-span-1">
          <v-text-field v-model="filters.arrivalDate" density="compact" label="ATA" type="date" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            hide-details
          />
        </div>
      </div>
      <div class="grid grid-cols-1 py-2">
        <div class="flex gap-2">
          <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-title> Voyage - Destinations </v-card-title>

      <v-card-text>
        <div class="flex flex-wrap gap-2">
          <v-chip class="bg-orange-900/75! text-white">IMPORT</v-chip>
          <v-chip class="bg-purple-900/75! text-white">EXPORT</v-chip>
        </div>
        <v-pagination
          v-model="voyageDestinations.current_page"
          :length="voyageDestinations.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="w-10">Lock</th>
              <th class="text-left">Vessel / Line</th>
              <th class="text-left">Voyage</th>
              <th class="text-left">I/E</th>
              <th class="text-left">Port</th>
              <th class="text-left">ETA/ETD</th>
              <th class="text-left">ATA/ATD</th>
              <th class="text-left">Options</th>
              <th class="text-left">Linked Services</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(voyageDest, index) in voyageDestinations.data"
              :key="`voyage-${index}`"
              :class="{
                '!bg-orange-100 dark:!bg-orange-900/80 dark:text-white': voyageDest.voyage?.impoExpo === 'I', // Import (I) - Dark green background
                '!bg-purple-100 dark:!bg-purple-900/80 dark:text-white': voyageDest.voyage?.impoExpo === 'E', // Export (E) - Dark blue background
                'bg-red-100 dark:bg-red-500': voyageDest.deleted_at, // Deleted records handling
              }"
            >
              <td>
                <div class="flex gap-2">
                  <EditButton :item="voyageDest" @click="editVoyageDestination(voyageDest)" />
                  <TrashButton :item="voyageDest" @click="showConfirmDelete" />
                </div>
              </td>
              <td>
                <v-icon v-if="!voyageDest.locked_at" size="small" color="green">mdi-lock-open-variant</v-icon>
                <div v-if="voyageDest.locked_at">
                  <!-- Quitar hasta que se tenga la nueva funcion de permisos -->
                  <v-tooltip :text="voyageDest.locked_at">
                    <template v-slot:activator="{ props }">
                      <v-speed-dial location="bottom center" transition="fade-transition">
                        <template v-slot:activator="{ props: activatorProps }">
                          <v-fab v-bind="activatorProps" size="small" icon="mdi-lock" color="red"></v-fab>
                        </template>

                        <v-alert type="info"> Ya no es necesario desbloquear el destino de un viaje. </v-alert>
                      </v-speed-dial>
                    </template>
                  </v-tooltip>
                </div>
              </td>
              <td>
                <ViewButton :item="voyageDest" @click="viewVessel(voyageDest.voyage?.vessel_id)" />
                {{ voyageDest.voyage?.vessel?.name }} ({{ voyageDest.voyage?.vessel?.line?.commercial_name }})
              </td>
              <td>
                <ViewButton :item="voyageDest" @click="viewVoyage(voyageDest.voyage?.id)" />
                {{ voyageDest.voyage?.name }}
              </td>
              <td>
                <v-chip>{{ voyageDest.voyage?.impoExpo }}</v-chip>
              </td>
              <td>{{ voyageDest.pod?.name }}</td>
              <td>
                <div class="flex flex-col justify-center items-center">
                  <div v-if="!voyageDest.eta_date">
                    <v-chip color="warning">NO ETA</v-chip>
                  </div>
                  <div v-if="voyageDest.eta_date">
                    <v-chip v-if="voyageDest.prev_eta_date" size="small"
                      ><v-icon>mdi-alert-octagon-outline</v-icon
                      >{{ formatDateOnlyString(voyageDest.prev_eta_date) }}</v-chip
                    >
                    <v-chip color="primary" size="small"
                      ><v-icon>mdi-new-box</v-icon>{{ formatDateOnlyString(voyageDest.eta_date) }}</v-chip
                    >
                  </div>
                  <div v-if="voyageDest.eta_date">
                    <v-btn
                      size="small"
                      variant="text"
                      icon="mdi-update"
                      color="blue-lighten-2"
                      @click="changeVoyageDestEtaClick(voyageDest)"
                    ></v-btn>
                  </div>
                </div>
              </td>
              <td>
                <v-chip v-if="voyageDest.arrival_date" size="small" color="secondary">{{
                  voyageDest.arrival_date
                }}</v-chip>
                <v-chip v-if="!voyageDest.arrival_date" size="small" color="warning">TBC</v-chip>
              </td>
              <td>
                <v-btn
                  v-if="voyageDest.voyage?.impoExpo === 'I'"
                  size="small"
                  color="primary"
                  @click="goToNotifyPort(voyageDest)"
                  >Notify Port</v-btn
                >
              </td>
              <td>
                {{ voyageDest.total_references }}
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="voyageDest">
                  {{ formatDateString(voyageDest.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="voyageDestinations.current_page"
          :length="voyageDestinations.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '@/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingStore = useLoadingStore()

const filters = ref<any>({
  text: '',
  vesselName: null,
  lineId: null,
  vesselId: null,
  impoExpo: null,
  voyage: null,
  pod: null,
  etaDate: null,
  arrivalDate: null,
})

const catalogs = ref<any>({
  lines: [],
  voyages: [],
  vessels: [],
  ports: [],
})

const voyageDestinations = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  voyageDestinations.value.current_page = page
  await getVoyages()
}

const onClickFilters = async () => {
  voyageDestinations.value.current_page = 1
  await getVoyages()
}

const showConfirmDelete = async (voyage: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this voyage destination.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      const response = await $api.voyages.deleteDestination(voyage.id)
      snackbar.add({ type: 'success', text: 'Voyage destination deleted' })
      await getVoyages()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const searchPorts = async (search: any) => {
  try {
    // Define the allowed keys you want to search by
    const allowedKeys = ['name', 'id']

    // Create the query object, filtering out any keys not in allowedKeys
    const query = Object.keys(search)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = search[key]
        return obj
      }, {})

    const response = await $api.ports.searchPorts({
      query: query,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching ports',
    })
  }
}

const unlockVoyageDestination = async (voyageDest: any) => {
  try {
    loadingStore.start()
    const response = await $api.voyages.unlockVoyageDestination(voyageDest.id)
    snackbar.add({ type: 'success', text: 'Voyage destination unlocked' })
    await getVoyages()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getVoyages = async () => {
  try {
    loadingStore.start()
    const response = await $api.voyages.getVoyageDestinations({
      query: {
        page: voyageDestinations.value.current_page,
        perPage: voyageDestinations.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    voyageDestinations.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getVoyageCatalogs = async () => {
  const response = await $api.voyages.getFilterCatalogs()

  catalogs.value = response as any
}

const goToNotifyPort = (voyageDest: any) => {
  router.push(`/configuration/voyages/destination-${voyageDest.id}/notify-port`)
}

const viewVessel = (vesselId: any) => {
  router.push(`/configuration/vessels/view-${vesselId}`)
}

const viewVoyage = (voyageId: any) => {
  router.push(`/configuration/voyages/view-${voyageId}`)
}

const editVoyageDestination = (voyageDest: any) => {
  router.push(`/configuration/voyages/destination-${voyageDest.id}`)
}

const changeVoyageDestEtaClick = (voyage: any) => {
  router.push(`/configuration/voyages/destination-${voyage.id}/update-eta`)
}

const clearFilters = async () => {
  filters.value = {
    text: '',
    vesselName: null,
    lineId: null,
    vesselId: null,
    impoExpo: null,
    voyage: '',
    pod: '',
    etaDate: null,
    arrivalDate: null,
  }
  await getVoyages()
}

await getVoyageCatalogs()
await getVoyages()
</script>
