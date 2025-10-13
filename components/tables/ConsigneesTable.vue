<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-4 mb-4">
        <div class="col-span-1">
          <v-text-field v-model="filters.name" clearable density="compact" label="Search by name" hide-details />
        </div>
        <div class="col-span-1">
          <v-text-field
            v-model="filters.contacto"
            clearable
            density="compact"
            label="Search by contacto"
            hide-details
          />
        </div>
        <div class="col-span-1">
          <v-text-field v-model="filters.tax_number" clearable density="compact" label="RFC" hide-details />
        </div>
        <div class="col-span-1">
          <v-autocomplete
            v-model="filters.encomienda"
            density="compact"
            :items="[
              { text: 'Yes', value: 1 },
              { text: 'No', value: 0 },
            ]"
            item-title="text"
            item-value="value"
            label="C. Encomienda"
            hide-details
          />
        </div>
        <div class="col-span-1">
          <v-autocomplete
            v-model="filters.hasWarrantyLetters"
            density="compact"
            :items="[
              { text: 'Yes', value: 1 },
              { text: 'No', value: 0 },
            ]"
            item-title="text"
            item-value="value"
            label="Has warranty letters"
            hide-details
          />
        </div>
        <div class="col-span-1">
          <v-text-field v-model="filters.nameGroup" clearable density="compact" label="Name group" hide-details />
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
        <div class="col-span-1">
          <v-autocomplete
            density="compact"
            label="Grouped?"
            v-model="filters.with_group"
            :items="[
              { text: 'Yes', value: 1 },
              { text: 'No', value: 0 },
            ]"
            item-title="text"
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
          v-model="consignees.current_page"
          :length="consignees.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Code</th>
              <th class="text-left">Name</th>
              <th class="text-left">Contacto</th>
              <th class="text-left">Executive</th>
              <th class="text-left">RFC</th>
              <th class="text-left">C. Encomienda</th>
              <th class="text-left">C. Garantia</th>
              <th class="text-left">Group</th>
              <th class="text-left">Enable</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(consignee, index) in consignees.data"
              :key="`consignee-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': consignee.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="consignee" @click="viewCustomer(consignee)" />
                  <EditButton :item="consignee" @click="editCustomer(consignee)" />
                  <TrashButton :item="consignee" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ consignee.code }}</td>
              <td>{{ consignee.name }}</td>
              <td>{{ consignee.contact_name }}</td>
              <td>
                {{ getFirstExecutive(consignee) }}
              </td>
              <td>{{ consignee.tax_number }}</td>
              <td>{{ consignee.entrust_letters?.length > 0 ? 'Si tiene' : 'No tiene' }}</td>
              <td>{{ consignee.warranty_letters?.length > 0 ? 'Si tiene' : 'No tiene' }}</td>
              <td>
                <div v-if="consignee.consignee_group == null">
                  {{ 'No group' }}
                </div>
                <div v-if="consignee.consignee_group != null">
                  <v-chip
                    color="green"
                    variant="outlined"
                    size="small"
                    class="cursor-pointer"
                    @click="viewConsigneeGroup(consignee)"
                  >
                    <v-icon class="mr-1">mdi-eye-outline</v-icon>
                    {{ consignee.consignee_group.name }}
                  </v-chip>
                </div>
              </td>
              <td>
                <v-chip v-if="consignee.is_active" color="green" text-color="white" size="small">
                  <v-icon>mdi-check</v-icon>Enabled</v-chip
                >
                <v-chip v-if="!consignee.is_active" color="red" text-color="white" size="small">
                  <v-icon>mdi-close</v-icon>Disabled</v-chip
                >
              </td>
              <td>
                <UserInfoBadge :item="consignee">
                  {{ formatDateString(consignee.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="consignees.current_page"
          :length="consignees.last_page"
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
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const router = useRouter()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref({
  name: '',
  hasWarrantyLetters: '',
  contacto: '',
  encomienda: '',
  nameGroup: '',
  deleted_status: '',
  tax_number: '',
  with_group: '',
})

const consignees = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  consignees.value.current_page = page
  await getConsignees()
}

const onClickFilters = async () => {
  // set current page to 1
  consignees.value.current_page = 1
  await getConsignees()
}

const getFirstExecutive = (consignee: any) => {
  if (consignee.consignee_executives.length > 0) {
    return consignee.consignee_executives[0].executive?.name
  }
  return 'No executive'
}

const viewCustomer = (consignee: any) => {
  router.push(`/configuration/customers/view-${consignee.id}`)
}

const editCustomer = async (consignee: any) => {
  router.push(`/configuration/customers/edit-${consignee.id}`)
}

const showConfirmDelete = async (consignee: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this consignee.',
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
      const response = await $api.consignees.delete(consignee.id)
      snackbar.add({
        type: 'success',
        text: `${consignee.name} ${consignee.deleted_at == null ? 'deleted' : 'restored'}`,
      })
      await getConsignees()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const viewConsigneeGroup = (consignee: any) => {
  router.push(`/configuration/customers/groups/${consignee.consignee_group.id}`)
}

const getConsignees = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.consignees.getConsignees({
      query: {
        page: consignees.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    consignees.value = response as any
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

const clearFilters = async () => {
  filters.value = {
    name: '',
    hasWarrantyLetters: '',
    contacto: '',
    encomienda: '',
    nameGroup: '',
    deleted_status: '',
    tax_number: '',
    with_group: '',
  }
  await getConsignees()
}

onMounted(async () => {
  await getConsignees()
})
</script>
