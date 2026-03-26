export type RateType = 1 | 2

export type NamedCatalog = {
  id: number
  name: string
}

export type RateRow = {
  id: number
  line_id: number
  line?: NamedCatalog | null
  container_type_id: number
  container_type?: NamedCatalog | null
  rate_type: RateType
  amount: number | string | null
  start_date: string | null
  end_date: string | null
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
}

export type MatrixCell = {
  rowId: number | null
  amount: number | null
  rateType: RateType
  startDate: string | null
  endDate: string | null
  deletedAt: string | null
  hasConflict: boolean
  raw: RateRow | null
}

export type MatrixRow = {
  container_type_id: number
  container_name: string
  rate1: MatrixCell | null
  rate2: MatrixCell | null
  status: 'ok' | 'incomplete' | 'inactive' | 'conflict'
  hasConflict: boolean
}

export type PeriodGroup = {
  key: string
  start_date: string | null
  end_date: string | null
  label: string
  status: 'active' | 'upcoming' | 'expired'
  is_active: boolean
  rows: MatrixRow[]
  rawRows: RateRow[]
  conflictsCount: number
  incompleteCount: number
}

export type LineGroup = {
  line_id: number
  line_name: string
  periods: PeriodGroup[]
  activePeriodKey: string | null
  conflictsCount: number
  incompleteCount: number
  totalRows: number
}

export type DraftCell = {
  rowId: number | null
  amount: number | null
  originalAmount: number | null
  startDate: string | null
  endDate: string | null
  originalStartDate: string | null
  originalEndDate: string | null
  suggested: boolean
  deletedAt: string | null
}

export type DraftRow = {
  container_type_id: number
  container_name: string
  startDate: string | null
  endDate: string | null
  originalStartDate: string | null
  originalEndDate: string | null
  suggestedDates: boolean
  rate1: DraftCell
  rate2: DraftCell
}

const INFINITY_DATE = '9999-12-31'

export function cleanContainerDelayQuery(query: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => {
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    })
  )
}

export async function fetchAllContainerDelayRates(api: any, query: Record<string, any> = {}) {
  const rows: RateRow[] = []
  let page = 1
  let lastPage = 1

  do {
    const response = await api.containerDelayRates.getRates({
      query: {
        page,
        limit: 500,
        ...cleanContainerDelayQuery(query),
      },
    })

    const data = normalizeRatesResponse(response)
    rows.push(...data)
    lastPage = Number(response?.last_page ?? 1)
    page += 1
  } while (page <= lastPage)

  return rows
}

export function normalizeRatesResponse(response: any): RateRow[] {
  return (response?.data ?? response ?? []) as RateRow[]
}

export function toDateOnly(value?: string | null) {
  if (!value) return null
  return `${value}`.slice(0, 10)
}

export function buildPeriodKey(startDate?: string | null, endDate?: string | null) {
  return `${toDateOnly(startDate) ?? 'null'}__${toDateOnly(endDate) ?? 'null'}`
}

export function formatCurrencyAmount(value?: number | string | null) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

export function formatDateLabel(value?: string | null) {
  const date = toDateOnly(value)
  if (!date) return 'Open'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export function getPeriodLabel(startDate?: string | null, endDate?: string | null) {
  return `${formatDateLabel(startDate)} → ${endDate ? formatDateLabel(endDate) : 'Open ended'}`
}

export function getPeriodStatus(startDate?: string | null, endDate?: string | null, onDate = todayKey()) {
  const start = toDateOnly(startDate)
  const end = toDateOnly(endDate)

  if (start && start > onDate) return 'upcoming'
  if (end && end < onDate) return 'expired'
  return 'active'
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function asAmount(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function rangesOverlap(
  startA?: string | null,
  endA?: string | null,
  startB?: string | null,
  endB?: string | null
) {
  const aStart = toDateOnly(startA) ?? todayKey()
  const aEnd = toDateOnly(endA) ?? INFINITY_DATE
  const bStart = toDateOnly(startB) ?? todayKey()
  const bEnd = toDateOnly(endB) ?? INFINITY_DATE

  return aStart <= bEnd && bStart <= aEnd
}

export function getConflictRateIds(rows: RateRow[]) {
  const conflictIds = new Set<number>()
  const groups = new Map<string, RateRow[]>()

  rows
    .filter((row) => !row.deleted_at)
    .forEach((row) => {
      const key = `${row.line_id}-${row.container_type_id}-${row.rate_type}`
      const bucket = groups.get(key) ?? []
      bucket.push(row)
      groups.set(key, bucket)
    })

  groups.forEach((bucket) => {
    const sorted = [...bucket].sort((a, b) => {
      const aStart = toDateOnly(a.start_date) ?? ''
      const bStart = toDateOnly(b.start_date) ?? ''
      return aStart.localeCompare(bStart)
    })

    for (let index = 0; index < sorted.length; index += 1) {
      for (let cursor = index + 1; cursor < sorted.length; cursor += 1) {
        const current = sorted[index]
        const next = sorted[cursor]

        if (!current || !next) {
          continue
        }

        if (!rangesOverlap(current.start_date, current.end_date, next.start_date, next.end_date)) {
          continue
        }

        if (current.id) conflictIds.add(current.id)
        if (next.id) conflictIds.add(next.id)
      }
    }
  })

  return conflictIds
}

function isRowActiveOnDate(row: RateRow, onDate = todayKey()) {
  const start = toDateOnly(row.start_date)
  const end = toDateOnly(row.end_date)

  if (start && start > onDate) return false
  if (end && end < onDate) return false
  return true
}

function getCoverageBounds(rows: RateRow[]) {
  const startDates = rows
    .map((row) => toDateOnly(row.start_date))
    .filter((value): value is string => Boolean(value))
    .sort()

  const endDates = rows
    .map((row) => toDateOnly(row.end_date))
    .filter((value): value is string => Boolean(value))
    .sort()

  return {
    startDate: startDates[0] ?? null,
    endDate: rows.some((row) => !toDateOnly(row.end_date)) ? null : endDates[endDates.length - 1] ?? null,
  }
}

function buildRowsForMatrix(
  periodRows: RateRow[],
  availableContainerTypes: NamedCatalog[],
  conflictIds: Set<number>,
  options: {
    includeEmptyContainers?: boolean
    containerTypeId?: number | null
  }
) {
  return availableContainerTypes
    .filter((containerType) => !options.containerTypeId || containerType.id === options.containerTypeId)
    .map((containerType) => {
      const containerRows = periodRows.filter((row) => row.container_type_id === containerType.id)
      const rate1Row = pickBestRate(containerRows, 1)
      const rate2Row = pickBestRate(containerRows, 2)
      const hasConflict = Boolean(
        (rate1Row?.id && conflictIds.has(rate1Row.id)) ||
          (rate2Row?.id && conflictIds.has(rate2Row.id)) ||
          containerRows.filter((row) => row.rate_type === 1).length > 1 ||
          containerRows.filter((row) => row.rate_type === 2).length > 1
      )

      const rate1Cell = rate1Row ? buildMatrixCell(rate1Row, 1, conflictIds) : null
      const rate2Cell = rate2Row ? buildMatrixCell(rate2Row, 2, conflictIds) : null

      let status: MatrixRow['status'] = 'ok'
      if (hasConflict) status = 'conflict'
      else if (!rate1Cell || !rate2Cell) status = 'incomplete'
      else if (rate1Cell.deletedAt || rate2Cell.deletedAt) status = 'inactive'

      return {
        container_type_id: containerType.id,
        container_name: containerType.name,
        rate1: rate1Cell,
        rate2: rate2Cell,
        status,
        hasConflict,
      } satisfies MatrixRow
    })
    .filter((row) => options.includeEmptyContainers || row.rate1 || row.rate2)
}

function buildPeriodGroup(
  periodRows: RateRow[],
  availableContainerTypes: NamedCatalog[],
  conflictIds: Set<number>,
  onDate: string,
  options: {
    includeEmptyContainers?: boolean
    containerTypeId?: number | null
  },
  metadata?: Partial<Pick<PeriodGroup, 'key' | 'start_date' | 'end_date' | 'label' | 'status' | 'is_active'>>
) {
  const exemplar = periodRows[0]
  const rowsForMatrix = buildRowsForMatrix(periodRows, availableContainerTypes, conflictIds, options)
  const status = metadata?.status ?? getPeriodStatus(exemplar?.start_date, exemplar?.end_date, onDate)
  const conflictsCount = rowsForMatrix.filter((row) => row.hasConflict).length
  const incompleteCount = rowsForMatrix.filter((row) => row.status === 'incomplete').length

  return {
    key: metadata?.key ?? buildPeriodKey(exemplar?.start_date, exemplar?.end_date),
    start_date: metadata?.start_date ?? toDateOnly(exemplar?.start_date),
    end_date: metadata?.end_date ?? toDateOnly(exemplar?.end_date),
    label: metadata?.label ?? getPeriodLabel(exemplar?.start_date, exemplar?.end_date),
    status,
    is_active: metadata?.is_active ?? status === 'active',
    rows: rowsForMatrix,
    rawRows: periodRows,
    conflictsCount,
    incompleteCount,
  } satisfies PeriodGroup
}

export function buildLineGroups(
  rows: RateRow[],
  containerTypes: NamedCatalog[] = [],
  options: {
    includeEmptyContainers?: boolean
    lineId?: number | null
    containerTypeId?: number | null
    search?: string
    activeOnly?: boolean
    conflictsOnly?: boolean
    hideDeleted?: boolean
    onDate?: string
  } = {}
) {
  const search = `${options.search ?? ''}`.trim().toLowerCase()
  const onDate = options.onDate ?? todayKey()
  const hideDeleted = options.hideDeleted ?? true

  const scopedRows = rows.filter((row) => {
    if (options.lineId && row.line_id !== options.lineId) return false
    if (options.containerTypeId && row.container_type_id !== options.containerTypeId) return false
    if (hideDeleted && row.deleted_at) return false
    if (!search) return true

    const haystack = [row.line?.name, row.container_type?.name, row.amount, row.start_date, row.end_date]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })

  const conflictIds = getConflictRateIds(scopedRows)
  const lineMap = new Map<number, RateRow[]>()

  scopedRows.forEach((row) => {
    const bucket = lineMap.get(row.line_id) ?? []
    bucket.push(row)
    lineMap.set(row.line_id, bucket)
  })

  const groups: LineGroup[] = [...lineMap.entries()].map(([lineId, lineRows]) => {
    const periodMap = new Map<string, RateRow[]>()
    const availableContainerTypes = options.includeEmptyContainers
      ? containerTypes
      : uniqueContainerTypes(lineRows)

    lineRows.forEach((row) => {
      const periodKey = buildPeriodKey(row.start_date, row.end_date)
      const bucket = periodMap.get(periodKey) ?? []
      bucket.push(row)
      periodMap.set(periodKey, bucket)
    })

    const exactPeriods = [...periodMap.entries()].map(([, periodRows]) =>
      buildPeriodGroup(periodRows, availableContainerTypes, conflictIds, onDate, {
        includeEmptyContainers: options.includeEmptyContainers,
        containerTypeId: options.containerTypeId,
      })
    )

    const activeRows = lineRows.filter((row) => isRowActiveOnDate(row, onDate))
    const activeCoverage = getCoverageBounds(activeRows)
    const mergedActivePeriod = activeRows.length
      ? buildPeriodGroup(
          activeRows,
          availableContainerTypes,
          conflictIds,
          onDate,
          {
            includeEmptyContainers: options.includeEmptyContainers,
            containerTypeId: options.containerTypeId,
          },
          {
            key: `active__${buildPeriodKey(activeCoverage.startDate, activeCoverage.endDate)}`,
            start_date: activeCoverage.startDate,
            end_date: activeCoverage.endDate,
            label: getPeriodLabel(activeCoverage.startDate, activeCoverage.endDate),
            status: 'active',
            is_active: true,
          }
        )
      : null

    const periods: PeriodGroup[] = [
      ...(mergedActivePeriod ? [mergedActivePeriod] : []),
      ...exactPeriods.filter((period) => !period.is_active),
    ]
      .filter((period) => !options.activeOnly || period.is_active)
      .filter((period) => !options.conflictsOnly || period.conflictsCount > 0 || period.incompleteCount > 0)
      .sort(sortPeriods)

    return {
      line_id: lineId,
      line_name: lineRows[0]?.line?.name ?? `Line ${lineId}`,
      periods,
      activePeriodKey: periods.find((period) => period.is_active)?.key ?? periods[0]?.key ?? null,
      conflictsCount: periods.reduce((acc, period) => acc + period.conflictsCount, 0),
      incompleteCount: periods.reduce((acc, period) => acc + period.incompleteCount, 0),
      totalRows: lineRows.length,
    } satisfies LineGroup
  })
    .filter((group) => group.periods.length > 0)
    .sort((left, right) => left.line_name.localeCompare(right.line_name))

  return groups
}

export function buildDraftRows(
  containerTypes: NamedCatalog[],
  existingRows: RateRow[],
  suggestedRows: RateRow[] = []
) {
  const uniqueTypes = uniqueContainerTypes([...existingRows, ...suggestedRows], containerTypes)

  return uniqueTypes.map((containerType) => {
    const existing = existingRows.filter((row) => row.container_type_id === containerType.id)
    const suggested = suggestedRows.filter((row) => row.container_type_id === containerType.id)

    const existingRate1 = pickBestRate(existing, 1)
    const existingRate2 = pickBestRate(existing, 2)
    const suggestedRate1 = !existingRate1 ? pickBestRate(suggested, 1) : null
    const suggestedRate2 = !existingRate2 ? pickBestRate(suggested, 2) : null
    const existingPeriodSource = existingRate1 ?? existingRate2 ?? null
    const suggestedPeriodSource = !existingPeriodSource ? suggestedRate1 ?? suggestedRate2 ?? null : null
    const periodSource = existingPeriodSource ?? suggestedPeriodSource

    return {
      container_type_id: containerType.id,
      container_name: containerType.name,
      startDate: toDateOnly(periodSource?.start_date),
      endDate: toDateOnly(periodSource?.end_date),
      originalStartDate: toDateOnly(existingPeriodSource?.start_date),
      originalEndDate: toDateOnly(existingPeriodSource?.end_date),
      suggestedDates: Boolean(!existingPeriodSource && suggestedPeriodSource),
      rate1: buildDraftCell(existingRate1, suggestedRate1),
      rate2: buildDraftCell(existingRate2, suggestedRate2),
    } satisfies DraftRow
  })
}

export function getHistoryRows(rows: RateRow[], lineId: number, containerTypeId: number) {
  return rows
    .filter((row) => row.line_id === lineId && row.container_type_id === containerTypeId)
    .sort((left, right) => {
      const rightStart = toDateOnly(right.start_date) ?? ''
      const leftStart = toDateOnly(left.start_date) ?? ''
      return rightStart.localeCompare(leftStart)
    })
}

export function cloneDraftRows(rows: DraftRow[]) {
  return rows.map((row) => ({
    ...row,
    rate1: { ...row.rate1 },
    rate2: { ...row.rate2 },
  }))
}

function buildMatrixCell(row: RateRow, rateType: RateType, conflictIds: Set<number>) {
  return {
    rowId: row.id ?? null,
    amount: asAmount(row.amount),
    rateType,
    startDate: toDateOnly(row.start_date),
    endDate: toDateOnly(row.end_date),
    deletedAt: row.deleted_at ?? null,
    hasConflict: Boolean(row.id && conflictIds.has(row.id)),
    raw: row,
  } satisfies MatrixCell
}

function buildDraftCell(existingRow?: RateRow | null, suggestedRow?: RateRow | null) {
  const source = existingRow ?? suggestedRow ?? null
  const amount = asAmount(source?.amount)

  return {
    rowId: existingRow?.id ?? null,
    amount,
    originalAmount: asAmount(existingRow?.amount),
    startDate: toDateOnly(source?.start_date),
    endDate: toDateOnly(source?.end_date),
    originalStartDate: toDateOnly(existingRow?.start_date),
    originalEndDate: toDateOnly(existingRow?.end_date),
    suggested: Boolean(!existingRow && suggestedRow),
    deletedAt: existingRow?.deleted_at ?? null,
  } satisfies DraftCell
}

function uniqueContainerTypes(rows: RateRow[], catalog: NamedCatalog[] = []) {
  const map = new Map<number, NamedCatalog>()

  catalog.forEach((item) => {
    map.set(item.id, item)
  })

  rows.forEach((row) => {
    if (!map.has(row.container_type_id)) {
      map.set(row.container_type_id, {
        id: row.container_type_id,
        name: row.container_type?.name ?? `Container ${row.container_type_id}`,
      })
    }
  })

  return [...map.values()].sort((left, right) => left.name.localeCompare(right.name))
}

function pickBestRate(rows: RateRow[], rateType: RateType) {
  return rows
    .filter((row) => row.rate_type === rateType)
    .sort((left, right) => {
      const leftDeleted = left.deleted_at ? 1 : 0
      const rightDeleted = right.deleted_at ? 1 : 0
      if (leftDeleted !== rightDeleted) return leftDeleted - rightDeleted

      const rightCreated = right.created_at ?? ''
      const leftCreated = left.created_at ?? ''
      return rightCreated.localeCompare(leftCreated)
    })[0] ?? null
}

function sortPeriods(left: PeriodGroup, right: PeriodGroup) {
  const statusWeight = {
    active: 0,
    upcoming: 1,
    expired: 2,
  }

  const statusCompare = statusWeight[left.status] - statusWeight[right.status]
  if (statusCompare !== 0) return statusCompare

  return (right.start_date ?? '').localeCompare(left.start_date ?? '')
}
