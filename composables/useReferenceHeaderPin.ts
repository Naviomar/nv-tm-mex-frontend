/**
 * Pinned reference bar: when enabled, the bar holding the Back button stays
 * fixed while scrolling and shows the reference being edited. The on/off
 * choice persists per user; the label is only the current page's reference.
 */
export function useReferenceHeaderPin() {
  const pinned = useState<boolean>('reference-header-pinned', () => false)
  const label = useState<string | null>('reference-header-label', () => null)
  const loaded = useState<boolean>('reference-header-pinned-loaded', () => false)

  const { readLocal, persist, loadServer } = useUiPreference('reference-header-pin')

  const load = async () => {
    if (loaded.value) return
    loaded.value = true
    const local = readLocal()
    if (local && typeof local.pinned === 'boolean') pinned.value = local.pinned
    const remote = await loadServer()
    if (remote && typeof remote.pinned === 'boolean') pinned.value = remote.pinned
  }

  const setPinned = (value: boolean) => {
    pinned.value = value
    persist({ pinned: value })
  }

  return { pinned, label, load, setPinned }
}
