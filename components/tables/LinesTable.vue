<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-3">
        <div class="col-span-2">
          <v-text-field density="compact" label="Name" v-model="filters.name" />
        </div>
        <div class="col-span-1">
          <v-text-field density="compact" label="Commercial Name" v-model="filters.commercial" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.country"
            label="Countries"
            :items="countries.data"
            item-title="name"
            density="compact"
          ></v-autocomplete>
        </div>
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Type"
            v-model="filters.line_type"
            :items="[
              { value: 'line', name: 'Freight Lines' },
              { value: 'agent', name: 'Freight Agents' },
            ]"
            item-title="name"
            item-value="value"
            hide-details
          />
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
          v-model="lines.current_page"
          :length="lines.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Type</th>
              <th class="text-left">Name</th>
              <th class="text-left">Commercial name</th>
              <th class="text-left">Code</th>
              <th class="text-left">Country</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(line, index) in lines.data" :key="`line-${index}`" :class="{ 'deleted-row': line.deleted_at }">
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="line" @click="viewLine(line)" />
                  <EditButton :item="line" @click="editLine(line)" />
                  <TrashButton :item="line" @click="showConfirmDelete" />
                </div>
              </td>
              <td class="whitespace-nowrap">
                <div v-if="line.line_type === 'agent'">
                  <v-icon color="primary" class="mr-2">mdi-face-agent</v-icon>
                </div>
                <div v-else>
                  <v-icon color="orange" class="mr-2">mdi-ferry</v-icon>
                </div>
                {{ line.type }}
              </td>
              <td>{{ line.name }}</td>
              <td>{{ line.commercial_name }}</td>
              <td>{{ line.code }}</td>
              <td>{{ line.country?.name }}</td>
              <td>
                <UserInfoBadge :item="line">
                  {{ formatDateString(line.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="lines.current_page"
          :length="lines.last_page"
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
  commercial: '',
  country: '',
  line_type: null,
  deleted_status: null,
})

const lines = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const countries = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  lines.value.current_page = page
  await getLines()
}

const onClickFilters = async () => {
  // set current page to 1
  lines.value.current_page = 1
  await getLines()
}

const editLine = (line: any) => {
  router.push(`/configuration/lines/edit-${line.id}`)
}

const viewLine = (line: any) => {
  router.push(`/configuration/lines/view-${line.id}`)
}

const showConfirmDelete = async (line: any) => {
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
      const response = await $api.lines.delete(line.id)
      snackbar.add({ type: 'success', text: 'Line deleted' })
      await getLines()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getLines = async () => {
  try {
    loadingStore.start()
    const response = await $api.lines.getLines({
      query: {
        page: lines.value.current_page,
        perPage: lines.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    lines.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const viewLineForm = async (line: any) => {
  router.push(`/configuration/lines/${line.id}`)
}

const getCountries = async () => {
  try {
    loadingStore.start()
    const response = await $api.countries.getAll({
      query: {
        page: countries.value.current_page,
        perPage: countries.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    countries.value.data = response as any
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
    commercial: '',
    country: '',
    line_type: null,
    deleted_status: null,
  }
  await getLines()
}

onMounted(async () => {
  await getCountries()
  await getLines()
})
</script>
