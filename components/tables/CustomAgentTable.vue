<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-2">
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
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Patente</th>
              <th class="text-left">Agencia</th>
              <th class="text-left">Ports</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in customAgents.data"
              :key="`customagent-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': item.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="item" @click="viewCustomAgent(item)" />
                  <EditButton :item="item" @click="editCustomAgent(item)" />
                  <TrashButton :item="item" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.patente }}</td>
              <td>{{ item.agencia }}</td>
              <td>
                <div v-for="(port, ci) in item.ports" :key="`ca-${index}-port-${ci}`" class="mb-1">
                  <v-chip size="small">{{ port?.name }}</v-chip>
                </div>
              </td>
              <td>
                <UserInfoBadge :item="item">
                  {{ formatDateString(item.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="customAgents.current_page"
          :length="customAgents.last_page"
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

const filters = ref({
  name: '',
  deleted_status: null,
})

const customAgents = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  customAgents.value.current_page = page
  await getCustomAgents()
}

const onClickFilters = async () => {
  // set current page to 1
  customAgents.value.current_page = 1
  await getCustomAgents()
}

const editCustomAgent = (customagent: any) => {
  router.push(`/configuration/custom-agents/edit-${customagent.id}`)
}

const viewCustomAgent = (customagent: any) => {
  router.push(`/configuration/custom-agents/view-${customagent.id}`)
}

const showConfirmDelete = async (customagent: any) => {
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
      const response = await $api.customAgents.delete(customagent.id)
      snackbar.add({ type: 'success', text: 'Customs agent deleted' })
      await getCustomAgents()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getCustomAgents = async () => {
  try {
    loadingStore.start()
    const response = await $api.customAgents.getCustomAgents({
      query: {
        page: customAgents.value.current_page,
        perPage: customAgents.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    customAgents.value = response as any
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
  await getCustomAgents()
}

onMounted(async () => {
  await getCustomAgents()
})
</script>
