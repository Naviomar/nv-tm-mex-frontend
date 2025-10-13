<template>
  <div>
    <div class="mb-4">
      <div>Add more customers</div>
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <AGlobalSearch
            v-model="form.consignee"
            :onSearch="searchCustomers"
            validate-key="customer_id"
            :return-object="true"
            label="Search customers"
          />
        </div>
        <div class="col-span-3">
          <div v-if="form.consignee">
            <v-btn color="purple" size="small" @click="linkCustomerToGroup"> Add customer to group </v-btn>
            <div>Note: If customer in other group will be removed from there.</div>
          </div>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-title>
        <div class="flex gap-2 items-center">
          <v-icon>mdi-account-group-outline</v-icon>
          <h3>{{ consigneeGroup.name }} Group</h3>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="font-bold text-base">Customers linked to group</div>

        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left w-20">Actions</th>
              <th class="text-left">Consignee</th>
              <th class="text-left">Code</th>
              <th class="text-left">Contact Name</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(consignee, index) in consigneeGroup.consignees" :key="`consignee-${index}`">
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="consignee" @click="viewConsignee(consignee)" />
                  <TrashButton :item="consignee" @click="showConfirmDelete(consignee)" />
                </div>
              </td>
              <td>{{ consignee.name }}</td>
              <td>{{ consignee.code }}</td>
              <td>{{ consignee.contact_name }}</td>
              <td>
                <UserInfoBadge :item="consignee">
                  {{ formatDateString(consignee.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const route = useRoute()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const id = route.params.id

const form = ref<any>({
  consignee_id: null,
  consignee: null,
  customers: [],
})

const consigneeGroup = ref<any>({
  consignees: [],
})

const viewConsignee = (consignee: any) => {
  router.push(`/configuration/customers/view-${consignee.id}`)
}

const showConfirmDelete = async (consignee: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to remove customer from group.',
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
      const body = {
        consignee_group_id: id,
        consignee_id: consignee.id,
      }
      const response = await $api.consigneeGroups.removeCustomerFromGroup(body)
      snackbar.add({ type: 'success', text: 'Customer removed from group.' })
      await getCustomersInAGroup()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const searchCustomers = async (search: any) => {
  try {
    const response = await $api.consignees.searchConsignees({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching customers',
    })
  }
}

const linkCustomerToGroup = async () => {
  try {
    if (!form.value.consignee) {
      snackbar.add({ type: 'warning', text: 'Please select a customer' })
      return
    }
    loadingStore.loading = true
    const body = {
      consignee_group_id: id,
      consignee_id: form.value.consignee.id,
    }
    const response = await $api.consigneeGroups.linkCustomerToGroup(body)
    snackbar.add({ type: 'success', text: 'Customer added to group.' })
    form.value.consignee = null
    await getCustomersInAGroup()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCustomersInAGroup = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.consigneeGroups.getConsigneesInAGroup(id as string)

    consigneeGroup.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

await getCustomersInAGroup()
</script>
