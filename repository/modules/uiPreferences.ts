import { type FetchOptions } from 'ofetch'

// locals
import FetchFactory from '../factory'

type IUiPreference = {
  key: string
  value: any
}

class UiPreferencesModule extends FetchFactory<IUiPreference> {
  private RESOURCE = '/ui-preferences'

  // Non-critical feature: failures must stay silent (no global error store,
  // no error toasts) — the UI keeps working with the localStorage copy.
  private silent: FetchOptions = { onResponseError: () => {} }

  async get(key: string) {
    return this.call('GET', `${this.RESOURCE}/${encodeURIComponent(key)}`, this.silent)
  }

  async save(key: string, value: any) {
    return this.call('PUT', `${this.RESOURCE}/${encodeURIComponent(key)}`, {
      body: { value },
      ...this.silent,
    })
  }
}

export default UiPreferencesModule
