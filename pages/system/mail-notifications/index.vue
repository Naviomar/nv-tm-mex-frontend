<template>
  <div class="px-4 py-6 w-full max-w-7xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <button
        type="button"
        class="text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 rounded-md px-4 py-1.5 transition-colors border-2 border-zinc-300"
        @click="$router.back()"
      >
        Back
      </button>
      <h1 class="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Mail notifications
      </h1>
    </div>

    <div class="space-y-6">
      <div class="space-y-4">
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-2 space-y-1.5">
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
            <input
              v-model="filters.name"
              type="text"
              class="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
              placeholder="Filter by name"
            />
          </div>
          <div class="col-span-2 space-y-1.5">
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Department</label>
            <select
              v-model="filters.departmentId"
              class="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
            >
              <option :value="null">All</option>
              <option
                v-for="dept in catalogs.departments"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="h-9 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors border-2 border-zinc-300"
            @click="clearFilters"
          >
            Clear
          </button>
          <button
            type="button"
            class="h-9 px-4 text-sm font-medium text-white bg-blue-900  dark:text-black hover:bg-blue-800 rounded-md transition-colors"
            @click="getMailNotifications"
          >
            Search
          </button>
        </div>
      </div>

      <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50">
                <th class="h-10 px-4 text-left font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                <th class="h-10 px-4 text-left font-medium text-zinc-600 dark:text-zinc-400">Departments</th>
                <th class="h-10 px-4 text-left font-medium text-zinc-600 dark:text-zinc-400">Description</th>
                <th class="h-10 px-4 text-left font-medium text-zinc-600 dark:text-zinc-400">Assigned users</th>
                <th class="h-10 px-4 text-left font-medium text-zinc-600 dark:text-zinc-400">Created At</th>
                <th class="h-10 px-4 text-left font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(mailNoty, index) in mailNotys?.data ?? []"
                :key="`mail-noty-${index}`"
                :class="[
                  'border-b border-zinc-100 dark:border-zinc-800/80 transition-colors',
                  mailNoty.deleted_at ? 'bg-red-50/50 dark:bg-red-950/20' : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30'
                ]"
              >
                <td class="px-4 py-3 text-zinc-900 dark:text-zinc-100">{{ mailNoty.short_name }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="(department, dIndex) in mailNoty.departments"
                      :key="`department-${dIndex}`"
                      class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {{ department.name }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{{ mailNoty.description }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{{ mailNoty.users_count }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">{{ formatDateString(mailNoty.created_at) }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <EditButton :item="mailNoty" @click="editMailNoty(mailNoty)" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="mailNotys && mailNotys.last_page > 1" class="mt-6 flex justify-center">
        <div class="inline-flex flex-nowrap items-center gap-1.5 w-max min-w-0 max-w-full overflow-x-auto py-1">
          <button
            type="button"
            class="h-8 shrink-0 rounded-md text-sm font-medium px-3 whitespace-nowrap border border-[#000] bg-transparent text-[#000] hover:bg-[#000] hover:text-[#fff] disabled:opacity-30 disabled:pointer-events-none dark:border-[#fff] dark:text-[#fff] dark:hover:bg-[#fff] dark:hover:text-[#000] dark:disabled:opacity-30 transition-colors"
            :disabled="mailNotys.current_page <= 1"
            aria-label="Previous page"
            @click="onClickPagination(mailNotys.current_page - 1)"
          >
            < Previous
          </button>
          <template v-for="(p, idx) in visiblePages" :key="p === '...' ? `ellipsis-${idx}` : p">
            <button
              v-if="p !== '...'"
              type="button"
              class="h-8 min-w-8 shrink-0 rounded-md text-sm font-medium px-0 inline-flex items-center justify-center whitespace-nowrap border transition-colors"
              :class="p === mailNotys.current_page
                ? 'border-[#000] bg-[#000] text-[#fff] dark:border-[#fff] dark:bg-[#fff] dark:text-[#000]'
                : 'border-[#000] bg-transparent text-[#000] hover:bg-[#000] hover:text-[#fff] dark:border-[#fff] dark:text-[#fff] dark:hover:bg-[#fff] dark:hover:text-[#000]'"
              @click="onClickPagination(p as number)"
            >
              {{ p }}
            </button>
            <span v-else class="shrink-0 px-0.5 text-[#000] dark:text-[#fff]">…</span>
          </template>
          <button
            type="button"
            class="h-8 shrink-0 rounded-md text-sm font-medium px-3 whitespace-nowrap border border-[#000] bg-transparent text-[#000] hover:bg-[#000] hover:text-[#fff] disabled:opacity-30 disabled:pointer-events-none dark:border-[#fff] dark:text-[#fff] dark:bg-transparent dark:hover:bg-[#fff] dark:hover:text-[#000] dark:disabled:opacity-30 transition-colors"
            :disabled="mailNotys.current_page >= mailNotys.last_page"
            aria-label="Next page"
            @click="onClickPagination(mailNotys.current_page + 1)"
          >
            Next >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  title: `Mail notifications Administration`,
  layout: 'default',
})

interface ApiResponse {
  current_page: number
  data: MailNotification[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: Link[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

interface MailNotification {
  id: number
  name: string
  description: string
  created_by: number
  updated_by: number | null
  deleted_by: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  short_name: string
  departments: any[]
  creator: User
  deletor: User | null
  users_count: number;
}

interface User {
  id: number
  name: string
  email: string
  email_verified_at: string
  two_factor_secret: string | null
  two_factor_recovery_codes: string | null
  two_factor_confirmed_at: string | null
  is_active: number
  avatar: string | null
  avatar_config: AvatarConfig
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: number | null
  updated_by: number | null
  avatar_url: string | null
}

interface AvatarConfig {
  eyes: number
  hair: number
  faceHair: number
  bodyColor: number
  backgroundColor: number
}

interface Link {
  url: string | null
  label: string
  active: boolean
}

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref<any>({
  name: '',
  departmentId: null,
})

const catalogs = ref<any>({
  departments: [],
})

const mailNotys = ref<ApiResponse | null>(null)

const visiblePages = computed(() => {
  const data = mailNotys.value
  if (!data || data.last_page <= 1) return []
  const current = data.current_page
  const last = data.last_page
  const delta = 2
  const range: number[] = []
  const rangeWithDots: (number | string)[] = []
  let l: number | undefined
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }
  for (const i of range) {
    if (l !== undefined && i - l > 1) rangeWithDots.push('...')
    rangeWithDots.push(i)
    l = i
  }
  return rangeWithDots
})

const onClickPagination = async (page: number) => {
  if (mailNotys.value) {
    mailNotys.value.current_page = page
  }

  await getMailNotifications()
}

const editMailNoty = async (department: any) => {
  router.push(`/system/mail-notifications/edit-${department.id}`)
}

const getMailNotifications = async () => {
  try {
    loadingStore.start()
    const response = await $api.mailNotifications.getMailNotifications({
      query: {
        page: mailNotys.value?.current_page,
        perPage: mailNotys.value?.per_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    mailNotys.value = response as ApiResponse
    console.log('mailNotys', mailNotys.value)
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
    departmentId: null,
  }
  await getMailNotifications()
}

const getCatalogs = async () => {
  try {
    const response = await $api.mailNotifications.getCatalogs()
    catalogs.value = response
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  await getCatalogs()
  await getMailNotifications()
})
</script>