import type { IOperationalDailyReport, IOperationalDashboard } from '~/repository/modules/operationalInfo'

interface OperationalInfoState {
  dashboard: IOperationalDashboard | null
  isDashboardLoading: boolean
  currentReport: IOperationalDailyReport | null
  suggestedValues: Record<string, number> | null
  isReportLoading: boolean
  isSaving: boolean
  history: IOperationalDailyReport[]
  historyPagination: {
    currentPage: number
    lastPage: number
    total: number
    perPage: number
  }
}

export function useOperationalInfo() {
  const api = useApiFactory()

  const state = reactive<OperationalInfoState>({
    dashboard: null,
    isDashboardLoading: false,
    currentReport: null,
    suggestedValues: null,
    isReportLoading: false,
    isSaving: false,
    history: [],
    historyPagination: {
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 15,
    },
  })

  const fetchDashboard = async (startDate: string, endDate: string) => {
    state.isDashboardLoading = true
    try {
      const res = await api.operationalInfo.dashboard({ start_date: startDate, end_date: endDate })
      state.dashboard = res.data ?? null
    } catch (e) {
      console.error('[OperationalInfo] Failed to fetch dashboard:', e)
    } finally {
      state.isDashboardLoading = false
    }
  }

  const fetchHistory = async (page = 1) => {
    try {
      const res = await api.operationalInfo.reportsHistory({
        page: String(page),
        per_page: String(state.historyPagination.perPage),
      })
      state.history = res.data ?? []
      state.historyPagination = {
        currentPage: res.current_page ?? 1,
        lastPage: res.last_page ?? 1,
        total: res.total ?? 0,
        perPage: res.per_page ?? 15,
      }
    } catch (e) {
      console.error('[OperationalInfo] Failed to fetch history:', e)
    }
  }

  const fetchReportForDate = async (date: string) => {
    state.isReportLoading = true
    try {
      const res = await api.operationalInfo.showReport(date)
      state.currentReport = res.data ?? null
    } catch (e) {
      console.error('[OperationalInfo] Failed to fetch report:', e)
      state.currentReport = null
    } finally {
      state.isReportLoading = false
    }
  }

  const fetchSuggestedValues = async (date: string) => {
    try {
      const res = await api.operationalInfo.suggestedValues(date)
      state.suggestedValues = res.data ?? null
      return state.suggestedValues
    } catch (e) {
      console.error('[OperationalInfo] Failed to fetch suggested values:', e)
      return null
    }
  }

  const saveReport = async (date: string, payload: Record<string, any>) => {
    state.isSaving = true
    try {
      const res = await api.operationalInfo.storeOrUpdateReport(date, payload)
      state.currentReport = res.data ?? null
      await fetchHistory(1)
      return state.currentReport
    } catch (e) {
      console.error('[OperationalInfo] Failed to save report:', e)
      throw e
    } finally {
      state.isSaving = false
    }
  }

  return {
    state,
    fetchDashboard,
    fetchHistory,
    fetchReportForDate,
    fetchSuggestedValues,
    saveReport,
  }
}
