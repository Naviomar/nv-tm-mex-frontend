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
          <v-btn color="primary" @click="getGroupsExecutives"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name Group</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(executiveGroup, index) in groupsExecutives.data" :key="`executivegroup-${index}`">
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="executiveGroup" @click="viewExecutiveGroup(executiveGroup)" />
                  <TrashButton :item="executiveGroup" @click="showConfirmDelete(executiveGroup)" />
                </div>
              </td>
              <td>{{ executiveGroup.name }}</td>
              <td>{{ formatDateString(executiveGroup.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="groupsExecutives.current_page"
          :length="groupsExecutives.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

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
  await getGroupsExecutives()
}

const onClickPagination = async (page: number) => {
  groupsExecutives.value.current_page = page
  await getGroupsExecutives()
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
      await getGroupsExecutives()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getGroupsExecutives = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.executivesGroups.getExecutivesGroups({
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

await getGroupsExecutives()

const clearFilters = async () => {
  filters.value = {
    name: '',
  }
  await getGroupsExecutives()
}
</script>
