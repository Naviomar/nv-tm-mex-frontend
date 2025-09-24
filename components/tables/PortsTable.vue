<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-2">
        <div class="">
          <ACountrySearch v-model="filters.country_id" />
        </div>
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
    <v-card>
      <v-card-text>
        <div class="text-xs">Showing {{ ports.from }} to {{ ports.to }} from {{ ports.total }} total records</div>
        <v-pagination
          v-model="ports.current_page"
          :length="ports.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Country</th>
              <th class="text-left">Port name</th>
              <th class="text-left">Port ISO code</th>
              <th class="text-left">City</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(port, index) in ports.data"
              :key="`port-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': port.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="port" @click="viewPort(port)" />
                  <EditButton :item="port" @click="editPort(port)" />
                  <TrashButton :item="port" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ port.country?.name }}</td>
              <td>{{ port.name }}</td>
              <td>{{ port.code }}</td>
              <td>{{ port.city }}</td>
              <td>
                <UserInfoBadge :item="port">
                  {{ formatDateString(port.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="ports.current_page"
          :length="ports.last_page"
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
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const router = useRouter()

const filters = ref<any>({
  name: '',
  deleted_status: null,
})

const ports = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickFilters = async () => {
  ports.value.current_page = 1
  await getPorts()
}

const onClickPagination = async (page: number) => {
  ports.value.current_page = page
  await getPorts()
}

const viewPort = (port: any) => {
  router.push(`/configuration/ports/view-${port.id}`)
}

const editPort = async (port: any) => {
  router.push(`/configuration/ports/edit-${port.id}`)
}

const showConfirmDelete = async (port: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or restore this port.',
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
      const response = await $api.ports.delete(port.id)
      snackbar.add({ type: 'success', text: 'Port deleted' })
      await getPorts()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getPorts = async () => {
  try {
    loadingStore.start()
    const response = await $api.ports.getPorts({
      query: {
        page: ports.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    ports.value = response as any
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
    name: '',
    deleted_status: null,
  }
  await getPorts()
}

onMounted(async () => {
  await getPorts()
})
</script>
