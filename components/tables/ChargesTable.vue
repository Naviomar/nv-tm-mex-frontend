<template>
  <div>
    <v-form @keyup.enter="onClickFilters">
      <div class="mb-4">
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-1">
            <v-autocomplete
              v-model="filters.serviceTypes"
              variant="filled"
              density="compact"
              label="Service type"
              :items="serviceTypes"
              item-title="name"
              item-value="id"
              multiple
            />
          </div>
          <div class="col-span-3">
            <v-text-field v-model="filters.name" variant="filled" density="compact" label="Name" />
          </div>
          <div class="col-span-2">
            <v-autocomplete
              density="compact"
              label="Status"
              v-model="filters.deleted_status"
              :items="deletedStatus"
              item-title="name"
              item-value="value"
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
    </v-form>
    <v-card>
      <v-card-text>
        <div v-if="isAdmin">
          <v-btn size="x-small" color="primary" @click="seedCharges"> Seed charges </v-btn>
        </div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Entity</th>
              <th class="text-left">Service(s)</th>
              <th class="text-left">Name</th>
              <th class="text-left">Code</th>
              <th class="text-left">Can be deleted?</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(charge, index) in charges.data"
              :key="`charge-global-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': charge.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="charge" @click="viewCharge(charge)" />
                  <EditButton :item="charge" @click="editCharge(charge)" />
                  <TrashButton :item="charge" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ charge.charge_entity?.name }}</td>
              <td>
                <div class="flex flex-col gap-2 mb-2">
                  <v-chip
                    v-for="(service, index) in charge.services"
                    :key="`service-${index}`"
                    color="primary"
                    variant="flat"
                    size="small"
                  >
                    {{ service.name }} {{ service.pivot?.is_import ? '(Import)' : '' }}
                    {{ service.pivot?.is_export ? '(Export)' : '' }}
                  </v-chip>
                </div>
              </td>
              <td>{{ charge.name }}</td>
              <td>{{ charge.code }}</td>
              <td>
                <v-chip
                  :color="charge.can_be_deleted ? 'success' : 'error'"
                  size="small"
                  variant="outlined"
                  class="text-xs"
                >
                  {{ charge.can_be_deleted == 1 ? 'Yes' : 'No' }}
                </v-chip>
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="charge">
                  {{ formatDateString(charge.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="charges.current_page"
          :length="charges.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { serviceTypes, deletedStatus } from '@/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const user = useSanctumUser<any>()

const filters = ref({
  name: '',
  serviceTypes: null,
  deleted_status: '',
})

const charges = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const isAdmin = user.value?.id === 1

const onClickPagination = async (page: number) => {
  charges.value.current_page = page
  await getCharges()
}

const viewCharge = (charge: any) => {
  router.push(`/configuration/charges/view-${charge.id}`)
}

const editCharge = (charge: any) => {
  router.push(`/configuration/charges/edit-${charge.id}`)
}

const showConfirmDelete = async (charge: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this charge.',
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
      const response = await $api.charges.delete(charge.id)
      snackbar.add({ type: 'success', text: 'Charge deleted successfully' })
      await getCharges()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const onClickFilters = async () => {
  charges.value.current_page = 1
  await getCharges()
}

const getCharges = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.charges.getCharges({
      query: {
        page: charges.value.current_page,
        perPage: charges.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    charges.value = response as any
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

const clearFilters = async () => {
  filters.value = {
    name: '',
    serviceTypes: null,
    deleted_status: '',
  }
  await getCharges()
}

const seedCharges = async () => {
  try {
    loadingStore.start()
    const response = await $api.charges.seedCharges()
    snackbar.add({ type: 'success', text: 'Charges seeded successfully' })
    await getCharges()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getCharges()
})
</script>
