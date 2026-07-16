<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div class="d-flex align-center gap-3">
        <v-btn color="slate" size="small" variant="outlined" icon="mdi-arrow-left" @click="goBack" />
        <v-icon size="28" color="primary">mdi-email-multiple-outline</v-icon>
        <div>
          <h3 class="text-h6 font-weight-bold" style="line-height: 1.2">Mail notification #{{ id }}</h3>
          <div class="text-caption text-medium-emphasis">{{ shortName }}</div>
        </div>
      </div>
      <div class="d-flex gap-2">
        <v-btn to="/system/mail-notifications" variant="outlined" color="slate">
          Cancel
        </v-btn>
        <v-btn color="primary" @click="saveCharge">
          <v-icon size="18" class="mr-1">mdi-content-save-outline</v-icon>
          Save
        </v-btn>
      </div>
    </div>

    <!-- General info -->
    <v-card class="mb-6 section-card" rounded="lg" elevation="0">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              :model-value="shortName"
              label="Name"
              variant="outlined"
              density="compact"
              hide-details
              readonly
              prepend-inner-icon="mdi-tag-outline"
            />
          </v-col>
          <v-col cols="12" sm="8" md="9">
            <v-text-field
              :model-value="description"
              label="Description *"
              placeholder="Description"
              variant="outlined"
              density="compact"
              :error-messages="descriptionError"
              prepend-inner-icon="mdi-text-long"
              @update:model-value="setDescription"
            />
          </v-col>
          <v-col v-if="supportsCreatorFallback" cols="12">
            <div class="d-flex align-center ga-1">
              <v-switch
                v-model="includeCreatorAsTo"
                color="primary"
                density="compact"
                hide-details
                label="Add invoice creator as TO"
              />
              <v-tooltip location="top" max-width="320">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-information-outline" size="18" color="medium-emphasis" />
                </template>
                <span>
                  When enabled, the user who created the invoice is always added as a TO
                  recipient on this notification — so if the customer has no email configured,
                  the invoice email still reaches someone instead of going undelivered.
                </span>
              </v-tooltip>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Departments -->
    <v-card class="mb-6 section-card" rounded="lg" elevation="0">
      <v-card-text>
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center gap-2">
            <v-icon color="primary">mdi-office-building-outline</v-icon>
            <span class="text-subtitle-1 font-weight-bold">Departments</span>
          </div>
          <v-chip size="small" color="primary" variant="tonal">{{ linkedDepartments.length }}</v-chip>
        </div>
        <p class="text-caption text-medium-emphasis mb-4">
          Departments always receive this notification for every recipient type, scoped to the ports selected (empty = all ports).
        </p>

        <v-row>
          <v-col cols="12" lg="5">
            <v-card class="pa-4 h-100 panel-card" rounded="lg" elevation="0">
              <div class="text-caption font-weight-medium text-medium-emphasis mb-3">ADD DEPARTMENT</div>
              <v-select
                v-model="form.department"
                :items="availableDepartments"
                item-title="name"
                item-value="id"
                label="Select department"
                variant="outlined"
                density="compact"
                class="mb-3"
                hide-details
              />
              <v-autocomplete
                v-model="form.ports"
                :items="ports"
                item-title="name"
                item-value="id"
                label="Ports (optional = general)"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
                multiple
                chips
                closable-chips
                clearable
              />
              <v-btn color="primary" block @click="linkDepartment">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                Add department
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" lg="7">
            <v-card class="h-100 panel-card" rounded="lg" elevation="0">
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Ports</th>
                    <th width="60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(department, index) in linkedDepartments" :key="`department-${index}`">
                    <td>{{ department.name }}</td>
                    <td>
                      <template v-if="department.pivot?.ports?.length">
                        <v-chip
                          v-for="port in department.pivot.ports"
                          :key="port.id"
                          size="x-small"
                          color="blue"
                          variant="tonal"
                          class="mr-1"
                        >
                          {{ port.name }}
                        </v-chip>
                      </template>
                      <span v-else class="text-caption text-medium-emphasis">General</span>
                    </td>
                    <td class="text-center">
                      <v-btn
                        icon="mdi-delete"
                        size="x-small"
                        variant="text"
                        color="error"
                        @click="unlinkDepartment(department)"
                      />
                    </td>
                  </tr>
                  <tr v-if="linkedDepartments.length === 0">
                    <td colspan="3" class="text-center text-medium-emphasis pa-4">
                      No departments linked
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Recipients: system users + manually typed addresses, unified -->
    <v-card class="mb-6 section-card" rounded="lg" elevation="0">
      <v-card-text>
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center gap-2">
            <v-icon color="primary">mdi-account-multiple-outline</v-icon>
            <span class="text-subtitle-1 font-weight-bold">Recipients</span>
          </div>
          <v-chip size="small" color="primary" variant="tonal">{{ mergedRecipients.length }}</v-chip>
        </div>
        <p class="text-caption text-medium-emphasis mb-4">
          Individual people who receive this notification: pick an existing system user or type a one-off address.
        </p>

        <v-row>
          <v-col cols="12" lg="5">
            <v-card class="pa-4 h-100 panel-card" rounded="lg" elevation="0">
              <v-btn-toggle v-model="recipientForm.mode" mandatory density="compact" variant="outlined" divided class="mb-3" style="width: 100%">
                <v-btn value="user" size="small" class="flex-grow-1">
                  <v-icon size="16" class="mr-1">mdi-account-outline</v-icon>
                  System user
                </v-btn>
                <v-btn value="custom" size="small" class="flex-grow-1">
                  <v-icon size="16" class="mr-1">mdi-email-plus-outline</v-icon>
                  Custom email
                </v-btn>
              </v-btn-toggle>

              <v-autocomplete
                v-if="recipientForm.mode === 'user'"
                v-model="recipientForm.userId"
                :items="availableUsers"
                item-title="email"
                item-value="id"
                label="Search user by email or name"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
                clearable
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps" :title="item.raw.email" :subtitle="item.raw.name" />
                </template>
              </v-autocomplete>
              <template v-else>
                <v-text-field
                  v-model="recipientForm.email"
                  label="Email"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mb-3"
                />
                <v-text-field
                  v-model="recipientForm.name"
                  label="Name (optional)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mb-3"
                />
              </template>

              <div class="d-flex gap-2 mb-3">
                <v-select
                  v-model="recipientForm.type"
                  :items="['TO', 'CC', 'BCC']"
                  label="Type"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="width: 110px"
                />
                <v-autocomplete
                  v-model="recipientForm.ports"
                  :items="ports"
                  item-title="name"
                  item-value="id"
                  label="Ports (optional = general)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="flex-grow-1"
                  multiple
                  chips
                  closable-chips
                  clearable
                />
              </div>
              <v-btn color="primary" block @click="addRecipient">
                <v-icon size="18" class="mr-1">mdi-plus</v-icon>
                Add recipient
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" lg="7">
            <v-card class="h-100 panel-card" rounded="lg" elevation="0">
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Type</th>
                    <th>Source</th>
                    <th>Ports</th>
                    <th width="60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in mergedRecipients" :key="row.key">
                    <td>
                      <div class="font-weight-medium">{{ row.label }}</div>
                      <div v-if="row.source === 'user' && row.name" class="text-caption text-medium-emphasis">{{ row.email }}</div>
                    </td>
                    <td>
                      <v-chip
                        size="small"
                        :color="row.type === 'TO' ? 'blue' : row.type === 'CC' ? 'green' : 'purple'"
                      >
                        {{ row.type }}
                      </v-chip>
                    </td>
                    <td>
                      <v-chip size="x-small" :color="row.source === 'user' ? 'indigo' : 'teal'" variant="tonal">
                        {{ row.source === 'user' ? 'User' : 'Custom' }}
                      </v-chip>
                    </td>
                    <td>
                      <template v-if="row.ports?.length">
                        <v-chip
                          v-for="port in row.ports"
                          :key="port.id"
                          size="x-small"
                          color="blue"
                          variant="tonal"
                          class="mr-1"
                        >
                          {{ port.name }}
                        </v-chip>
                      </template>
                      <span v-else class="text-caption text-medium-emphasis">General</span>
                    </td>
                    <td class="text-center">
                      <v-btn
                        icon="mdi-delete"
                        size="x-small"
                        variant="text"
                        color="error"
                        @click="deleteRecipient(row)"
                      />
                    </td>
                  </tr>
                  <tr v-if="mergedRecipients.length === 0">
                    <td colspan="5" class="text-center text-medium-emphasis pa-4">
                      No recipients linked
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Consignee emails: catalog-driven customer addresses -->
    <v-card class="mb-6 section-card" rounded="lg" elevation="0">
      <v-card-text>
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center gap-2">
            <v-icon color="primary">mdi-account-box-multiple-outline</v-icon>
            <span class="text-subtitle-1 font-weight-bold">Consignee emails</span>
          </div>
          <v-chip size="small" color="primary" variant="tonal">{{ linkedEmails?.total ?? 0 }}</v-chip>
        </div>
        <p class="text-caption text-medium-emphasis mb-4">
          Customer email addresses pulled from the consignee catalog.
        </p>

        <v-row>
          <v-col cols="12" lg="5">
            <v-card class="pa-4 mb-4 panel-card" rounded="lg" elevation="0">
              <div class="text-caption font-weight-medium text-medium-emphasis mb-3">SEARCH &amp; ADD</div>
              <v-text-field
                v-model="emailSearch"
                placeholder="Search customer or email..."
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
                prepend-inner-icon="mdi-magnify"
                @input="searchEmails"
              />
              <v-select
                v-model="defaultEmailType"
                :items="['TO', 'CC', 'BCC']"
                label="Type for new matches"
                variant="outlined"
                density="compact"
                hide-details
              />
              <v-list v-if="searchResults.length > 0" density="compact" class="mt-3 rounded-lg border" style="max-height: 240px; overflow-y: auto">
                <v-list-item v-for="email in searchResults" :key="email.id">
                  <div class="d-flex align-center gap-3">
                    <div class="flex-grow-1">
                      <div class="text-body-2 font-weight-medium">{{ email.email }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ email.consignee?.name }} ({{ email.consignee?.code }})
                      </div>
                    </div>
                    <v-select
                      :model-value="getPendingEmailType(email.id)"
                      :items="['TO', 'CC', 'BCC']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      style="width: 80px"
                      @update:model-value="setPendingEmailType(email.id, $event)"
                    />
                    <v-btn size="small" color="primary" @click="linkEmail(email)">
                      Add
                    </v-btn>
                  </div>
                </v-list-item>
              </v-list>
            </v-card>

            <v-expansion-panels variant="accordion">
              <v-expansion-panel>
                <v-expansion-panel-title class="text-caption font-weight-medium">
                  <v-icon size="18" class="mr-2">mdi-content-copy</v-icon>
                  Copy from another notification
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-select
                    v-model="bulkForm.sourceNotificationId"
                    :items="otherNotifications"
                    item-title="short_name"
                    item-value="id"
                    label="Select notification..."
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="mb-3"
                  />
                  <div class="d-flex gap-2">
                    <v-select
                      v-model="bulkForm.copyType"
                      :items="['TO', 'CC', 'BCC']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      style="width: 110px"
                    />
                    <v-btn color="primary" class="flex-grow-1" @click="copyFromNotification">
                      Copy
                    </v-btn>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>

          <v-col cols="12" lg="7">
            <v-card class="pa-4 panel-card" rounded="lg" elevation="0">
              <v-text-field
                v-model="linkedEmailsSearch"
                placeholder="Filter linked emails..."
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-filter-variant"
                class="mb-3"
                @input="loadLinkedEmails"
              />
              <v-data-table
                :headers="emailHeaders"
                :items="linkedEmails?.data ?? []"
                :items-per-page="-1"
                density="compact"
                hide-default-footer
              >
                <template #item.email="{ item }">
                  {{ item.email }}
                </template>
                <template #item.customer="{ item }">
                  <div>
                    <div class="text-body-2">{{ item.consignee?.name }}</div>
                    <div class="text-caption text-medium-emphasis">{{ item.consignee?.code }}</div>
                  </div>
                </template>
                <template #item.type="{ item }">
                  <v-chip
                    size="small"
                    :color="item.pivot?.type === 'TO' ? 'blue' : item.pivot?.type === 'CC' ? 'green' : 'purple'"
                  >
                    {{ item.pivot?.type }}
                  </v-chip>
                </template>
                <template #item.actions="{ item }">
                  <v-btn
                    icon="mdi-delete"
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="unlinkEmail(item)"
                  />
                </template>
                <template #no-data>
                  <div class="text-center pa-4 text-medium-emphasis">
                    No consignee emails assigned yet
                  </div>
                </template>
              </v-data-table>

              <div v-if="linkedEmails && linkedEmails.last_page > 1" class="d-flex justify-center mt-4">
                <v-pagination
                  :model-value="linkedEmails.current_page"
                  :length="linkedEmails.last_page"
                  :total-visible="5"
                  density="compact"
                  @update:model-value="onEmailsPaginationClick"
                />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import { useField } from 'vee-validate'
import { schema } from '~/forms/mailNotificationForm'

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const id = route.params.id as string

const goBack = () => {
  router.back()
}

const linkedUsers = ref<any[]>([])
const linkedDepartments = ref<any[]>([])
const users = ref<any[]>([])
const departments = ref<any[]>([])
const ports = ref<any[]>([])
const form = reactive({
  department: null as number | null,
  ports: [] as number[],
})

const linkedExtraEmails = ref<any[]>([])
const recipientForm = reactive({
  mode: 'user' as 'user' | 'custom',
  userId: null as number | null,
  email: '',
  name: '',
  type: 'CC' as 'TO' | 'CC' | 'BCC',
  ports: [] as number[],
})

const linkedEmails = ref<any>(null)
const linkedEmailsSearch = ref('')
const searchResults = ref<any[]>([])
const emailSearch = ref('')
const defaultEmailType = ref<'TO' | 'CC' | 'BCC'>('TO')
const emailPendingTypes = ref<Record<number, string>>({})
const otherNotifications = ref<any[]>([])
const bulkForm = reactive({
  sourceNotificationId: null as number | null,
  copyType: 'TO' as 'TO' | 'CC' | 'BCC',
})
const searchTimeout = ref<any>(null)

const emailHeaders = [
  { title: 'Email', key: 'email', sortable: false },
  { title: 'Customer', key: 'customer', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
]

const { setValues, handleSubmit } = useForm({
  validationSchema: schema,
})

const { value: shortName } = useField<string>('short_name')
const { value: description, errorMessage: descriptionError, setValue: setDescription } = useField<string>('description')
const { value: includeCreatorAsTo } = useField<boolean>('include_creator_as_to')

// El fallback "creador como TO" solo está implementado en el backend para
// estos 3 mailables de factura — el switch no debe verse en el resto,
// porque ahí no haría nada.
const CREATOR_FALLBACK_MAILABLES = [
  'App\\Mail\\Mexico\\ConsigneeInvoiceTm',
  'App\\Mail\\Mexico\\ConsigneeInvoiceWm',
  'App\\Mail\\Mexico\\ConsigneeInvoiceTmCfdi',
]
const mailNotificationName = ref('')
const supportsCreatorFallback = computed(() => CREATOR_FALLBACK_MAILABLES.includes(mailNotificationName.value))

watch(
  () => id,
  async (currentId) => {
    if (currentId) {
      const response = (await $api.mailNotifications.getById(currentId)) as any
      mailNotificationName.value = response.name ?? ''
      setValues({
        ...response,
        short_name: response.short_name ?? response.name ?? '',
        description: response.description ?? '',
        include_creator_as_to: response.include_creator_as_to ?? true,
      })
      linkedUsers.value = response.users ?? []
      linkedDepartments.value = response.departments ?? []
      linkedExtraEmails.value = response.extra_emails ?? []
    }
  },
  { immediate: true },
)

const availableDepartments = computed(() => {
  return departments.value.filter((department: any) => {
    return !linkedDepartments.value.some((linkedDepartment: any) => linkedDepartment.id === department.id)
  })
})

const availableUsers = computed(() => {
  return users.value.filter((user: any) => {
    return !linkedUsers.value.some((linkedUser: any) => linkedUser.id === user.id)
  })
})

const TYPE_ORDER: Record<string, number> = { TO: 0, CC: 1, BCC: 2 }

const mergedRecipients = computed(() => {
  const userRows = linkedUsers.value.map((u: any) => ({
    key: `user-${u.id}`,
    source: 'user' as const,
    label: u.name || u.email,
    email: u.email,
    name: u.name,
    type: u.pivot?.type,
    ports: u.pivot?.ports ?? [],
    raw: u,
  }))
  const extraRows = linkedExtraEmails.value.map((e: any) => ({
    key: `extra-${e.id}`,
    source: 'extra' as const,
    label: e.name || e.email,
    email: e.email,
    name: e.name,
    type: e.type,
    ports: e.ports ?? [],
    raw: e,
  }))
  return [...userRows, ...extraRows].sort((a, b) => {
    const typeDiff = (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99)
    if (typeDiff !== 0) return typeDiff
    return (a.label || '').localeCompare(b.label || '')
  })
})

async function addRecipient() {
  if (recipientForm.mode === 'user') {
    if (!recipientForm.userId) {
      snackbar.add({ type: 'warning', text: 'Please select a user' })
      return
    }
    const user = users.value.find((u: any) => u.id === recipientForm.userId)
    await $api.mailNotifications.linkUser(id, {
      user_id: recipientForm.userId,
      type: recipientForm.type,
      ports: recipientForm.ports,
    })
    const copy = { ...user }
    copy.pivot = {
      type: recipientForm.type,
      ports: ports.value.filter((p: any) => recipientForm.ports.includes(p.id)),
    }
    linkedUsers.value.push(copy)
    snackbar.add({ type: 'success', text: 'User linked' })
  } else {
    if (!recipientForm.email) {
      snackbar.add({ type: 'warning', text: 'Please enter an email' })
      return
    }
    try {
      const response: any = await $api.mailNotifications.addExtraEmail(id, {
        email: recipientForm.email,
        name: recipientForm.name,
        type: recipientForm.type,
        ports: recipientForm.ports,
      })
      linkedExtraEmails.value.push(response)
      snackbar.add({ type: 'success', text: 'Extra email added' })
    } catch (error) {
      console.error('Error adding extra email:', error)
      snackbar.add({ type: 'error', text: 'Error adding extra email' })
      return
    }
  }

  recipientForm.userId = null
  recipientForm.email = ''
  recipientForm.name = ''
  recipientForm.type = 'CC'
  recipientForm.ports = []
}

async function deleteRecipient(row: any) {
  if (row.source === 'user') {
    await $api.mailNotifications.unlinkUser(id, { user_id: row.raw.id })
    linkedUsers.value = linkedUsers.value.filter((u: any) => u.id !== row.raw.id)
    snackbar.add({ type: 'success', text: 'User unlinked' })
  } else {
    try {
      await $api.mailNotifications.deleteExtraEmail(id, row.raw.id)
      linkedExtraEmails.value = linkedExtraEmails.value.filter((e: any) => e.id !== row.raw.id)
      snackbar.add({ type: 'success', text: 'Extra email removed' })
    } catch (error) {
      console.error('Error removing extra email:', error)
      snackbar.add({ type: 'error', text: 'Error removing extra email' })
    }
  }
}

const onSuccess = async (values: any) => {
  if (id) {
    await $api.mailNotifications.update(id, values)
    snackbar.add({ type: 'success', text: 'Mail notification updated' })
    router.push('/system/mail-notifications')
    return
  }
}

function onInvalidSubmit() {
  snackbar.add({ type: 'error', text: 'Please fill all required fields' })
}

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)

const linkDepartment = async () => {
  if (!form.department) {
    snackbar.add({ type: 'warning', text: 'Please select a department' })
    return
  }
  await $api.mailNotifications.linkDepartment(id, { department_id: form.department, ports: form.ports })
  const department = { ...departments.value.find((d: any) => d.id === form.department) }
  department.pivot = { ports: ports.value.filter((p: any) => form.ports.includes(p.id)) }
  linkedDepartments.value.push(department)
  form.department = null
  form.ports = []
  snackbar.add({ type: 'success', text: 'Department linked' })
}

const unlinkDepartment = async (department: any) => {
  await $api.mailNotifications.unlinkDepartment(id, { department_id: department.id })
  linkedDepartments.value = linkedDepartments.value.filter((d: any) => d.id !== department.id)
  snackbar.add({ type: 'success', text: 'Department unlinked' })
}

function getPendingEmailType(emailId: number) {
  return emailPendingTypes.value[emailId] ?? defaultEmailType.value
}

function setPendingEmailType(emailId: number, type: string) {
  emailPendingTypes.value[emailId] = type
}

async function loadLinkedEmails() {
  try {
    linkedEmails.value = await $api.mailNotifications.getConsigneeEmails(id, {
      query: {
        page: linkedEmails.value?.current_page ?? 1,
        limit: 20,
        search: linkedEmailsSearch.value,
      },
    })
  } catch (error) {
    console.error('Error loading linked emails:', error)
  }
}

async function searchEmails() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(async () => {
    if (emailSearch.value.trim().length < 2) {
      searchResults.value = []
      return
    }

    try {
      searchResults.value = await $api.mailNotifications.searchConsigneeEmails(id, {
        query: {
          search: emailSearch.value,
          limit: 20,
        },
      })
    } catch (error) {
      console.error('Error searching emails:', error)
    }
  }, 300)
}

async function linkEmail(email: any) {
  const type = getPendingEmailType(email.id)
  try {
    await $api.mailNotifications.linkConsigneeEmail(id, {
      consignee_email_id: email.id,
      type,
    })
    snackbar.add({ type: 'success', text: 'Email assigned successfully' })
    searchResults.value = searchResults.value.filter((e: any) => e.id !== email.id)
    await loadLinkedEmails()
  } catch (error) {
    console.error('Error linking email:', error)
    snackbar.add({ type: 'error', text: 'Error assigning email' })
  }
}

async function unlinkEmail(email: any) {
  try {
    await $api.mailNotifications.unlinkConsigneeEmail(id, {
      consignee_email_id: email.id,
    })
    snackbar.add({ type: 'success', text: 'Email removed successfully' })
    await loadLinkedEmails()
  } catch (error) {
    console.error('Error unlinking email:', error)
    snackbar.add({ type: 'error', text: 'Error removing email' })
  }
}

async function copyFromNotification() {
  if (!bulkForm.sourceNotificationId) {
    snackbar.add({ type: 'warning', text: 'Please select a notification to copy from' })
    return
  }

  try {
    const response = await $api.mailNotifications.copyFromNotification(id, {
      source_notification_id: bulkForm.sourceNotificationId,
      type: bulkForm.copyType,
    })
    snackbar.add({
      type: 'success',
      text: `${response.count} emails copied successfully`,
    })
    bulkForm.sourceNotificationId = null
    await loadLinkedEmails()
  } catch (error) {
    console.error('Error copying notifications:', error)
    snackbar.add({ type: 'error', text: 'Error copying notifications' })
  }
}

function onEmailsPaginationClick(page: number) {
  if (linkedEmails.value) {
    linkedEmails.value.current_page = page
  }
  loadLinkedEmails()
}

onMounted(async () => {
  users.value = await $api.users.getAllUsers()
  departments.value = await $api.departments.getAllDepartments()

  const formCatalogs = await $api.mailNotifications.getFormCatalogs()
  ports.value = formCatalogs?.ports ?? []

  const allNotifications = await $api.mailNotifications.getMailNotifications()
  otherNotifications.value = (allNotifications?.data ?? []).filter((n: any) => n.id !== parseInt(id))

  await loadLinkedEmails()
})
</script>

<style scoped>
/* Bordes suaves y modernos en vez del contorno duro de variant="outlined" —
   una sola línea de separación por nivel, sin doble-borde entre la sección
   y los paneles que contiene. */
.section-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.panel-card {
  border: 1px solid rgba(0, 0, 0, 0.07);
  background: rgba(0, 0, 0, 0.012);
}

.v-theme--dark .section-card {
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.v-theme--dark .panel-card {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}
</style>
