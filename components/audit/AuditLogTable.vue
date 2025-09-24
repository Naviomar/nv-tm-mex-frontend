<template>
  <div>
    <v-card>
      <v-card-title>Audit Logs</v-card-title>
      <v-card-text>
        <div class="mb-4" @keyup.enter="onEnterFilters">
          <div class="grid grid-cols-6 gap-4">
            <div v-if="false" class="col-span-1">
              <v-autocomplete
                v-model="filters.country"
                clearable
                :items="[
                  { value: 'mex', text: 'Mexico' },
                  { value: 'chl', text: 'Chile' },
                ]"
                item-value="value"
                item-title="text"
                density="compact"
                label="System country"
                hide-details
              />
            </div>
            <div class="col-span-1">
              <v-text-field v-model="filters.id" clearable density="compact" label="# ID" hide-details />
            </div>
            <div v-if="false" class="col-span-2">
              <v-text-field v-model="filters.text" clearable density="compact" label="Search in text" hide-details />
            </div>
            <div class="col-span-1">
              <v-text-field
                v-model="filters.startDate"
                clearable
                type="date"
                density="compact"
                label="Start date"
                hide-details
              />
            </div>
            <div class="col-span-1">
              <v-text-field
                v-model="filters.endDate"
                clearable
                type="date"
                density="compact"
                label="End date"
                hide-details
              />
            </div>

            <div class="col-span-3">
              <AUserSearch v-model="filters.user_id" label="User" />
            </div>
          </div>
          <div class="grid grid-cols-1 py-2">
            <div class="flex gap-2">
              <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
              <v-btn color="primary" @click="getAuditLogs"> Search </v-btn>
            </div>
          </div>
        </div>

        <div>
          <v-pagination
            v-model="audits.current_page"
            :length="audits.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          ></v-pagination>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left"></th>
                <th class="text-left">#</th>
                <th class="text-left">Country</th>
                <th class="text-left">Auditable</th>
                <th class="text-left">Event</th>
                <th class="text-left">Executed by</th>
                <th class="text-left">URL</th>
                <th class="text-left">Tags</th>
                <th class="text-left">Created at</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(audit, index) in audits.data" :key="`audit-${index}`">
                <td>
                  <div class="flex gap-2">
                    <ViewButton :item="audit" @click="showDiff(audit)" />
                  </div>
                </td>
                <td>#{{ audit.id }}</td>
                <td class="whitespace-nowrap">
                  <v-img
                    v-if="audit.country === 'mex'"
                    src="https://flagcdn.com/mx.svg"
                    width="32"
                    height="32"
                    class="inline-block ml-2"
                  />
                  <v-img
                    v-if="audit.country === 'chl'"
                    src="https://flagcdn.com/cl.svg"
                    width="32"
                    height="32"
                    class="inline-block ml-2"
                  />
                </td>
                <td class="whitespace-nowrap">
                  <div class="font-bold text-sm">
                    {{ getAuditableName(audit) }}
                  </div>
                  <span class="text-[8px]">{{ audit.auditable_type }} - {{ audit.auditable_id }}</span>
                </td>

                <td class="whitespace-nowrap">
                  <span class="text-xs">{{ audit.event }}</span>
                </td>

                <td class="whitespace-nowrap">
                  {{ audit.user?.name }}
                </td>

                <td class="whitespace-nowrap">
                  <span class="text-xs">{{ audit.url }}</span>
                </td>
                <td class="whitespace-nowrap">
                  <span class="text-xs">{{ audit.tags }}</span>
                </td>
                <td class="whitespace-nowrap">{{ formatDateString(audit.created_at) }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-pagination
            v-model="audits.current_page"
            :length="audits.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          ></v-pagination>

        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="diffDialog.show">
      <v-card>
        <v-card-title class="text-lg font-bold">Audit Diff</v-card-title>
        <v-card-text>
          <AuditDiff
            :auditable="diffDialog.audit.auditable_type"
            :old-values="diffDialog.audit.old_values"
            :new-values="diffDialog.audit.new_values"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeDiffDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const loadingStore = useLoadingStore()

const filters = ref<any>({
  id: '',
  country: '',
  text: '',
  startDate: '',
  endDate: '',
  created_by: null,
})

const audits = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const diffDialog = ref({
  show: false,
  audit: {
    auditable_type: '',
    old_values: {},
    new_values: {},
  },
})

const showDiff = (audit: any) => {
  diffDialog.value.audit = audit
  diffDialog.value.show = true
}

const closeDiffDialog = () => {
  diffDialog.value.show = false
  diffDialog.value.audit = {
    old_values: {},
    new_values: {},
    auditable_type: '',
  }
}

const getAuditableName = (audit: any) => {
  if (audit.auditable_name === 'User') {
    return audit.auditable?.name || 'Unknown User'
  } else if (audit.auditable_name === 'Role') {
    return 'Role'
  } else if (audit.auditable_name === 'Permission') {
    return 'Permission'
  }
  if (audit.auditable_name === 'Department') {
    return audit.auditable?.name || 'Unknown Department'
  }
  return 'auditable_name not found'
}

const onEnterFilters = async () => {
  // page to 1
  audits.value.current_page = 1
  await getAuditLogs()
}

const onClickPagination = async (page: number) => {
  audits.value.current_page = page
  await getAuditLogs()
}

const getAuditLogs = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.audit.getPaged({
      query: {
        page: audits.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    audits.value = response as any
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
    id: '',
    country: '',
    text: '',
    startDate: '',
    endDate: '',
    created_by: null,
  }
  await getAuditLogs()
}

watch(
  filters,
  (newFilters) => {
    router.push({
      query: {
        ...route.query,
        ...newFilters,
      },
    })
  },
  { deep: true }
)

onMounted(() => {
  const queryFilters = route.query
  Object.keys(filters.value).forEach((key) => {
    if (queryFilters[key]) {
      const value: any = queryFilters[key]
      // Check if it's a number (without leading zeros)
      filters.value[key] = /^\d+$/.test(value) ? Number(value) : value
    }
  })

  getAuditLogs()
})
</script>
