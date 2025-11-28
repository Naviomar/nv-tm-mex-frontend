<template>
  <div>
    <v-card>
      <v-card-title>Support Tickets</v-card-title>
      <v-card-text>
        <div class="mb-4" @keyup.enter="onEnterFilters">
          <div class="grid grid-cols-6 gap-4">
            <div class="col-span-1">
              <v-text-field v-model="filters.id" clearable density="compact" label="# Support ticket" hide-details />
            </div>
            <div class="col-span-2">
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

            <div class="col-span-1">
              <v-autocomplete
                v-model="filters.status"
                :items="[
                  'open',
                  'working',
                  'ready-to-test',
                  'in-observation',
                  'more-info',
                  'closed',
                  'next-phase',
                  'rejected',
                ]"
                label="By status"
                density="compact"
                hide-details
              />
            </div>
            <div class="col-span-3">
              <AUserSearch v-model="filters.created_by" label="User" />
            </div>
            <div class="col-span-1">
              <v-autocomplete
                v-model="filters.priority"
                :items="ticketCatalogs.priorities"
                item-title="name"
                item-value="value"
                label="By priority"
                density="compact"
                hide-details
              />
            </div>
            <div class="col-span-1">
              <v-autocomplete
                v-model="filters.severity"
                :items="ticketCatalogs.severities"
                item-title="name"
                item-value="value"
                label="By severity"
                density="compact"
                hide-details
              />
            </div>
            <div class="col-span-1">
              <v-autocomplete
                v-model="filters.category"
                :items="ticketCatalogs.categories"
                item-title="name"
                item-value="value"
                label="By category"
                density="compact"
                hide-details
              />
            </div>
            <div class="col-span-3">
              <v-autocomplete
                v-model="filters.module"
                :items="ticketCatalogs.modules"
                item-title="name"
                item-value="value"
                label="By module"
                density="compact"
                hide-details
              />
            </div>
          </div>
          <div class="grid grid-cols-1 py-2">
            <div class="flex gap-2">
              <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
              <v-btn color="primary" @click="getSupportTickets"> Search </v-btn>
            </div>
          </div>
        </div>

        <SupportTicketsDashboard />

        <div>
          <v-pagination
            v-model="supportTickets.current_page"
            :length="supportTickets.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          ></v-pagination>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left"></th>
                <th class="text-left">Ticket #</th>
                <th class="text-left">Status</th>
                <th class="text-left">Subject</th>
                <th class="text-left w-64">
                  <div class="flex items-center gap-2">
                    <div>Message</div>
                    <v-icon @click="showDetails">
                      {{ !messageViewer ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </div>
                </th>
                <th class="text-left">Priority</th>
                <th class="text-left">Severity</th>
                <th class="text-left">Category</th>
                <th class="text-left">User</th>
                <th class="text-left">Created at</th>
                <th class="text-left">Updated at</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(ticket, index) in supportTickets.data"
                :key="`support-ticket-${index}`"
                :class="columnClass(ticket)"
                :style="rowStyle(ticket)"
              >
                <td>
                  <div class="flex gap-2">
                    <ViewButton :item="ticket" @click="router.push(`/system/support-tickets/ticket-${ticket.id}`)" />
                    <ButtonColorPicker :item="ticket" @update="(color) => saveTicketColor(color, ticket)" />
                  </div>
                </td>
                <td>#{{ ticket.id }}</td>
                <td>
                  <v-chip :color="ticket.status == 'open' ? 'red' : 'green'" size="small">
                    {{ ticket.status }}
                  </v-chip>
                </td>
                <td class="whitespace-nowrap">{{ ticket.subject }}</td>
                <td class="w-64">
                  <v-tooltip>
                    <template v-slot:activator="{ props }">
                      <span v-if="ticket.total_comments">{{ ticket.total_comments }}</span>
                      <v-icon v-bind="props" class="cursor-pointer">mdi-text</v-icon>
                    </template>
                    <span v-html="ticket.message"></span>
                  </v-tooltip>
                  <div v-if="messageViewer">
                    {{ ticket.message }}
                  </div>
                </td>
                <td class="whitespace-nowrap">{{ ticket.priority }}</td>
                <td class="whitespace-nowrap">{{ ticket.severity }}</td>
                <td class="whitespace-nowrap">{{ ticket.category }}</td>
                <td class="whitespace-nowrap">{{ ticket.creator?.name }}</td>
                <td class="whitespace-nowrap">{{ formatDateString(ticket.created_at) }}</td>
                <td class="whitespace-nowrap">{{ formatDateString(ticket.last_comment_created_at) }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-pagination
            v-model="supportTickets.current_page"
            :length="supportTickets.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          ></v-pagination>

        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ticketCatalogs } from '~/utils/data/systemData'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const loadingStore = useLoadingStore()

const filters = ref<any>({
  text: '',
  startDate: '',
  endDate: '',
  id: '',
  status: '',
  priority: '',
  severity: '',
  category: '',
  module: '',
  created_by: null,
})

const messageViewer = ref(false)

const supportTickets = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const showDetails = () => {
  messageViewer.value = !messageViewer.value
}

const columnClass = (ticket: any) => {
  return {
    '': ticket.deleted_at == null,
    'bg-red-100! dark:bg-red-900!': ticket.deleted_at != null,
  }
}

const rowStyle = (ticket: any) => {
  if (ticket.color) {
    return { backgroundColor: ticket.color }
  }
  return {}
}

const onEnterFilters = async () => {
  // page to 1
  supportTickets.value.current_page = 1
  await getSupportTickets()
}

const onClickPagination = async (page: number) => {
  supportTickets.value.current_page = page
  await getSupportTickets()
}

const saveTicketColor = async (color: any, ticket: any) => {
  // console.log('saveTicketColor', color, ticket)
  if (!color) return
  try {
    const body = {
      color: color,
    }
    await $api.supportTi.saveTicketColor(ticket.id, body)
    ticket.color = color
    snackbar.add({ type: 'success', text: 'Color saved', duration: 1000 })
  } catch (e) {
    console.error(e)
  }
}

const getSupportTickets = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.supportTi.getPaged({
      query: {
        page: supportTickets.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    supportTickets.value = response as any
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
    text: '',
    startDate: '',
    endDate: '',
    id: '',
    status: 'open',
    priority: '',
    severity: '',
    category: '',
    module: '',
    created_by: null,
  }
  await getSupportTickets()
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

  getSupportTickets()
})
</script>
