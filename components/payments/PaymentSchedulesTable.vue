<template>
  <div>
    <v-card>
      <v-card-title>
        <h1 class="text-xl font-bold">BL Payment release history</h1>
      </v-card-title>
      <v-card-text>
        <div class="mb-4" @keyup.enter="onClickFilters">
          <div class="grid grid-cols-6 gap-4">
            <div class="col-span-2">
              <v-text-field v-model="filters.id" clearable density="compact" label="Search by folio" />
            </div>
            <div class="col-span-2">
              <AGlobalSearch :onSearch="searchLines" v-model="filters.lineId" label="Freight line *" />
            </div>
          </div>
          <div class="grid grid-cols-1">
            <div class="flex gap-2">
              <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
              <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
            </div>
          </div>
        </div>

        <div v-show="schedulesSelectedEmail.length > 0" class="grid grid-cols-2">
          <div>
            <div>Add emails separated by coma for selected schedule payments.</div>
            <v-textarea v-model="form.emails" label="Emails" rows="2" placeholder="Enter emails separated by comma" />
            <v-btn color="primary" @click="sendEmailForSelected">Send email for selected</v-btn>
          </div>
        </div>

        <v-pagination
          v-model="schedules.current_page"
          :length="schedules.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>

        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Email</th>
              <th class="text-left">Excel</th>
              <th class="text-left">Folio</th>
              <th class="text-left">Line</th>
              <th class="text-left">Bank Info</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Linked Ref(s)</th>
              <th class="text-left">Date added</th>
              <th class="text-left">Sent at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(schedule, index) in schedules.data" :key="`pay-schedule-${index}`">
              <td>
                <div v-if="schedule.sent_at == null">
                  <v-checkbox v-if="false" v-model="schedule.send_email" density="compact" hide-details />
                </div>
                <v-btn color="primary" size="small" @click="showNotyForm(schedule)">
                  <v-icon>mdi-email</v-icon> Send notification
                </v-btn>
              </td>
              <td>
                <v-btn color="grey-lighten-2" size="small" @click="downloadExcel(schedule.id)">
                  <v-icon color="black">mdi-file-excel</v-icon>
                </v-btn>
              </td>
              <td>
                <v-btn color="blue-lighten-4" size="small" @click="showScheduleDetail(schedule)">
                  <v-icon>mdi-eye-outline</v-icon>
                  #{{ schedule.id }}
                </v-btn>
              </td>
              <td>{{ schedule.line?.name }}</td>
              <td>
                <div v-if="schedule.bank_json">
                  <div class="text-sm">
                    <div class="font-bold">{{ schedule.bank_json.name }}</div>
                    <div v-if="schedule.bank_json.iban">IBAN: {{ schedule.bank_json.iban }}</div>
                    <div v-if="schedule.bank_json.clabe">CLABE: {{ schedule.bank_json.clabe }}</div>
                    <div v-if="schedule.bank_json.account_number">
                      Account Number: {{ schedule.bank_json.account_number }}
                    </div>
                  </div>
                </div>
                <div v-else class="text-red-500">No bank info</div>
              </td>
              <td class="whitespace-nowrap">
                {{ getCurrencyName(schedule.currency_id) }} {{ formatToCurrency(schedule.refs_total_amount) }}
              </td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <v-chip
                    v-for="(ref, index) in schedule.schedule_refs"
                    size="small"
                    :key="`sched-ref-${index}`"
                    @click="showNewTabRef(ref)"
                  >
                    <v-icon>mdi-open-in-new</v-icon>{{ ref.referencia?.reference_number }}
                  </v-chip>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="schedule">
                  {{ formatDateString(schedule.created_at) }}
                </UserInfoBadge>
              </td>
              <td class="whitespace-nowrap">{{ schedule.sent_at ? formatDateString(schedule.sent_at) : 'Pending' }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="schedules.current_page"
          :length="schedules.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
    <v-dialog v-model="showDetail.showDialog" max-width="800">
      <v-card>
        <v-card-title>
          <h1 class="text-xl font-bold">Payment schedule detail #{{ showDetail.schedule.id }}</h1>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-3 gap-2">
            <div class="font-bold"># Ref</div>
            <div class="font-bold">MBL</div>
            <div class="font-bold">Amount</div>
          </div>
          <div
            v-for="(ref, index) in showDetail.schedule.schedule_refs"
            class="grid grid-cols-3 gap-2"
            :key="`sched-${index}`"
          >
            <div>{{ ref.referencia?.reference_number }}</div>
            <div>{{ ref.ref_master_bl?.name }}</div>
            <div>{{ formatToCurrency(ref.amount) }}</div>
          </div>
          <div class="flex justify-end gap-2">
            <v-btn color="primary" @click="closeScheduleDetail"> Close </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="notyDialog.showDialog" max-width="800">
      <v-card>
        <v-card-title>
          <h1 class="text-xl font-bold">Send notification for schedule #{{ notyDialog.schedule.id }}</h1>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 gap-2">
            <v-autocomplete
              v-model="form.user"
              :items="usersStore.getUsers"
              item-title="name"
              item-value="id"
              return-object
              density="compact"
              label="Select users to notify"
              color="amber"
              clearable
              hide-details
              @update:model-value="addEmailToList"
            />
            <div class="font-bold">Emails to notify</div>
            <v-textarea
              v-model="form.emails"
              label="Emails comma separated"
              rows="2"
              placeholder="Enter emails separated by comma"
            />
            <div class="font-bold">Message body</div>
            <v-textarea v-model="form.body" label="Add additional comments" rows="3" placeholder="" hide-details />

            <div class="">
              <PaymentScheduleFiles :linePayScheduleId="notyDialog.schedule.id" />
            </div>

            <div class="flex justify-end gap-2">
              <v-btn color="secondary" @click="closeNotyDialog"> Cancel </v-btn>
              <v-btn color="primary" @click="sendEmailForSelected"> Send email </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="refDialog.showDialog" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closeRefDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Reference #{{ refDialog.referencia?.reference_number }}</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <div v-if="refDialog.referencia?.impoExpo === 'I'">
            <SeaImportViewDetails :id="refDialog.referencia?.id" />
          </div>
          <div v-if="refDialog.referencia?.impoExpo === 'E'">
            <SeaExportViewDetails :id="refDialog.referencia?.id" />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="closeRefDialog"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const usersStore = useUsersStore()

const showDetail = ref<any>({
  showDialog: false,
  schedule: {},
})

const notyDialog = ref<any>({
  showDialog: false,
  schedule: {},
})

const refDialog = ref<any>({
  showDialog: false,
  referencia: null,
})

const catalogs = ref({
  lines: [] as any,
})

const filters = ref({
  id: '',
  lineId: '',
})

const form = ref({
  user: null,
  body: '',
  emails: '',
})

const schedules = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const showNotyForm = (schedule: any) => {
  notyDialog.value.showDialog = true
  notyDialog.value.schedule = schedule
}

const closeNotyDialog = () => {
  notyDialog.value.showDialog = false
  notyDialog.value.schedule = {}
}

const onClickPagination = async (page: number) => {
  schedules.value.current_page = page
  await getSchedules()
}

const schedulesSelectedEmail = computed(() => {
  return schedules.value.data.filter((schedule: any) => schedule.send_email)
})

const addEmailToList = (user: any) => {
  if (user && user.email) {
    // Divide, limpia espacios y filtra vacíos
    let emails = form.value.emails
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0)

    // Solo agrega si no existe ya
    if (!emails.includes(user.email)) {
      emails.push(user.email)
    }

    form.value.emails = emails.join(',')
  }
}

const showScheduleDetail = (schedule: any) => {
  showDetail.value.showDialog = true
  showDetail.value.schedule = schedule
}

const closeScheduleDetail = () => {
  showDetail.value.showDialog = false
  showDetail.value.schedule = {}
}

const showNewTabRef = (ref: any) => {
  refDialog.value.showDialog = true
  refDialog.value.referencia = ref.referencia
}

const closeRefDialog = () => {
  refDialog.value.showDialog = false
  refDialog.value.referencia = null
}

const downloadExcel = async (id: string) => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.linePayments.downloadExcel(id)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `schedule-${id}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const searchLines = async (search: any) => {
  try {
    const response = await $api.lines.searchLines({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight lines',
    })
  }
}

const sendEmailForSelected = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    // add in array from notify dialog
    const schedules = []
    schedules.push(notyDialog.value.schedule)
    // const data = toRaw(schedulesSelectedEmail.value)
    const body = {
      schedules: schedules,
      notes: form.value.body,
      emails: form.value.emails,
    }
    console.log('body', body)
    await $api.linePayments.sendEmailForSelected(body)
    snackbar.add({ type: 'success', text: 'Emails sent successfully' })

    closeNotyDialog()

    await getSchedules()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const getSchedules = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.linePayments.getSchedules({
      query: {
        page: schedules.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    schedules.value = response as any

    if (schedules.value.data.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No records found',
      })
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const onClickFilters = async () => {
  // set current page to 1
  schedules.value.current_page = 1
  await getSchedules()
}

const clearFilters = async () => {
  filters.value = {
    id: '',
    lineId: '',
  }
  await getSchedules()
}

const getCatalogs = async () => {
  try {
    const response = await $api.linePayments.getCatalogs()
    catalogs.value = response
  } catch (e) {
    console.error(e)
  }
}

await getCatalogs()
await getSchedules()
</script>
