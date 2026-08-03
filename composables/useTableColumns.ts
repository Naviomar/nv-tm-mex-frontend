/**
 * Composable for user-customizable table columns: visibility and order,
 * persisted in localStorage. Rendering is client-side only, so it adds no
 * overhead to the data loading of the table.
 */
export interface TableColumnDef {
  /** Unique key, matched in the table template with v-if="col.key === '...'" */
  key: string
  /** Human readable name shown in the columns menu */
  label: string
  /** Whether the column is visible by default (default: true) */
  visible?: boolean
  /** Locked columns cannot be hidden nor reordered (e.g. Actions) */
  locked?: boolean
  /** Only offer this column when the user has the given permission */
  permission?: string
}

interface ColumnState {
  key: string
  visible: boolean
}

export function useTableColumns(storageKey: string, defs: TableColumnDef[]) {
  const { hasPermission } = useCheckUser()

  // Columns the current user is allowed to see at all
  const allowedDefs = computed(() => defs.filter((d) => !d.permission || hasPermission(d.permission)))

  const buildDefaults = (): ColumnState[] =>
    allowedDefs.value.map((d) => ({ key: d.key, visible: d.visible !== false }))

  // Merge a saved state with the registry: locked columns always come first
  // in registry order and stay visible; unknown keys are dropped and columns
  // missing from the saved state (e.g. newly added) are appended.
  const mergeState = (saved: any): ColumnState[] | null => {
    if (!Array.isArray(saved)) return null
    const defaults = buildDefaults()
    const allowedKeys = new Set(allowedDefs.value.map((d) => d.key))
    const savedKeys = new Set(saved.map((s: ColumnState) => s.key))

    const locked = defaults.filter((d) => allowedDefs.value.find((def) => def.key === d.key)?.locked)
    const merged = saved
      .filter((s: ColumnState) => allowedKeys.has(s.key) && !allowedDefs.value.find((d) => d.key === s.key)?.locked)
      .map((s: ColumnState) => ({ key: s.key, visible: !!s.visible }))

    for (const def of defaults) {
      if (!savedKeys.has(def.key) && !locked.some((l) => l.key === def.key)) merged.push(def)
    }

    return [...locked, ...merged]
  }

  // localStorage = fast cache, backend = source of truth per user
  const { readLocal, persist, loadServer } = useUiPreference(storageKey)

  const items = ref<ColumnState[]>(buildDefaults())

  onMounted(async () => {
    // 1) Fast first paint: apply the local cache immediately
    items.value = mergeState(readLocal()) ?? buildDefaults()
    // 2) Source of truth: the backend. Seed it if the user has nothing saved
    const serverValue = await loadServer()
    if (serverValue) {
      items.value = mergeState(serverValue) ?? items.value
    } else {
      persistCurrent(items.value)
    }
  })

  const persistCurrent = (value: ColumnState[]) => {
    // Only persist the non-locked columns; locked are enforced on load
    const lockedKeys = new Set(allowedDefs.value.filter((d) => d.locked).map((d) => d.key))
    persist(value.filter((i) => !lockedKeys.has(i.key)))
  }

  watch(
    items,
    (value) => persistCurrent(value),
    { deep: true }
  )

  /** Column definitions in the user's chosen order, visible ones only */
  const visibleColumns = computed<TableColumnDef[]>(() => {
    const byKey = new Map(allowedDefs.value.map((d) => [d.key, d]))
    return items.value.filter((i) => i.visible).map((i) => byKey.get(i.key)!).filter(Boolean)
  })

  const isCustomized = computed(() => {
    const defaults = buildDefaults()
    if (defaults.length !== items.value.length) return true
    return defaults.some((d, index) => {
      const item = items.value[index]
      return !item || item.key !== d.key || item.visible !== d.visible
    })
  })

  /** Move a column so it is inserted at the given index (already adjusted) */
  const moveColumn = (key: string, insertAt: number) => {
    const fromIndex = items.value.findIndex((i) => i.key === key)
    if (fromIndex === -1) return
    if (allowedDefs.value.find((d) => d.key === key)?.locked) return
    const [moved] = items.value.splice(fromIndex, 1)
    if (fromIndex < insertAt) insertAt--
    items.value.splice(Math.max(0, insertAt), 0, moved)
  }

  const toggleColumn = (key: string) => {
    if (allowedDefs.value.find((d) => d.key === key)?.locked) return
    const item = items.value.find((i) => i.key === key)
    if (item) item.visible = !item.visible
  }

  const resetColumns = () => {
    items.value = buildDefaults()
  }

  const isLocked = (key: string) => !!allowedDefs.value.find((d) => d.key === key)?.locked

  return {
    items,
    allowedDefs,
    visibleColumns,
    isCustomized,
    isLocked,
    moveColumn,
    toggleColumn,
    resetColumns,
  }
}
