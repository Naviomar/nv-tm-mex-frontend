<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-2">
          <v-text-field v-model="filters.name" density="compact" label="Name" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.tax_number" density="compact" label="Tax number" />
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
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Legal name</th>
              <th class="text-left">Tax number</th>
              <th class="text-left">Contact</th>
              <th class="text-left">Email</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in beneficiaries.data"
              :key="`beneficiary-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': item.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="item" @click="viewBeneficiary(item)" />
                  <EditButton :item="item" @click="editBeneficiary(item)" />
                  <TrashButton :item="item" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.legal_name }}</td>
              <td>{{ item.tax_number }}</td>
              <td>{{ item.contact_name }}</td>
              <td>{{ item.email }}</td>
              <td>
                <UserInfoBadge :item="item">
                  {{ formatDateString(item.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="beneficiaries.current_page"
          :length="beneficiaries.last_page"
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
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref({
  name: '',
  tax_number: '',
  deleted_status: null,
})

const beneficiaries = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  beneficiaries.value.current_page = page
  await getBeneficiaries()
}

const onClickFilters = async () => {
  beneficiaries.value.current_page = 1
  await getBeneficiaries()
}

const editBeneficiary = (beneficiary: any) => {
  router.push(`/configuration/beneficiaries/edit-${beneficiary.id}`)
}

const viewBeneficiary = (beneficiary: any) => {
  router.push(`/configuration/beneficiaries/view-${beneficiary.id}`)
}

const showConfirmDelete = async (beneficiary: any) => {
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
      await $api.beneficiaries.delete(beneficiary.id)
      snackbar.add({ type: 'success', text: 'Beneficiary updated' })
      await getBeneficiaries()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getBeneficiaries = async () => {
  try {
    loadingStore.start()
    const response = await $api.beneficiaries.getBeneficiaries({
      query: {
        page: beneficiaries.value.current_page,
        perPage: beneficiaries.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    beneficiaries.value = response as any
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
    tax_number: '',
    deleted_status: null,
  }
  await getBeneficiaries()
}

onMounted(async () => {
  await getBeneficiaries()
})
</script>
