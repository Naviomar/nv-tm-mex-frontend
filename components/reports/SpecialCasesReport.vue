<template>
  <div class="special-cases">
    <div class="sc-header">
      <div class="sc-header-icon">
        <v-icon color="white" size="28">mdi-folder-star-outline</v-icon>
      </div>
      <div>
        <h2 class="sc-title">Special Cases</h2>
        <p class="sc-subtitle">Past debts covered with money that arrives later</p>
      </div>
      <v-spacer />
      <v-btn variant="outlined" color="primary" size="small" prepend-icon="mdi-percent-outline" @click="ivaDialog = true">IVA report</v-btn>
      <v-btn v-if="canManage" color="primary" size="small" prepend-icon="mdi-plus" @click="wizard = true">New case</v-btn>
      <v-btn variant="outlined" color="primary" size="small" :loading="loadingCases" prepend-icon="mdi-refresh" @click="loadCases">Refresh</v-btn>
    </div>

    <div v-if="loadingCases && !cases.length" class="d-flex justify-center pa-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <v-alert v-else-if="!cases.length" type="info" variant="tonal" class="ma-4">
      No special cases yet.
      <template v-if="canManage"> Create one with “New case”.</template>
    </v-alert>

    <template v-else>
      <v-row class="px-4 pt-4" dense>
        <v-col v-for="item in cases" :key="item.id" cols="12" sm="6" lg="4" xl="3">
          <SpecialCaseCard :item="item" :active="item.id === selectedId" @select="selectCase(item.id)" />
        </v-col>
      </v-row>

      <div v-if="loadingDetail && !detail" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else-if="detail" class="pa-4 d-flex flex-column ga-4">
        <SpecialCaseHeadline
          :summary="detail.case"
          :ready="detail.ready"
          :alerts="detail.alerts"
          :can-manage="canManage"
          @apply="applyDialog = true"
          @toggle-pause="togglePause"
        />

        <v-card class="sc-card" elevation="0">
          <v-tabs v-model="tab" color="primary" density="comfortable" @update:model-value="onTab">
            <v-tab value="debt">Debt</v-tab>
            <v-tab value="funding">{{ detail.case.mode === 'upfront' ? 'Recovery' : detail.case.mode === 'on_rebate_payment' ? 'Rebate' : 'Money' }}</v-tab>
            <v-tab value="activity">Activity</v-tab>
            <v-tab value="impact">Profit effect</v-tab>
            <v-tab value="about">How it works</v-tab>
          </v-tabs>
          <v-divider />

          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="debt">
              <div class="pa-4"><SpecialCaseDebtPanel :debts="detail.debts" /></div>
            </v-tabs-window-item>

            <v-tabs-window-item value="funding">
              <div class="pa-4">
                <SpecialCaseFundingPanel
                  :sources="detail.sources"
                  :upcoming="detail.upcoming"
                  :candidates="detail.retention_candidates"
                  :mode="detail.case.mode"
                  :to-recover="detail.case.to_recover"
                  :can-manage="canManage"
                  @recover="askRecover"
                />
              </div>
            </v-tabs-window-item>

            <v-tabs-window-item value="activity">
              <div class="pa-4"><SpecialCaseActivityPanel :activity="detail.activity" :can-manage="canManage" @reverse="askReverse" /></div>
            </v-tabs-window-item>

            <v-tabs-window-item value="impact">
              <div class="pa-4"><SpecialCaseImpactPanel :impact="impact" :loading="loadingImpact" /></div>
            </v-tabs-window-item>

            <v-tabs-window-item value="about">
              <div class="pa-4">
                <p v-if="detail.description" class="mb-3">{{ detail.description }}</p>
                <ol class="sc-steps">
                  <li v-for="step in detail.steps" :key="step">{{ step }}</li>
                </ol>
                <div class="sc-muted mt-4">
                  Case code <strong>{{ detail.case.code }}</strong> · money is applied from the oldest reference to the newest · every movement is recorded and reversible.
                </div>
              </div>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </div>
    </template>

    <SpecialCaseApplyDialog
      v-if="detail"
      v-model="applyDialog"
      :ready="detail.ready"
      :loading="working"
      :has-notes="detail.case.mode === 'on_funding'"
      @confirm="applyCase"
    />

    <SpecialCaseWizard v-model="wizard" @created="onCreated" />
    <SpecialCaseIvaDialog v-model="ivaDialog" />

    <v-dialog v-model="recoverDialog.open" max-width="440">
      <v-card class="sc-card" elevation="0">
        <v-card-title class="pa-5 pb-2">Withhold rebate</v-card-title>
        <v-card-text class="px-5">
          <div class="sc-muted mb-3">
            {{ recoverDialog.item?.reference }} · rebate available {{ formatCurrency(recoverDialog.item?.remaining ?? 0) }} · to recover {{ formatCurrency(detail?.case.to_recover ?? 0) }}
          </div>
          <v-text-field v-model.number="recoverDialog.amount" type="number" label="Amount to withhold" density="comfortable" variant="outlined" hide-details />
        </v-card-text>
        <v-card-actions class="tm-dialog-actions pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="recoverDialog.open = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="working" :disabled="!recoverDialog.amount || recoverDialog.amount <= 0" @click="recover">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="reverseDialog.open" max-width="440">
      <v-card class="sc-card" elevation="0">
        <v-card-title class="pa-5 pb-2">Reverse movement</v-card-title>
        <v-card-text class="px-5">
          This undoes the {{ formatCurrency(reverseDialog.item?.amount ?? 0) }} movement and returns the money to the case. It can be applied again later.
        </v-card-text>
        <v-card-actions class="tm-dialog-actions pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="reverseDialog.open = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="working" @click="reverse">Reverse</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const { formatCurrency } = useReportFormatters()
const { hasPermission } = useCheckUser()
const showErrors = useShowErrors2()

const canManage = computed(() => hasPermission('reports-special-cases-manage'))

const cases = ref<any[]>([])
const selectedId = ref<number | null>(null)
const detail = ref<any | null>(null)
const impact = ref<any | null>(null)
const tab = ref('debt')
const loadingCases = ref(false)
const loadingDetail = ref(false)
const loadingImpact = ref(false)
const working = ref(false)
const wizard = ref(false)
const ivaDialog = ref(false)
const applyDialog = ref(false)
const recoverDialog = reactive<{ open: boolean; item: any | null; amount: number | null }>({ open: false, item: null, amount: null })
const reverseDialog = reactive<{ open: boolean; item: any | null }>({ open: false, item: null })

const loadCases = async () => {
  loadingCases.value = true
  try {
    const response = await $api.specialCases.getCases()
    cases.value = response.data || []
    const current = cases.value.find((item) => item.id === selectedId.value) ?? cases.value[0]
    if (current) {
      await selectCase(current.id)
    }
  } catch (error) {
    snackbar.add({ type: 'error', text: 'Could not load special cases' })
  } finally {
    loadingCases.value = false
  }
}

const loadDetail = async (id: number) => {
  loadingDetail.value = true
  try {
    const response = await $api.specialCases.getCase(id)
    detail.value = response.data
    const index = cases.value.findIndex((item) => item.id === id)
    if (index >= 0) cases.value[index] = response.data.case
  } catch (error) {
    detail.value = null
    snackbar.add({ type: 'error', text: 'Could not load the case' })
  } finally {
    loadingDetail.value = false
  }
}

const loadImpact = async () => {
  if (!selectedId.value) return
  loadingImpact.value = true
  try {
    impact.value = (await $api.specialCases.getImpact(selectedId.value)).data
  } catch (error) {
    snackbar.add({ type: 'error', text: 'Could not load the profit effect' })
  } finally {
    loadingImpact.value = false
  }
}

const selectCase = async (id: number) => {
  selectedId.value = id
  impact.value = null
  await loadDetail(id)
  if (tab.value === 'impact') loadImpact()
}

const onTab = (value: unknown) => {
  if (value === 'impact' && !impact.value) loadImpact()
}

const refreshCurrent = async () => {
  if (!selectedId.value) return
  impact.value = null
  await loadDetail(selectedId.value)
  if (tab.value === 'impact') loadImpact()
}

const run = async (action: () => Promise<any>, success: string) => {
  working.value = true
  try {
    await action()
    snackbar.add({ type: 'success', text: success })
    await refreshCurrent()
    return true
  } catch (error: any) {
    showErrors.show(error)
    await refreshCurrent()
    return false
  } finally {
    working.value = false
  }
}

const applyCase = async () => {
  if (!selectedId.value) return
  if (await run(() => $api.specialCases.apply(selectedId.value as number), 'Movements applied')) applyDialog.value = false
}

const togglePause = () => {
  if (!detail.value) return
  const status = detail.value.case.status === 'paused' ? 'active' : 'paused'
  run(() => $api.specialCases.setStatus(detail.value.case.id, status), status === 'paused' ? 'Case paused' : 'Case resumed')
}

const askRecover = (item: any) => {
  recoverDialog.item = item
  recoverDialog.amount = Math.min(item.remaining, detail.value?.case.to_recover ?? item.remaining)
  recoverDialog.open = true
}

const recover = async () => {
  if (!selectedId.value || !recoverDialog.item) return
  const item = recoverDialog.item
  const ok = await run(
    () => $api.specialCases.recover(selectedId.value as number, { system: item.system, external_id: item.external_id, amount: Number(recoverDialog.amount) }),
    'Retention recorded',
  )
  if (ok) recoverDialog.open = false
}

const askReverse = (item: any) => {
  reverseDialog.item = item
  reverseDialog.open = true
}

const reverse = async () => {
  if (!selectedId.value || !reverseDialog.item) return
  const ok = await run(() => $api.specialCases.reverse(selectedId.value as number, reverseDialog.item.id), 'Movement reversed')
  if (ok) reverseDialog.open = false
}

const onCreated = async (id: number) => {
  await loadCases()
  await selectCase(id)
}

onMounted(loadCases)
</script>

<style>
/* Shared by every component in components/reports/special-cases */
.special-cases .sc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.special-cases .sc-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgb(var(--v-theme-primary));
}

.special-cases .sc-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.special-cases .sc-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.special-cases .sc-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
}

.special-cases .sc-case-card {
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.special-cases .sc-case-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.35);
}

.special-cases .sc-case-card--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
}

.special-cases .sc-case-name {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.special-cases .sc-case-pending {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgb(var(--v-theme-on-surface));
}

.special-cases .sc-detail-title {
  font-size: 1.125rem;
  font-weight: 700;
}

.special-cases .sc-big {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.1;
}

.special-cases .sc-muted {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.special-cases .sc-stat {
  padding: 10px 12px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 10px;
}

.special-cases .sc-stat-value {
  margin-top: 2px;
  font-size: 1.125rem;
  font-weight: 700;
}

.special-cases .sc-next {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 0.875rem;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.08);
}

.special-cases .sc-section-title {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.95rem;
  font-weight: 600;
}

.special-cases .sc-steps {
  padding-left: 20px;
  list-style: decimal;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.75);
}

.special-cases .sc-nested {
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.special-cases .sc-total-row td {
  padding: 10px 16px;
  font-size: 0.875rem;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-on-surface), 0.04);
}
</style>
