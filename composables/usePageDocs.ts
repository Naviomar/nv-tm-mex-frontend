// Lets any component open a registered page doc (utils/docs/registry.ts) in the footer
// documentation dialog, optionally on a given tab. The footer button (PageDocsButton)
// listens to this request.
export interface PageDocsRequest {
  id: string
  tab?: string
  nonce: number
}

export function usePageDocs() {
  const request = useState<PageDocsRequest | null>('page-docs-request', () => null)

  function open(id: string, tab?: string) {
    request.value = { id, tab, nonce: Date.now() }
  }

  return { request, open }
}
