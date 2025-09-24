<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-2">
        <div class="col-span-3">
          <v-text-field density="compact" label="Name" v-model="filters.name" @keyup.enter="getExecutives" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            @keyup.enter="getExecutives"
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
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Name group</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(executive, index) in executives.data"
              :key="`executive-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': executive.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="executive" @click="viewExecutive(executive)" />
                  <EditButton :item="executive" @click="editExecutive(executive)" />
                  <TrashButton :item="executive" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ executive.name }}</td>
              <td>
                <span>
                  {{ executive.executive_group ? executive.executive_group.name : 'Not assigned' }}
                </span>
              </td>
              <td>
                <UserInfoBadge :item="executive">
                  {{ formatDateString(executive.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="executives.current_page"
          :length="executives.last_page"
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
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref<any>({
  name: '',
})

const executives = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  executives.value.current_page = page
  await getExecutives()
}

const onClickFilters = async () => {
  // set current page to 1
  executives.value.current_page = 1
  await getExecutives()
}

const viewExecutive = (executive: any) => {
  router.push(`/configuration/executives/view-${executive.id}`)
}

const editExecutive = async (executive: any) => {
  router.push(`/configuration/executives/edit-${executive.id}`)
}

const showConfirmDelete = async (executive: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or restore this executive.',
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
      const response = await $api.executives.delete(executive.id)
      snackbar.add({ type: 'success', text: 'Executive deleted' })
      await getExecutives()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getExecutives = async () => {
  try {
    loadingStore.start()
    const response = await $api.executives.getExecutives({
      query: {
        page: executives.value.current_page,
        perPage: executives.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    executives.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getExecutives()

const clearFilters = async () => {
  filters.value = {
    name: '',
  }
  await getExecutives()
}
</script>
