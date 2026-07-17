<template>
  <div class="restrictions-panel">
    <!-- Full Access Banner -->
    <v-alert
      v-if="!loading && !summary.is_restricted"
      type="info"
      variant="tonal"
      density="compact"
      class="mb-4"
      prepend-icon="mdi-shield-check"
    >
      This user has <strong>full access</strong> to all data. Add a restriction below to limit their visibility.
    </v-alert>

    <!-- Restricted Banner -->
    <v-alert
      v-if="!loading && summary.is_restricted"
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-4"
      prepend-icon="mdi-shield-lock"
    >
      This user has <strong>restricted access</strong>. They can only see data for the executives and customers listed below.
    </v-alert>

    <!-- Section 1: Executive Access -->
    <div class="restriction-section mb-5">
      <div class="restriction-header d-flex align-center mb-3">
        <v-icon color="primary" size="18" class="mr-2">mdi-account-tie</v-icon>
        <span class="restriction-title">Executive Access</span>
        <v-chip size="x-small" color="primary" variant="tonal" class="ml-2">
          {{ executiveRestrictions.length }}
        </v-chip>
      </div>
      <p class="text-body-2 text-grey-darken-1 mb-3">
        Assigning an executive grants the user access to all customers associated with that executive.
      </p>

      <!-- Add Executive -->
      <div class="d-flex gap-2 mb-4 align-center">
        <v-autocomplete
          v-model="selectedExecutive"
          :items="executives"
          item-title="name"
          item-value="id"
          label="Search executive to add"
          density="compact"
          hide-details
          prepend-inner-icon="mdi-magnify"
          clearable
          variant="outlined"
          class="flex-grow-1"
        />
        <v-btn
          color="primary"
          size="small"
          variant="tonal"
          :disabled="!selectedExecutive"
          :loading="addingExecutive"
          @click="addExecutiveRestriction"
          prepend-icon="mdi-plus"
        >
          Add
        </v-btn>
      </div>

      <!-- Executive List -->
      <div v-if="executiveRestrictions.length === 0" class="empty-state">
        <v-icon size="large" class="mb-1">mdi-account-tie-outline</v-icon>
        <div class="text-body-2">No executives assigned</div>
      </div>
      <div v-else class="d-flex flex-wrap gap-2">
        <v-chip
          v-for="rest in executiveRestrictions"
          :key="`exec-${rest.id}`"
          :color="rest.is_active ? 'primary' : 'grey'"
          :variant="rest.is_active ? 'tonal' : 'outlined'"
          size="large"
          closable
          @click:close="deleteRestriction(rest)"
        >
          <v-icon start size="small">mdi-account-tie</v-icon>
          {{ rest.executive?.name || `Executive #${rest.executive_id}` }}
        </v-chip>
      </div>
    </div>

    <!-- Section 2: Individual Customer Access -->
    <div class="restriction-section mb-5">
      <div class="restriction-header d-flex align-center mb-3">
        <v-icon color="teal" size="18" class="mr-2">mdi-domain</v-icon>
        <span class="restriction-title">Individual Customer Access</span>
        <v-chip size="x-small" color="teal" variant="tonal" class="ml-2">
          {{ customerRestrictions.length }}
        </v-chip>
      </div>
      <p class="text-body-2 text-grey-darken-1 mb-3">
        Assign individual customers to grant access beyond what executives provide.
      </p>

      <!-- Add Customer -->
      <div class="d-flex gap-2 mb-4 align-center">
        <ACustomerSearch
          v-model="selectedCustomer"
          label="customer"
          class="flex-grow-1"
          @onSelect="onCustomerSelect"
        />
        <v-btn
          color="teal"
          size="small"
          variant="tonal"
          :disabled="!selectedCustomer"
          :loading="addingCustomer"
          @click="addCustomerRestriction"
          prepend-icon="mdi-plus"
        >
          Add
        </v-btn>
      </div>

      <!-- Customer List -->
      <div v-if="customerRestrictions.length === 0" class="empty-state">
        <v-icon size="large" class="mb-1">mdi-domain-outline</v-icon>
        <div class="text-body-2">No individual customers assigned</div>
      </div>
      <div v-else class="customer-list">
        <div
          v-for="rest in customerRestrictions"
          :key="`cust-${rest.id}`"
          class="customer-row"
        >
          <div class="d-flex align-center">
            <v-icon size="small" color="teal" class="mr-2">mdi-domain</v-icon>
            <span class="text-body-2">{{ rest.consignee?.name || `Customer #${rest.consignee_id}` }}</span>
          </div>
          <div class="d-flex align-center gap-2">
            <v-switch
              :model-value="hasCreateInvoiceScope(rest)"
              label="Create Invoice"
              color="teal"
              density="compact"
              hide-details
              :loading="togglingScope === rest.id"
              :disabled="togglingScope === rest.id"
              @update:model-value="toggleCreateInvoiceScope(rest)"
            />
            <v-chip
              :color="rest.is_active ? 'success' : 'grey'"
              size="x-small"
              variant="tonal"
            >
              {{ rest.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
            <v-btn
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              @click="deleteRestriction(rest)"
            />
          </div>
        </div>
      </div>
      <p v-if="hasAnyCreateInvoiceScope" class="text-caption text-grey-darken-1 mt-2">
        <v-icon size="x-small" color="teal">mdi-information-outline</v-icon>
        With "Create Invoice" enabled on at least one customer, this user's invoice-creation customer picker is
        limited to <strong>only</strong> the customer(s) marked below — regardless of any other executive or
        customer access they have. Note: adding any restriction here (including just for "Create Invoice") still
        marks this user as restricted, which also hides the reference catalogs' "view" action and the invoicing
        search menu for them — same as any other assigned customer or executive.
      </p>
    </div>

    <!-- Section 3: Access Summary -->
    <div class="restriction-section">
      <div class="restriction-header d-flex align-center mb-3">
        <v-icon color="success" size="18" class="mr-2">mdi-clipboard-list-outline</v-icon>
        <span class="restriction-title">Access Summary</span>
      </div>
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" size="small" />
      </div>
      <div v-else-if="!summary.is_restricted" class="text-body-2 text-grey-darken-1">
        <v-icon color="success" size="small" class="mr-1">mdi-check-circle</v-icon>
        Full access — no restrictions applied.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="summary-card">
          <div class="text-caption text-grey-darken-1 mb-1">Assigned Executives</div>
          <div class="text-h6 font-weight-bold">{{ summary.executives?.length || 0 }}</div>
          <div v-if="summary.executives?.length" class="mt-2 d-flex flex-wrap gap-1">
            <v-chip
              v-for="exec in summary.executives"
              :key="`sum-exec-${exec.id}`"
              size="x-small"
              color="primary"
              variant="tonal"
            >
              {{ exec.name }}
            </v-chip>
          </div>
        </div>
        <div class="summary-card">
          <div class="text-caption text-grey-darken-1 mb-1">Total Visible Customers</div>
          <div class="text-h6 font-weight-bold">{{ summary.total_visible_customers ?? 0 }}</div>
          <div class="text-caption text-grey-darken-1 mt-1">
            From executives + individually assigned
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  userId: {
    type: [String, Number],
    required: true,
  },
})

const loading = ref(true)
const addingExecutive = ref(false)
const addingCustomer = ref(false)
const selectedExecutive = ref<number | null>(null)
const selectedCustomer = ref<number | string | null>(null)
const executives = ref<any[]>([])

interface RestrictionItem {
  id: number
  restriction_type: 'executive' | 'customer'
  executive_id: number | null
  consignee_id: number | null
  is_active: boolean
  scopes?: string[] | null
  executive?: { id: number; name: string }
  consignee?: { id: number; name: string }
}

const CREATE_INVOICE_SCOPE = 'create-invoice'
const togglingScope = ref<number | null>(null)

interface SummaryData {
  is_restricted: boolean
  executives: { id: number; name: string }[]
  direct_customers: { id: number; name: string }[]
  total_visible_customers: number | null
}

const restrictions = ref<RestrictionItem[]>([])
const summary = ref<SummaryData>({
  is_restricted: false,
  executives: [],
  direct_customers: [],
  total_visible_customers: null,
})

const executiveRestrictions = computed(() =>
  restrictions.value.filter(r => r.restriction_type === 'executive')
)

const customerRestrictions = computed(() =>
  restrictions.value.filter(r => r.restriction_type === 'customer')
)

const hasCreateInvoiceScope = (rest: RestrictionItem) => !!rest.scopes?.includes(CREATE_INVOICE_SCOPE)

const hasAnyCreateInvoiceScope = computed(() =>
  customerRestrictions.value.some(hasCreateInvoiceScope)
)

const toggleCreateInvoiceScope = async (rest: RestrictionItem) => {
  const enabled = !hasCreateInvoiceScope(rest)
  const newScopes = enabled
    ? [...(rest.scopes || []), CREATE_INVOICE_SCOPE]
    : (rest.scopes || []).filter(s => s !== CREATE_INVOICE_SCOPE)

  togglingScope.value = rest.id
  try {
    await $api.userDataRestrictions.update(props.userId, rest.id, { scopes: newScopes } as any)
    rest.scopes = newScopes
    snackbar.add({ type: 'success', text: enabled ? 'Customer marked as invoiceable' : 'Invoice restriction removed' })
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Error updating restriction' })
  } finally {
    togglingScope.value = null
  }
}

const onCustomerSelect = (val: any) => {
  if (val && typeof val === 'object') {
    selectedCustomer.value = val.id
  } else {
    selectedCustomer.value = val
  }
}

const fetchRestrictions = async () => {
  try {
    loadingStore.start()
    const response = await $api.userDataRestrictions.list(props.userId)
    restrictions.value = response?.data || []
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading restrictions' })
  } finally {
    loadingStore.stop()
  }
}

const fetchSummary = async () => {
  try {
    const response = await $api.userDataRestrictions.getSummary(props.userId)
    summary.value = response || summary.value
  } catch (e) {
    console.error(e)
  }
}

const fetchExecutives = async () => {
  try {
    const response = await $api.executives.getExecutives()
    executives.value = Array.isArray(response) ? response : (response?.data || [])
  } catch (e) {
    console.error(e)
  }
}

const addExecutiveRestriction = async () => {
  if (!selectedExecutive.value) return
  addingExecutive.value = true
  try {
    await $api.userDataRestrictions.create(props.userId, {
      restriction_type: 'executive',
      executive_id: selectedExecutive.value,
      is_active: true,
    } as any)
    snackbar.add({ type: 'success', text: 'Executive restriction added' })
    selectedExecutive.value = null
    await Promise.all([fetchRestrictions(), fetchSummary()])
  } catch (e: any) {
    const msg = e?.response?._data?.message || 'Error adding restriction'
    snackbar.add({ type: 'error', text: msg })
  } finally {
    addingExecutive.value = false
  }
}

const addCustomerRestriction = async () => {
  if (!selectedCustomer.value) return
  addingCustomer.value = true
  try {
    await $api.userDataRestrictions.create(props.userId, {
      restriction_type: 'customer',
      consignee_id: Number(selectedCustomer.value),
      is_active: true,
    } as any)
    snackbar.add({ type: 'success', text: 'Customer restriction added' })
    selectedCustomer.value = null
    await Promise.all([fetchRestrictions(), fetchSummary()])
  } catch (e: any) {
    const msg = e?.response?._data?.message || 'Error adding restriction'
    snackbar.add({ type: 'error', text: msg })
  } finally {
    addingCustomer.value = false
  }
}

const deleteRestriction = async (rest: RestrictionItem) => {
  try {
    loadingStore.start()
    await $api.userDataRestrictions.delete(props.userId, rest.id)
    snackbar.add({ type: 'success', text: 'Restriction removed' })
    await Promise.all([fetchRestrictions(), fetchSummary()])
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Error removing restriction' })
  } finally {
    loadingStore.stop()
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchExecutives(), fetchRestrictions(), fetchSummary()])
  loading.value = false
})
</script>

<style scoped>
.restrictions-panel {
  width: 100%;
}

.restriction-section {
  padding: 16px 20px;
  border-radius: 10px;
  background: rgba(var(--v-theme-surface), 0.6);
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.restriction-header {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.restriction-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.82);
  letter-spacing: 0.3px;
}

.empty-state {
  text-align: center;
  padding: 20px 0;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.empty-state .v-icon {
  opacity: 0.5;
}

.customer-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.customer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-border-color), 0.06);
  transition: border-color 0.2s ease;
}

.customer-row:hover {
  border-color: rgba(var(--v-theme-primary), 0.15);
}

.summary-card {
  padding: 14px 16px;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-border-color), 0.06);
}

.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
</style>
