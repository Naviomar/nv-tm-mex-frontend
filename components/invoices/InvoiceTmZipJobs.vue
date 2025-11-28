<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <v-text-field v-model="filters.from" type="date" density="compact" label="Date from" />
        </div>
        <div>
          <v-text-field v-model="filters.to" type="date" density="compact" label="Date to" />
        </div>
        <div>
          <v-autocomplete
            v-model="filters.completed"
            density="compact"
            label="Process"
            clearable
            :items="[
              { value: 'yes', name: 'Completed' },
              { value: 'no', name: 'Pending' },
            ]"
            item-title="name"
            item-value="value"
          />
        </div>
      </div>
      <div class="flex gap-2">
        <v-btn color="secondary" density="compact" @click="clearFilters"> Clear </v-btn>
        <v-btn color="primary" density="compact" @click="onClickFilters"> Search </v-btn>
      </div>
    </div>
    <div>
      <v-pagination
        v-model="tmJobs.current_page"
        :length="tmJobs.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th class="text-left">Actions</th>
            <th class="text-left">Job #</th>
            <th class="text-left">Processed</th>
            <th class="text-left">ZIP file</th>
            <th class="text-left">Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tmJobs.data.length === 0">
            <td colspan="6" class="text-center">No data found</td>
          </tr>
          <tr v-for="(tmjob, index) in tmJobs.data" :key="`inv-job-${index}`" class="">
            <td>
              <div class="flex gap-2">
                <ViewButton :item="tmjob" @click="viewTmJob(tmjob)" />
              </div>
            </td>
            <td>
              {{ tmjob.id }}
            </td>
            <td>
              <div v-if="tmjob.completed === 0">
                <v-chip size="small" color="warning"> Pending </v-chip>
              </div>
              <div v-if="tmjob.completed === 1">
                <v-chip size="small" color="success"> Completed </v-chip>
              </div>
            </td>
            <td>
              <div>
                <ButtonDownloadS3Object2 :s3Path="tmjob.route" label="Download ZIP" />
              </div>
            </td>
            <td>
              <UserInfoBadge :item="tmjob">
                {{ formatDateString(tmjob.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="tmJobs.current_page"
        :length="tmJobs.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref({
  from: '',
  to: '',
  completed: null,
})
const tmJobs = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  last_page: 1,
})

const clearFilters = async () => {
  filters.value = {
    from: '',
    to: '',
    completed: null,
  }
  getData()
}

const onClickFilters = async () => {
  // set current page to 1
  tmJobs.value.current_page = 1
  await getData()
}

const onClickPagination = async (page: number) => {
  tmJobs.value.current_page = page
  await getData()
}

const viewTmJob = (tmJob: any) => {
  router.push(`/adminpack/zip-file-jobs/view-tm-job-${tmJob.id}`)
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.invoices.getInvoiceTmZipJobs({
      query: {
        page: tmJobs.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    tmJobs.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()
</script>
