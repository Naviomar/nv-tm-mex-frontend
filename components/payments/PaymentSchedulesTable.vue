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

        <v-table density="compact" style="height: auto">
          <thead>
            <tr>
              <th class="text-left" width="50">Email</th>
              <th class="text-left">Excel</th>
              <th class="text-left">Folio</th>
              <th class="text-left">Line</th>
              <th class="text-left">Bank Info</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Linked Ref(s)</th>
              <th class="text-left">Status</th>
              <th class="text-left">Date added</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(schedule, index) in schedules.data" :key="`pay-schedule-${index}`">
              <td style="vertical-align: middle">
                <div v-if="schedule.sent_at == null">
                  <v-checkbox v-if="false" v-model="schedule.send_email" density="compact" hide-details />
                </div>
                <v-btn color="primary" size="small" @click="showNotyForm(schedule)">
                  <v-icon>mdi-email</v-icon> Send notification
                </v-btn>
                <div v-if="schedule.email_logs && schedule.email_logs.length > 0" class="mt-2 flex flex-col gap-2">
                  <v-chip
                    v-for="(log, index) in schedule.email_logs.slice(0, 2)"
                    :key="`email-log-${index}`"
                    size="small"
                    color="info"
                    variant="tonal"
                    style="white-space: normal; height: auto; padding: 8px 12px"
                  >
                    <div class="flex items-center gap-2">
                      <v-icon size="small">mdi-clock-outline</v-icon>
                      <div class="flex flex-col">
                        <span>{{ formatDateString(log.sent_at) }}</span>
                        <span v-if="log.sent_by?.name" class="text-xs text-grey-darken-1">by {{ log.sent_by?.name }}</span>
                      </div>
                    </div>
                  </v-chip>
                  <v-chip
                    v-if="schedule.email_logs.length > 2"
                    size="small"
                    color="grey"
                    variant="tonal"
                    style="height: auto; padding: 8px 12px"
                  >
                    +{{ schedule.email_logs.length - 2 }} more
                  </v-chip>
                </div>
                <div v-else-if="schedule.sent_at" class="mt-2">
                  <v-chip
                    size="small"
                    color="info"
                    variant="tonal"
                    style="white-space: normal; height: auto; padding: 8px 12px"
                  >
                    <div class="flex items-center gap-2">
                      <v-icon size="small">mdi-clock-outline</v-icon>
                      <div class="flex flex-col">
                        <span>{{ formatDateString(schedule.sent_at) }}</span>
                        <span v-if="schedule.sent_by?.name" class="text-xs text-grey-darken-1">by {{ schedule.sent_by?.name }}</span>
                      </div>
                    </div>
                  </v-chip>
                </div>
                <div v-else class="mt-2">
                  <v-chip size="small" color="orange" variant="tonal" style="padding: 8px 12px"> No notification </v-chip>
                </div>
              </td>
              <td>
                <v-btn color="grey-lighten-2" size="small" @click="downloadExcel(schedule)">
                  <v-icon color="black">mdi-file-excel</v-icon>
                </v-btn>
              </td>
              <td>
                <v-btn color="blue-lighten-4" size="small" @click="showScheduleDetail(schedule)">
                  <v-icon>mdi-eye-outline</v-icon>
                  {{ schedule.folio || '#' + schedule.id }}
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
              <td>
                <div class="flex flex-col items-center gap-1">
                  <v-chip v-if="validatePaid(schedule.schedule_refs) === 'Paid'" color="success"> Paid </v-chip>
                  <v-chip v-if="validatePaid(schedule.schedule_refs) === 'Partial'" color="info"> Partial </v-chip>
                  <v-chip v-if="validatePaid(schedule.schedule_refs) === 'Pending'" color="warning"> Pending </v-chip>
                  <InvoiceChargePaymentsView
                    v-if="getScheduleLinkedCharges(schedule.schedule_refs).length > 0"
                    size="x-small"
                    :invoice="{ charges: getScheduleLinkedCharges(schedule.schedule_refs) }"
                  />
                </div>
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="schedule">
                  {{ formatDateString(schedule.created_at) }}
                </UserInfoBadge>
              </td>
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
    <v-dialog v-model="showDetail.showDialog" max-width="900">
      <v-card>
        <v-card-title class="flex items-center justify-between">
          <h1 class="text-xl font-bold">Payment schedule detail {{ showDetail.schedule.folio || '#' + showDetail.schedule.id }}</h1>
          <div class="flex items-center gap-2">
            <v-chip v-if="detailStatus === 'Paid'" color="success">Paid</v-chip>
            <v-chip v-if="detailStatus === 'Partial'" color="info">Partial</v-chip>
            <v-chip v-if="detailStatus === 'Pending'" color="warning">Pending</v-chip>
            <InvoiceChargePaymentsView
              v-if="getScheduleLinkedCharges(showDetail.schedule.schedule_refs).length > 0"
              size="small"
              :invoice="{ charges: getScheduleLinkedCharges(showDetail.schedule.schedule_refs) }"
            />
          </div>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div class="text-xs text-grey-darken-1">Freight line</div>
              <div class="font-bold">{{ showDetail.schedule.line?.name || '-' }}</div>
            </div>
            <div>
              <div class="text-xs text-grey-darken-1">Total amount</div>
              <div class="font-bold">
                {{ getCurrencyName(showDetail.schedule.currency_id) }}
                {{ formatToCurrency(showDetail.schedule.refs_total_amount) }}
              </div>
            </div>
            <div>
              <div class="text-xs text-grey-darken-1">Bank info</div>
              <div v-if="showDetail.schedule.bank_json" class="text-sm">
                <div class="font-bold">{{ showDetail.schedule.bank_json.name }}</div>
                <div v-if="showDetail.schedule.bank_json.iban">IBAN: {{ showDetail.schedule.bank_json.iban }}</div>
                <div v-if="showDetail.schedule.bank_json.clabe">CLABE: {{ showDetail.schedule.bank_json.clabe }}</div>
                <div v-if="showDetail.schedule.bank_json.account_number">
                  Account Number: {{ showDetail.schedule.bank_json.account_number }}
                </div>
              </div>
              <div v-else class="text-red-500">No bank info</div>
            </div>
            <div>
              <div class="text-xs text-grey-darken-1">Created</div>
              <div class="text-sm">
                <UserInfoBadge :item="showDetail.schedule">
                  {{ formatDateString(showDetail.schedule.created_at) }}
                </UserInfoBadge>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-xs text-grey-darken-1 mb-1">Notification history</div>
            <div v-if="showDetail.schedule.email_logs && showDetail.schedule.email_logs.length > 0" class="flex flex-wrap gap-2">
              <v-chip
                v-for="(log, index) in showDetail.schedule.email_logs"
                :key="`detail-email-log-${index}`"
                size="small"
                color="info"
                variant="tonal"
              >
                <v-icon start size="small">mdi-clock-outline</v-icon>
                {{ formatDateString(log.sent_at) }}
                <span v-if="log.sent_by?.name" class="ml-1 text-xs">by {{ log.sent_by?.name }}</span>
              </v-chip>
            </div>
            <div v-else-if="showDetail.schedule.sent_at" class="text-sm">
              Sent {{ formatDateString(showDetail.schedule.sent_at) }}
              <span v-if="showDetail.schedule.sent_by?.name">by {{ showDetail.schedule.sent_by?.name }}</span>
            </div>
            <v-chip v-else size="small" color="orange" variant="tonal">No notification sent</v-chip>
          </div>

          <div class="mb-4">
            <PaymentScheduleFiles :linePayScheduleId="showDetail.schedule.id" />
          </div>

          <div class="text-xs text-grey-darken-1 mb-1">Linked references</div>
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
            <div>
              <v-chip size="small" @click="showNewTabRef(ref)">
                <v-icon>mdi-open-in-new</v-icon>{{ ref.referencia?.reference_number }}
              </v-chip>
            </div>
            <div>{{ ref.ref_master_bl?.name }}</div>
            <div>{{ formatToCurrency(ref.amount) }}</div>
          </div>

          <v-alert v-if="detailStatus === 'Paid'" type="info" variant="tonal" density="compact" class="mt-4">
            This payment release cannot be cancelled because its linked invoices are already paid.
          </v-alert>

          <div class="flex justify-between items-center gap-2 mt-4">
            <div class="flex gap-2">
              <v-btn color="secondary" size="small" @click="downloadExcel(showDetail.schedule)">
                <v-icon start>mdi-file-excel</v-icon> Download Excel
              </v-btn>
              <v-btn color="primary" size="small" @click="showNotyForm(showDetail.schedule)">
                <v-icon start>mdi-email</v-icon> Send notification
              </v-btn>
              <ProcessAuthorizationWrapper
                v-if="canDeleteSchedule && detailStatus !== 'Paid'"
                processName="line-pay-schedules.cancel"
                :requestKey="String(showDetail.schedule.id)"
                label="Cancel Payment Release"
                :displayName="`Payment Release ${showDetail.schedule.folio || '#' + showDetail.schedule.id}`"
                @refresh="onScheduleCancelled"
              >
                <template #auth>
                  <v-btn color="error" size="small" @click="onCancelSchedule(showDetail.schedule)">
                    <v-icon start>mdi-cancel</v-icon> Cancel Payment Release
                  </v-btn>
                </template>
              </ProcessAuthorizationWrapper>
            </div>
            <v-btn color="secondary" @click="closeScheduleDetail"> Close </v-btn>
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
              <v-btn color="secondary" variant="tonal" :loading="previewLoading" @click="previewEmail">
                <v-icon start>mdi-eye-outline</v-icon> Preview email
              </v-btn>
              <v-btn color="primary" @click="sendEmailForSelected"> Send email </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="previewDialog.showDialog" max-width="900">
      <v-card>
        <v-card-title class="flex items-center justify-between">
          <span>Email preview</span>
          <v-btn icon variant="text" @click="previewDialog.showDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-alert density="compact" type="info" variant="outlined" class="mb-2">
            This is an approximate preview of how the email body will look. Actual rendering may vary slightly by email
            client.
          </v-alert>
          <iframe
            v-if="previewDialog.html"
            :srcdoc="previewDialog.html"
            style="width: 100%; height: 70vh; border: 1px solid #e0e0e0"
          ></iframe>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" @click="previewDialog.showDialog = false"> Close </v-btn>
        </v-card-actions>
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
const count = 0;
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const confirm = $notifications.useConfirm()
const { hasPermission } = useCheckUser()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const usersStore = useUsersStore()

const canDeleteSchedule = computed(() => hasPermission('line-payments-delete'))

const showDetail = ref<any>({
  showDialog: false,
  schedule: {},
})

const detailStatus = computed(() => validatePaid(showDetail.value.schedule.schedule_refs))

const notyDialog = ref<any>({
  showDialog: false,
  schedule: {},
})

const previewDialog = ref<any>({
  showDialog: false,
  html: '',
})
const previewLoading = ref(false)

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

// Junta los charges de todas las freight notes ligadas a este schedule (a través de
// schedule_refs.line_invoice_refs.invoice.charges), para poder mostrar sus pagos
// aplicados con InvoiceChargePaymentsView y para calcular el status Paid/Partial/Pending.
const getScheduleLinkedCharges = (paramRef: any): any[] => {
  const scheduleRefs = paramRef || []
  const charges: any[] = []
  scheduleRefs.forEach((ref: any) => {
    ;(ref.line_invoice_refs || []).forEach((lir: any) => {
      charges.push(...(lir.invoice?.charges || []))
    })
  })
  return charges
}

const validatePaid = (paramRef: any): string => {
  const scheduleRefs = paramRef || []
  if (scheduleRefs.length === 0) return 'Pending'

  // El total a justificar es el monto programado por CADA scheduleRef (schedule_ref.amount),
  // no solo el de las que ya tienen freight note ligada. Una referencia sin line_invoice_refs
  // todavia (line_pay_schedule_ref_id se llena solo hasta que se le aplica pago) sigue contando
  // como pendiente — de lo contrario un schedule con 7/8 referencias pagadas salia "Paid".
  const totalScheduled = scheduleRefs.reduce((acc: number, ref: any) => acc + parseFloat(ref.amount || 0), 0)
  const totalPaid = getScheduleLinkedCharges(scheduleRefs).reduce(
    (acc: number, charge: any) => acc + parseFloat(charge.amount_paid || 0),
    0
  )

  if (totalPaid <= 0) return 'Pending'
  if (totalScheduled > 0 && totalPaid >= totalScheduled - 0.01) return 'Paid'
  return 'Partial'
}

const showNotyForm = (schedule: any) => {
  notyDialog.value.showDialog = true
  notyDialog.value.schedule = schedule

  // Precargar emails según el tipo de área (Import/Export)
  const contactType = schedule.impoExpo === 'I' ? 'import' : 'export'
  const areaContacts = schedule.line?.contacts?.filter((c: any) => c.contact_type === contactType) || []
  const generalEmails = schedule.line?.emails || []

  // Combinar emails de contactos específicos y generales
  const emails: string[] = []
  areaContacts.forEach((contact: any) => {
    if (contact.email) emails.push(contact.email)
  })
  generalEmails.forEach((lineEmail: any) => {
    if (lineEmail.email && !emails.includes(lineEmail.email)) emails.push(lineEmail.email)
  })

  form.value.emails = emails.join(',')
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

const onCancelSchedule = async (schedule: any) => {
  const ok = await confirm({
    title: 'Are you sure?',
    content: `Do you want to cancel Payment Release #${schedule.id}? It will be removed from the active list, but its history and files remain available for consultation.`,
    confirmationText: 'Yes, cancel',
    confirmationButtonProps: { color: 'error' },
  })

  if (!ok) return

  try {
    loadingIndicator.start()
    loadingStore.loading = true
    await $api.linePayments.cancelSchedule(schedule.id)
    snackbar.add({ type: 'success', text: 'Payment Release cancelled successfully' })
    closeScheduleDetail()
    await getSchedules()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error cancelling the Payment Release' })
  } finally {
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const onScheduleCancelled = async () => {
  await getSchedules()
}

const showNewTabRef = (ref: any) => {
  refDialog.value.showDialog = true
  refDialog.value.referencia = ref.referencia
}

const closeRefDialog = () => {
  refDialog.value.showDialog = false
  refDialog.value.referencia = null
}

const downloadExcel = async (schedule: any) => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.linePayments.downloadExcel(schedule.id)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `schedule-${schedule.folio || schedule.id}.xlsx`)
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

const { hasAtLeastOneValidEmail } = useEmailListValidation()

const previewEmail = async () => {
  try {
    previewLoading.value = true
    const response: any = await $api.linePayments.previewScheduleEmail(notyDialog.value.schedule.id, {
      notes: form.value.body,
    })
    previewDialog.value.html = response.html
    previewDialog.value.showDialog = true
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error generating email preview' })
  } finally {
    previewLoading.value = false
  }
}

const sendEmailForSelected = async () => {
  if (!hasAtLeastOneValidEmail(form.value.emails)) {
    snackbar.add({ type: 'warning', text: 'Enter at least one valid email' })
    return
  }
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
console.log("*---RESPUESTA----",schedules)
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
