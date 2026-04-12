import { getModuleForPath, getPageInfoForPath } from '~/utils/data/moduleMap'

/**
 * Registers the current route as a tab + sub-tab automatically.
 * Call once in the layout — it watches route changes and registers every page.
 *
 * Optionally call in a specific page with overrides:
 *   useSystemTab({ module: 'Invoices', moduleIcon: 'mdi-receipt-text', page: 'TM Invoices' })
 */
export function useSystemTab(opts?: {
  module?: string
  moduleIcon?: string
  moduleColor?: string
  page?: string
  pageIcon?: string
}) {
  const tabsStore = useTabsStore()
  const route = useRoute()

  const registerRoute = (path: string) => {
    const modDef = getModuleForPath(path)
    if (!modDef) return

    const moduleLabel = opts?.module ?? modDef.label
    const moduleIcon  = opts?.moduleIcon ?? modDef.icon
    const moduleColor = opts?.moduleColor ?? modDef.color
    const moduleId    = moduleLabel.toLowerCase().replace(/\s+/g, '-')

    const segments  = path.split('/').filter(Boolean)
    const modulePath = segments.length > 0 ? `/${segments[0]}` : path

    tabsStore.openTab({
      id: moduleId,
      label: moduleLabel,
      path: modulePath,
      icon: moduleIcon,
      color: moduleColor,
    })

    const pageInfo  = getPageInfoForPath(path)
    const pageLabel = opts?.page ?? pageInfo.label
    const pageIcon  = opts?.pageIcon ?? pageInfo.icon
    const pageId    = `${moduleId}--${pageLabel.toLowerCase().replace(/\s+/g, '-')}`

    tabsStore.openSubTab({
      id: pageId,
      label: pageLabel,
      path,
      icon: pageIcon,
    })
  }

  onMounted(() => registerRoute(route.path))
  watch(() => route.path, (path) => registerRoute(path))
}
