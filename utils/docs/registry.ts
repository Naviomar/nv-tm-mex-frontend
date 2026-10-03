import type { Component } from 'vue'

// Page documentation registry. To document a new view/module: create a content component
// (components/docs/... or any) and register it here with the routes where it applies.
// The footer button (components/global/PageDocsButton.vue) shows up only on matching routes.
export interface PageDoc {
  id: string
  title: string
  subtitle?: string
  icon?: string
  color?: string
  // route path prefixes ('/invoices/suppliers') or a custom matcher
  match: string[] | ((path: string) => boolean)
  // lazy content component
  component: () => Promise<any>
}

export const pageDocs: PageDoc[] = [
  {
    id: 'supplier-payments',
    title: '¿Cómo funciona? Pagos a proveedores',
    subtitle: 'Del CFDI del proveedor al pago y al profit de la referencia',
    icon: 'mdi-book-open-page-variant-outline',
    color: 'primary',
    match: ['/invoices/suppliers/cfdis', '/advance-payments', '/payments/suppliers'],
    component: () => import('~/components/suppliers/SupplierPaymentsModuleGuide.vue'),
  },
]

export const docsForPath = (path: string): PageDoc[] =>
  pageDocs.filter((doc) =>
    typeof doc.match === 'function' ? doc.match(path) : doc.match.some((prefix) => path === prefix || path.startsWith(prefix + '/')),
  )

export type { Component }
