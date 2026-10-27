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
  {
    id: 'access-control',
    title: '¿Cómo funciona? Roles y permisos',
    subtitle: 'Qué da cada rol, cómo agregar extras y cómo revocar un permiso',
    icon: 'mdi-shield-key-outline',
    color: 'primary',
    match: ['/system/departments', '/system/admin-department', '/system/role-permissions', '/system/users'],
    component: () => import('~/components/docs/AccessControlGuide.vue'),
  },
  {
    id: 'demurrages',
    title: '¿Cómo funciona? Demoras',
    subtitle: 'Del día de inicio por barco al cálculo, el corte al cliente y el pago a la naviera',
    icon: 'mdi-timer-sand',
    color: 'orange',
    match: (path) =>
      ['/maritime/import/demurrages', '/invoices/lines/demurrage-detentions', '/invoices/capture/lines/demurrages', '/invoices/search/lines/demurrages', '/configuration/container-delay-rates'].some(
        (prefix) => path === prefix || path.startsWith(prefix + '/'),
      ),
    component: () => import('~/components/docs/DemurragesGuide.vue'),
  },
]

export const docsForPath = (path: string): PageDoc[] =>
  pageDocs.filter((doc) =>
    typeof doc.match === 'function' ? doc.match(path) : doc.match.some((prefix) => path === prefix || path.startsWith(prefix + '/')),
  )

export type { Component }
