import type { IAuthRequestType, IRequestTemplate } from '~/repository/modules/catalogs/authRequestTypes'

const DEFAULT_TEMPLATE: IRequestTemplate = {
  title: null,
  subtitle: 'Please provide a reason for this request.',
  reason: { show: true, label: 'Reason', required: true, rows: 3 },
  buttons: { submit: 'Submit request', cancel: 'Cancel' },
  elements: [],
}

export function useRequestTypeCatalog() {
  const { $api } = useNuxtApp()

  const catalog = useState<IAuthRequestType[] | null>('auth-request-type-catalog', () => null)
  const loading = useState<boolean>('auth-request-type-catalog-loading', () => false)

  async function loadCatalog(): Promise<void> {
    if (catalog.value !== null || loading.value) return
    loading.value = true
    try {
      const data = await $api.authRequestTypes.getTypes()
      catalog.value = data as IAuthRequestType[]
    } catch {
      catalog.value = []
    } finally {
      loading.value = false
    }
  }

  function getType(code: string): IAuthRequestType | null {
    return catalog.value?.find((t) => t.code === code) ?? null
  }

  function getTemplate(code: string): IRequestTemplate {
    const type = getType(code)
    if (!type?.template) return { ...DEFAULT_TEMPLATE }
    return type.template
  }

  function invalidate(): void {
    catalog.value = null
  }

  return { catalog, loading, loadCatalog, getType, getTemplate, invalidate }
}
