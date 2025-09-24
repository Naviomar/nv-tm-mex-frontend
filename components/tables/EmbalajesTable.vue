<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-2">
        <div class="col-span-3">
          <v-text-field density="compact" label="Name" v-model="filters.name" />
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
        <v-pagination
          v-model="embalajes.current_page"
          :length="embalajes.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Code</th>
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(embalaje, index) in embalajes.data"
              :key="`embalaje-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': embalaje.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="embalaje" @click="viewEmbalaje(embalaje)" />
                  <EditButton :item="embalaje" @click="editEmbalaje(embalaje)" />
                  <TrashButton :item="embalaje" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ embalaje.name }}</td>
              <td>{{ embalaje.code }}</td>
              <td>
                <UserInfoBadge :item="embalaje">
                  {{ formatDateString(embalaje.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="embalajes.current_page"
          :length="embalajes.last_page"
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
  name: '',
  deleted_status: null,
})

const embalajes = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  embalajes.value.current_page = page
  await getEmbalajes()
}

const onClickFilters = async () => {
  // set current page to 1
  embalajes.value.current_page = 1
  await getEmbalajes()
}

const editEmbalaje = (embalaje: any) => {
  router.push(`/configuration/embalajes/edit-${embalaje.id}`)
}

const viewEmbalaje = (embalaje: any) => {
  router.push(`/configuration/embalajes/view-${embalaje.id}`)
}

const showConfirmDelete = async (embalaje: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or restore it.',
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
      const response = await $api.embalajes.delete(embalaje.id)
      snackbar.add({ type: 'success', text: 'Embalaje deleted' })
      await getEmbalajes()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getEmbalajes = async () => {
  try {
    loadingStore.start()
    const response = await $api.embalajes.getEmbalajes({
      query: {
        page: embalajes.value.current_page,
        perPage: embalajes.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    embalajes.value = response as any
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
  await getEmbalajes()
}

onMounted(async () => {
  await getEmbalajes()
})
</script>
