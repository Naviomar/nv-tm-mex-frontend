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

  const loadState = (): ColumnState[] => {
    const defaults = buildDefaults()
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return defaults
      const saved = JSON.parse(raw) as ColumnState[]
      if (!Array.isArray(saved)) return defaults

      const allowedKeys = new Set(allowedDefs.value.map((d) => d.key))
      const savedKeys = new Set(saved.map((s) => s.key))

      // Locked columns always come first in registry order and are always visible
      const locked = defaults.filter((d) => allowedDefs.value.find((def) => def.key === d.key)?.locked)
      const merged = saved
        .filter((s) => allowedKeys.has(s.key) && !allowedDefs.value.find((d) => d.key === s.key)?.locked)
        .map((s) => ({ key: s.key, visible: !!s.visible }))

      // Append columns that are not in the saved state (e.g. newly added columns)
      for (const def of defaults) {
        if (!savedKeys.has(def.key) && !locked.some((l) => l.key === def.key)) merged.push(def)
      }

      return [...locked, ...merged]
    } catch {
      return defaults
    }
  }

  const items = ref<ColumnState[]>(buildDefaults())

  onMounted(() => {
    items.value = loadState()
  })

  watch(
    items,
    (value) => {
      try {
        // Only persist the non-locked columns; locked are enforced on load
        const lockedKeys = new Set(allowedDefs.value.filter((d) => d.locked).map((d) => d.key))
        localStorage.setItem(storageKey, JSON.stringify(value.filter((i) => !lockedKeys.has(i.key))))
      } catch {
        // Ignore storage errors (private mode, quota, etc.)
      }
    },
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
