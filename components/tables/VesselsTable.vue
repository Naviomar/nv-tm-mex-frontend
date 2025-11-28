<template>
  <div>
    <v-card>
      <v-card-title> Vessels with freight line </v-card-title>
      <v-card-text>
        <div class="mb-2" @keyup.enter="onClickFilters">
          <div class="grid grid-cols-6 gap-4">
            <div class="col-span-3">
              <v-text-field v-model="filters.name" density="compact" label="Name" />
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
          <div class="grid grid-cols-1">
            <div class="flex gap-2">
              <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
              <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
            </div>
          </div>
        </div>
        <div class="py-2">
          <v-btn color="green" size="small" variant="tonal" to="/configuration/vessels/add">
            Add vessel with freight line
          </v-btn>
        </div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Line</th>
              <th class="text-left">Vessel</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(vessel, index) in vessels.data"
              :key="`vessel-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': vessel.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="vessel" @click="viewVessel(vessel)" />
                  <EditButton :item="vessel" @click="showWarningVesselEdit(vessel)" />
                  <TrashButton :item="vessel" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ vessel.line?.commercial_name }}</td>
              <td>{{ vessel.name }}</td>
              <td>
                <UserInfoBadge :item="vessel">
                  {{ formatDateString(vessel.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="vessels.current_page"
          :length="vessels.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
    <v-dialog v-model="showWarningEdit" max-width="500" persistent>
      <v-card>
        <v-card-title>Warning edit Vessel</v-card-title>
        <v-card-text>
          Por favor, tenga en cuenta que al editar el nombre del buque, se espera que esta acción sea realizada
          únicamente para corregir errores tipográficos. El nombre del buque se utiliza en otros contextos de referencia
        </v-card-text>
        <v-card-actions>
          <div class="grow"></div>
          <v-btn color="error" @click="closeWarningEdit">Cancel</v-btn>
          <v-btn color="success" @click="acceptMessageWarningEditVessel">Accept</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '~/utils/data/systemData'
import { formatDateString } from '~~/utils/formatters'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const showWarningEdit = ref(false)
const vesselSelected = ref(null)

const filters = ref({
  name: '',
  deleted_status: null,
})

const vessels = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  vessels.value.current_page = page
  await getVessels()
}

const onClickFilters = async () => {
  vessels.value.current_page = 1
  await getVessels()
}

const closeWarningEdit = () => {
  showWarningEdit.value = false
}

const showConfirmDelete = async (vessel: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this vessel.',
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
      loadingStore.loading = true
      const response = await $api.vessels.delete(vessel.id)
      snackbar.add({ type: 'success', text: 'Vessel deleted' })
      await getVessels()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getVessels = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.vessels.getVessels({
      query: {
        page: vessels.value.current_page,
        perPage: vessels.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    vessels.value = response as any
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

const showWarningVesselEdit = (vessel: any) => {
  showWarningEdit.value = true
  vesselSelected.value = vessel
}
const viewVessel = (vessel: any) => {
  router.push(`/configuration/vessels/view-${vessel.id}`)
}
const acceptMessageWarningEditVessel = () => {
  const vessel = vesselSelected.value as any
  if (vessel) router.push(`/configuration/vessels/edit-${vessel.id}`)
}

const clearFilters = async () => {
  filters.value = {
    name: '',
    deleted_status: null,
  }
  await getVessels()
}

onMounted(async () => {
  await getVessels()
})
</script>
