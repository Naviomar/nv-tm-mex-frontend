<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="goBack">
      Back
    </v-btn>
    
    <v-card>
      <v-card-title>
        <h3>Mail notification #{{ id }}</h3>
      </v-card-title>
      
      <v-card-text>
        <v-tabs v-model="activeTab" bg-color="secondary" class="mb-4">
          <v-tab value="general" prepend-icon="mdi-information-outline">
            General Info
          </v-tab>
          <v-tab value="emails" prepend-icon="mdi-email-multiple">
            Consignee Emails
            <v-chip v-if="emailsCount > 0" size="x-small" color="primary" class="ml-2">
              {{ emailsCount }}
            </v-chip>
          </v-tab>
        </v-tabs>

        <v-tabs-window v-model="activeTab">
          <v-tabs-window-item value="general">
            <v-card flat>
              <v-card-text>
                <v-row>
                  <!-- Left column: form fields -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      :model-value="shortName"
                      label="Name"
                      variant="outlined"
                      density="comfortable"
                      readonly
                    />
                    <v-text-field
                      :model-value="description"
                      label="Description *"
                      placeholder="Description"
                      variant="outlined"
                      density="comfortable"
                      :error-messages="descriptionError"
                      @update:model-value="setDescription"
                    />
                    <div class="d-flex gap-2">
                      <v-btn to="/system/mail-notifications" variant="outlined" color="slate">
                        Cancel
                      </v-btn>
                      <v-btn color="primary" @click="saveCharge">
                        Save
                      </v-btn>
                    </div>
                  </v-col>

                  <!-- Right column: departments & users -->
                  <v-col cols="12" md="6">
                    <!-- Departments -->
                    <div class="mb-6">
                      <div class="text-subtitle-1 font-weight-bold mb-3">Departments</div>
                      <div class="d-flex gap-2 align-end mb-3">
                        <v-select
                          v-model="form.department"
                          :items="availableDepartments"
                          item-title="name"
                          item-value="id"
                          label="Select department"
                          variant="outlined"
                          density="comfortable"
                          class="flex-grow-1"
                        />
                        <v-btn color="primary" size="small" @click="linkDepartment">
                          Add
                        </v-btn>
                      </div>
                      <v-table density="compact">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th width="100">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(department, index) in linkedDepartments" :key="`department-${index}`">
                            <td>
                              <div class="d-flex justify-space-between align-center">
                                {{ department.name }}
                                <UserInfoBadge :item="department" />
                              </div>
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
                            <td colspan="2" class="text-center text-grey pa-4">
                              No departments linked
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </div>

                    <!-- Users -->
                    <div>
                      <div class="text-subtitle-1 font-weight-bold mb-3">Users</div>
                      <div class="d-flex gap-2 align-center mb-3">
                        <v-text-field
                          v-model="userSearch"
                          placeholder="Filter by email or name…"
                          variant="outlined"
                          density="compact"
                          hide-details
                          class="flex-grow-1"
                        />
                        <div class="d-flex align-center gap-2">
                          <span class="text-caption">Default type:</span>
                          <v-select
                            v-model="defaultNotifyType"
                            :items="['CC', 'BCC']"
                            variant="outlined"
                            density="compact"
                            hide-details
                            style="width: 100px"
                          />
                        </div>
                      </div>
                      <v-card variant="outlined" class="mb-3" style="max-height: 200px; overflow-y: auto">
                        <div
                          v-for="u in filteredAvailableUsers"
                          :key="u.id"
                          class="d-flex align-center gap-2 pa-2 hover-bg"
                        >
                          <span class="flex-grow-1 text-truncate text-body-2" :title="u.email">{{
                            u.email
                          }}</span>
                          <v-select
                            :model-value="getUserPendingType(u.id)"
                            :items="['CC', 'BCC']"
                            variant="outlined"
                            density="compact"
                            hide-details
                            style="width: 80px"
                            @update:model-value="setUserPendingType(u.id, $event)"
                          />
                          <v-btn size="small" color="primary" @click="linkUserQuick(u)">
                            Add
                          </v-btn>
                        </div>
                        <div v-if="filteredAvailableUsers.length === 0" class="pa-3 text-center text-grey">
                          {{ userSearch ? 'No users match the filter.' : 'All users are already linked.' }}
                        </div>
                      </v-card>
                      <v-table density="compact">
                        <thead>
                          <tr>
                            <th>User email</th>
                            <th>Notification type</th>
                            <th width="100">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(user, index) in linkedUsers" :key="`user-${index}`">
                            <td>{{ user.name }}</td>
                            <td>
                              <div class="d-flex justify-space-between align-center">
                                {{ user.pivot?.type }}
                                <UserInfoBadge :item="user.pivot" />
                              </div>
                            </td>
                            <td class="text-center">
                              <v-btn
                                icon="mdi-delete"
                                size="x-small"
                                variant="text"
                                color="error"
                                @click="unlinkUser(user)"
                              />
                            </td>
                          </tr>
                          <tr v-if="linkedUsers.length === 0">
                            <td colspan="3" class="text-center text-grey pa-4">
                              No users linked
                            </td>
                          </tr>
                        </tbody>
                      </v-table>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>

          <v-tabs-window-item value="emails">
            <v-card flat>
              <v-card-text>
                <!-- Bulk Operations Section -->
                <v-card variant="tonal" color="blue-grey-lighten-5" class="mb-4">
                  <v-card-title class="text-subtitle-1">Bulk Operations</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="text-caption mb-2">Copy from another notification</div>
                        <div class="d-flex gap-2">
                          <v-select
                            v-model="bulkForm.sourceNotificationId"
                            :items="otherNotifications"
                            item-title="short_name"
                            item-value="id"
                            label="Select notification..."
                            variant="outlined"
                            density="comfortable"
                            class="flex-grow-1"
                          />
                          <v-select
                            v-model="bulkForm.copyType"
                            :items="['TO', 'CC', 'BCC']"
                            variant="outlined"
                            density="comfortable"
                            style="width: 100px"
                          />
                          <v-btn color="primary" size="small" @click="copyFromNotification">
                            Copy
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- Search and Add Emails -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <div class="text-subtitle-1 font-weight-bold">Manage Emails</div>
                    <div class="d-flex gap-2">
                      <v-text-field
                        v-model="emailSearch"
                        placeholder="Search customer or email..."
                        variant="outlined"
                        density="compact"
                        hide-details
                        style="width: 250px"
                        @input="searchEmails"
                      />
                      <v-select
                        v-model="defaultEmailType"
                        :items="['TO', 'CC', 'BCC']"
                        variant="outlined"
                        density="compact"
                        hide-details
                        style="width: 100px"
                      />
                    </div>
                  </div>

                  <!-- Available Emails to Add -->
                  <v-card v-if="searchResults.length > 0" variant="outlined" class="mb-4" style="max-height: 300px; overflow-y: auto">
                    <div
                      v-for="email in searchResults"
                      :key="email.id"
                      class="d-flex align-center gap-3 pa-3 border-b"
                    >
                      <div class="flex-grow-1">
                        <div class="text-body-2 font-weight-medium">{{ email.email }}</div>
                        <div class="text-caption text-grey">
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
                  </v-card>
                </div>

                <!-- Linked Emails Table -->
                <div>
                  <div class="d-flex justify-space-between align-center mb-3">
                    <div class="text-subtitle-1 font-weight-bold">Assigned Emails</div>
                    <v-chip size="small" color="primary">
                      Total: {{ linkedEmails?.total ?? 0 }}
                    </v-chip>
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="linkedEmailsSearch"
                      placeholder="Filter linked emails..."
                      variant="outlined"
                      density="compact"
                      hide-details
                      @input="loadLinkedEmails"
                    />
                  </div>
                  <v-data-table
                    :headers="emailHeaders"
                    :items="linkedEmails?.data ?? []"
                    :items-per-page="-1"
                    density="comfortable"
                    hide-default-footer
                  >
                    <template #item.email="{ item }">
                      {{ item.email }}
                    </template>
                    <template #item.customer="{ item }">
                      <div>
                        <div class="text-body-2">{{ item.consignee?.name }}</div>
                        <div class="text-caption text-grey">{{ item.consignee?.code }}</div>
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
                      <div class="text-center pa-4 text-grey">
                        No emails assigned yet
                      </div>
                    </template>
                  </v-data-table>

                  <!-- Pagination -->
                  <div v-if="linkedEmails && linkedEmails.last_page > 1" class="d-flex justify-center mt-4">
                    <v-pagination
                      :model-value="linkedEmails.current_page"
                      :length="linkedEmails.last_page"
                      :total-visible="7"
                      @update:model-value="onEmailsPaginationClick"
                    />
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
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

const activeTab = ref<'general' | 'emails'>('general')
const linkedUsers = ref<any[]>([])
const linkedDepartments = ref<any[]>([])
const users = ref<any[]>([])
const departments = ref<any[]>([])
const form = reactive({
  department: null as number | null,
})
const userSearch = ref('')
const defaultNotifyType = ref<'CC' | 'BCC'>('CC')
const userPendingTypes = ref<Record<number, string>>({})

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

const emailsCount = computed(() => linkedEmails.value?.total ?? 0)

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

function onDescriptionInput(e: Event) {
  const target = e.target as HTMLInputElement
  setDescription(target.value)
}

watch(
  () => id,
  async (currentId) => {
    if (currentId) {
      const response = (await $api.mailNotifications.getById(currentId)) as any
      setValues({
        ...response,
        short_name: response.short_name ?? response.name ?? '',
        description: response.description ?? '',
      })
      linkedUsers.value = response.users ?? []
      linkedDepartments.value = response.departments ?? []
    }
  },
  { immediate: true },
)

const availableUsers = computed(() => {
  return users.value.filter((user: any) => {
    return !linkedUsers.value.some((linkedUser: any) => linkedUser.id === user.id)
  })
})

const availableDepartments = computed(() => {
  return departments.value.filter((department: any) => {
    return !linkedDepartments.value.some((linkedDepartment: any) => linkedDepartment.id === department.id)
  })
})

const filteredAvailableUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  if (!q) return availableUsers.value
  return availableUsers.value.filter((u: any) => {
    const email = (u.email ?? '').toLowerCase()
    const name = (u.name ?? '').toLowerCase()
    return email.includes(q) || name.includes(q)
  })
})

function getUserPendingType(userId: number) {
  return userPendingTypes.value[userId] ?? defaultNotifyType.value
}

function setUserPendingType(userId: number, type: string) {
  userPendingTypes.value[userId] = type
}

async function linkUserQuick(user: any) {
  const type = getUserPendingType(user.id) as 'CC' | 'BCC'
  await $api.mailNotifications.linkUser(id, { user_id: user.id, type })
  const copy = { ...user }
  if (!copy.pivot) copy.pivot = {}
  copy.pivot.type = type
  linkedUsers.value.push(copy)
  snackbar.add({ type: 'success', text: 'User linked' })
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

const unlinkUser = async (user: any) => {
  await $api.mailNotifications.unlinkUser(id, { user_id: user.id })
  linkedUsers.value = linkedUsers.value.filter((u: any) => u.id !== user.id)
  snackbar.add({ type: 'success', text: 'User unlinked' })
}

const linkDepartment = async () => {
  if (!form.department) {
    snackbar.add({ type: 'warning', text: 'Please select a department' })
    return
  }
  await $api.mailNotifications.linkDepartment(id, { department_id: form.department })
  const department = departments.value.find((d: any) => d.id === form.department)
  linkedDepartments.value.push(department)
  form.department = null
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
  
  const allNotifications = await $api.mailNotifications.getMailNotifications()
  otherNotifications.value = (allNotifications?.data ?? []).filter((n: any) => n.id !== parseInt(id))
  
  // Load email count immediately on mount
  await loadLinkedEmails()
})
</script>
