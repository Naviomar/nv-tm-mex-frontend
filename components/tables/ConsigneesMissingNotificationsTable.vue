<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6 gap-3">
        <div class="col-span-3">
          <v-text-field v-model="filters.name" density="compact" label="Name"></v-text-field>
        </div>
        <div class="col-span-3">
          <v-autocomplete
            v-model="filters.mailNotificationId"
            :items="customerMailNotifications"
            item-value="id"
            label="Pending notification type"
            density="compact"
            clearable
            hide-details
            @update:model-value="onSearch"
          >
            <template v-slot:selection="{ item }">
              {{ formatNotificationName(item.raw.short_name) }}
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :title="formatNotificationName(item.raw.short_name)">
                <template v-slot:subtitle>{{ item.raw.description }}</template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2 align-center">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="onSearch"> Search </v-btn>
          <v-btn color="success" variant="tonal" prepend-icon="mdi-file-excel-outline" :loading="exportingExcel" @click="exportExcel">
            Download report
          </v-btn>
          <v-select
            v-model="limit"
            :items="perPageOptions"
            label="Per page"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 140px"
            @update:model-value="onChangeLimit"
          />
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
              <th class="text-left">Code</th>
              <th class="text-left">Missing notifications</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, index) in consignees.data" :key="`missing-noty-${index}`">
              <td>
                <v-btn size="x-small" variant="tonal" icon="mdi-eye-outline" color="primary" @click="openMatrix(c)" />
              </td>
              <td>{{ c.name }}</td>
              <td>{{ c.code }}</td>
              <td>
                <v-chip v-if="selectedNotificationLabel" size="small" color="error" variant="tonal" class="mr-1">
                  Missing: {{ selectedNotificationLabel }}
                </v-chip>
                <v-chip v-if="c.missing_count > 0" size="small" color="error" variant="tonal">
                  {{ c.missing_count }} / {{ c.total_tracked }} missing (overall)
                </v-chip>
                <v-chip v-else size="small" color="success" variant="tonal">
                  All covered
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
        <div class="d-flex align-center justify-space-between mt-2">
          <span class="text-caption text-medium-emphasis">{{ consignees.total }} customer(s)</span>
          <v-pagination
            v-model="consignees.current_page"
            :length="consignees.last_page"
            rounded="circle"
            density="compact"
            @update:model-value="onClickPagination"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>

    <ConsigneeNotificationsMatrix
      v-model:show="showMatrix"
      :emails="selectedConsignee?.consignee_emails"
      :catalogs="catalogs"
      :id="selectedConsignee?.id?.toString() ?? ''"
      :consignee-name="selectedConsignee?.name"
      @refresh="onMatrixRefresh"
    />
  </div>
</template>
<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
import { formatNotificationName } from '~/utils/mailNotifications'
import ConsigneeNotificationsMatrix from '~/components/forms/ConsigneeNotificationsMatrix.vue'

const { $api } = useNuxtApp()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const customerMailNotifications = [...mailNotifications]
  .filter((n: any) => n.is_for_consignee)
  .sort((a: any, b: any) => a.short_name.localeCompare(b.short_name))
const customerMailNotificationIds = customerMailNotifications.map((n: any) => n.id)

const filters = ref({
  name: '',
  mailNotificationId: null as number | null,
})

const perPageOptions = [10, 25, 50, 100]
const limit = ref(100)

const consignees = ref({
  data: [] as any,
  current_page: 1,
  last_page: 1,
  total: 0,
})

const selectedNotificationLabel = computed(() => {
  const noty = customerMailNotifications.find((n: any) => n.id === filters.value.mailNotificationId)
  return noty ? formatNotificationName(noty.short_name) : null
})

const catalogs = ref<any>(null)
const showMatrix = ref(false)
const selectedConsignee = ref<any>(null)
const exportingExcel = ref(false)

const getConsignees = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response: any = await $api.consignees.getMissingNotificationsSummary({
      query: {
        page: consignees.value.current_page,
        limit: limit.value,
        name: filters.value.name,
        mail_notification_ids: customerMailNotificationIds.join(','),
        mail_notification_id: filters.value.mailNotificationId ?? undefined,
      },
    })
    consignees.value = {
      data: response.data,
      current_page: response.current_page,
      last_page: response.last_page,
      total: response.total,
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

const onClickPagination = async (page: number) => {
  consignees.value.current_page = page
  await getConsignees()
}

const onChangeLimit = async () => {
  consignees.value.current_page = 1
  await getConsignees()
}

const onSearch = async () => {
  consignees.value.current_page = 1
  await getConsignees()
}

const clearFilters = async () => {
  filters.value = { name: '', mailNotificationId: null }
  consignees.value.current_page = 1
  await getConsignees()
}

const exportExcel = async () => {
  try {
    exportingExcel.value = true
    const response: any = await $api.consignees.exportMissingNotificationsExcel({
      query: {
        name: filters.value.name,
        mail_notification_ids: customerMailNotificationIds.join(','),
      },
    })

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const today = new Date()
    const datePart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    link.setAttribute('download', `reporte_notificaciones_clientes_${datePart}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    snackbar.add({
      text: 'Report generated and downloaded successfully.',
      type: 'success',
    })
  } catch (e) {
    console.error(e)
    snackbar.add({
      text: 'Error exporting the report.',
      type: 'error',
    })
  } finally {
    exportingExcel.value = false
  }
}

const openMatrix = async (consignee: any) => {
  try {
    loadingStore.loading = true
    if (!catalogs.value) {
      catalogs.value = await $api.consignees.getCatalogs()
    }
    const full = await $api.consignees.getById(consignee.id.toString())
    selectedConsignee.value = full
    showMatrix.value = true
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onMatrixRefresh = async () => {
  if (selectedConsignee.value?.id) {
    selectedConsignee.value = await $api.consignees.getById(selectedConsignee.value.id.toString())
  }
  await getConsignees()
}

await getConsignees()
</script>
