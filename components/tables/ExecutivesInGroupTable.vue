<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field v-model="filters.name" density="compact" label="Name" />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getExecutivesInAGroup"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Name Executive</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(executiveGroup, index) in groupsExecutives"
              :key="`executivegroup-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': executiveGroup.deleted_at }"
            >
              <td>{{ executiveGroup.name }}</td>
              <td>{{ formatDateString(executiveGroup.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import Id from '~/pages/configuration/freight-forwarders/groups/[id].vue'

const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const route = useRoute()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const id = route.params.id!.toString()

const filters = ref({
  name: '',
})

const groupsExecutives = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const viewExecutiveGroup = async (executiveGroup: any) => {
  router.push(`/configuration/executives/groups/${executiveGroup.id}`)
}

const onClickFilters = async () => {
  // set current page to 1
  groupsExecutives.value.current_page = 1
  await getExecutivesInAGroup()
}

const onClickPagination = async (page: number) => {
  groupsExecutives.value.current_page = page
  await getExecutivesInAGroup()
}

const showConfirmDelete = async (executiveGroup: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this executive group.',
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
      const response = await $api.executivesGroups.delete(executiveGroup.id)
      snackbar.add({ type: 'success', text: 'Executive group deleted' })

      await getExecutivesInAGroup()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getExecutivesInAGroup = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.executivesGroups.getExecutivesInAGroup(id, {
      query: {
        page: groupsExecutives.value.current_page,
        perPage: groupsExecutives.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    groupsExecutives.value = response as any
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

await getExecutivesInAGroup()

const clearFilters = async () => {
  filters.value = {
    name: '',
  }
  await getExecutivesInAGroup()
}
</script>
