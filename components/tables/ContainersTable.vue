<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-2">
          <v-text-field v-model="filters.name" density="compact" label="Name" @keyup.enter="getContainers" />
        </div>
        <v-autocomplete
          v-model="filters.isRefrigerated"
          density="compact"
          :items="[
            { text: 'Yes', value: 1 },
            { text: 'No', value: 0 },
          ]"
          item-title="text"
          item-value="value"
          label="is reefer?"
        />

        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            @keyup.enter="getContainers"
            hide-details
          />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getContainers"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Code</th>
              <th class="text-left">Teus</th>
              <th class="text-left">is reefer?</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(container, index) in containers.data"
              :key="`container-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': container.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="container" @click="viewContainer(container)" />
                  <EditButton :item="container" @click="editContainer(container)" />
                  <TrashButton :item="container" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ container.name }}</td>
              <td>{{ container.code }}</td>
              <td>{{ container.teus }}</td>
              <td>{{ container.is_reefer === 1 ? 'Yes' : 'No' }}</td>
              <td>
                <UserInfoBadge :item="container">
                  {{ formatDateString(container.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="containers.current_page"
          :length="containers.last_page"
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

const filters = ref({
  name: '',
  isRefrigerated: null,
  deleted_status: null,
})

const containers = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  containers.value.current_page = page
  await getContainers()
}

const editContainer = (container: any) => {
  router.push(`/configuration/containers/edit-${container.id}`)
}

const viewContainer = (container: any) => {
  router.push(`/configuration/containers/view-${container.id}`)
}

const showConfirmDelete = async (container: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this container.',
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
      const response = await $api.containers.delete(container.id)
      snackbar.add({ type: 'success', text: 'Container updated' })
      await getContainers()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getContainers = async () => {
  try {
    loadingStore.start()
    const response = await $api.containers.getContainers({
      query: {
        page: containers.value.current_page,
        perPage: containers.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    containers.value = response as any
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
    isRefrigerated: null,
    deleted_status: null,
  }
  await getContainers()
}

onMounted(async () => {
  await getContainers()
})
</script>
