import type { PermissionSpec } from '~/composables/useCheckUser'

/**
 * Permisos que exige abrir una página de acción (alta, edición, detalle), por ruta.
 *
 * Es la contraparte en el frontend de los `can:` del backend: cada regla sale de los
 * permisos que las llamadas de la página exigen en la API (por eso una pantalla de
 * edición pide editar Y ver cuando cargar el registro exige ver). Si el usuario no
 * los tiene, el guard de ruta (middleware/permission-guard.global.ts) lo manda a
 * /no-access en lugar de dejarlo llenar un formulario que el backend rechazará.
 *
 * Solo se registran páginas cuyos permisos el backend realmente exige; una ruta que el
 * backend deja abierta no se esconde aquí para no cambiar quién puede usarla.
 *
 * `path` usa `:id` para el id numérico y se compara con la ruta completa. Un arreglo exige
 * TODOS los permisos; para "cualquiera de" use `{ any: [...] }`.
 */
export interface RoutePermissionRule {
  path: string
  permission: PermissionSpec
}

export const routePermissions: RoutePermissionRule[] = [
  // airlines
  { path: '/configuration/airlines/add', permission: 'airlines-create' },
  { path: '/configuration/airlines/edit-:id', permission: ['airlines-edit', 'airlines-view'] },
  { path: '/configuration/airlines/view-:id', permission: 'airlines-view' },
  // airports
  { path: '/configuration/airports/add', permission: 'airports-create' },
  { path: '/configuration/airports/edit-:id', permission: ['airports-edit', 'airports-view'] },
  { path: '/configuration/airports/view-:id', permission: 'airports-view' },
  // banks
  { path: '/configuration/banks/add', permission: 'banks-create' },
  { path: '/configuration/banks/edit-:id', permission: ['banks-edit', 'banks-view'] },
  { path: '/configuration/banks/view-:id', permission: 'banks-view' },
  // beneficiaries
  { path: '/configuration/beneficiaries/add', permission: 'refunds-create' },
  { path: '/configuration/beneficiaries/edit-:id', permission: ['refunds-edit', 'refunds-view'] },
  { path: '/configuration/beneficiaries/view-:id', permission: 'refunds-view' },
  // charges
  { path: '/configuration/charges/add', permission: 'charges-create' },
  { path: '/configuration/charges/edit-:id', permission: 'charges-edit' },
  // consignees-mbl
  { path: '/configuration/consignees-mbl/add', permission: 'consignee-mbl-create' },
  { path: '/configuration/consignees-mbl/edit-:id', permission: 'consignee-mbl-edit' },
  // containers
  { path: '/configuration/containers/add', permission: 'containers-create' },
  { path: '/configuration/containers/edit-:id', permission: ['containers-edit', 'containers-view'] },
  { path: '/configuration/containers/view-:id', permission: 'containers-view' },
  // countries
  { path: '/configuration/countries/add', permission: 'countries-create' },
  { path: '/configuration/countries/edit-:id', permission: 'countries-edit' },
  // currencies
  { path: '/configuration/currencies/view-:id', permission: 'currencies-view' },
  // custom-agents
  { path: '/configuration/custom-agents/add', permission: 'customs-agents-create' },
  { path: '/configuration/custom-agents/edit-:id', permission: ['customs-agents-edit', 'customs-agents-view'] },
  { path: '/configuration/custom-agents/view-:id', permission: 'customs-agents-view' },
  // customers
  { path: '/configuration/customers/add', permission: 'customers-create' },
  { path: '/configuration/customers/edit-:id', permission: 'customers-edit' },
  { path: '/configuration/customers/groups/add', permission: 'consignee-groups-create' },
  // destinations
  { path: '/configuration/destinations/add', permission: 'locations-create' },
  { path: '/configuration/destinations/edit-:id', permission: ['locations-edit', 'locations-view'] },
  { path: '/configuration/destinations/view-:id', permission: 'locations-view' },
  // embalajes
  { path: '/configuration/embalajes/add', permission: 'embalajes-create' },
  { path: '/configuration/embalajes/edit-:id', permission: ['embalajes-edit', 'embalajes-view'] },
  { path: '/configuration/embalajes/view-:id', permission: 'embalajes-view' },
  // executives
  { path: '/configuration/executives/add', permission: 'executives-create' },
  { path: '/configuration/executives/edit-:id', permission: ['executives-edit', 'executives-view'] },
  { path: '/configuration/executives/groups/add', permission: 'executive-groups-create' },
  { path: '/configuration/executives/view-:id', permission: 'executives-view' },
  // handlers
  { path: '/configuration/handlers/add', permission: 'handlers-create' },
  { path: '/configuration/handlers/edit-:id', permission: ['handlers-edit', 'handlers-view'] },
  { path: '/configuration/handlers/view-:id', permission: 'handlers-view' },
  // lines
  { path: '/configuration/lines/add', permission: 'lines-create' },
  { path: '/configuration/lines/edit-:id', permission: ['lines-edit', 'lines-view'] },
  { path: '/configuration/lines/view-:id', permission: 'lines-view' },
  // national-destinations
  { path: '/configuration/national-destinations/add', permission: 'locations-create' },
  // notifications-types
  { path: '/configuration/notifications-types/add', permission: 'notifications-types-create' },
  { path: '/configuration/notifications-types/edit-:id', permission: ['notifications-types-edit', 'notifications-types-view'] },
  { path: '/configuration/notifications-types/view-:id', permission: 'notifications-types-view' },
  // ports
  { path: '/configuration/ports/add', permission: 'ports-edit' },
  { path: '/configuration/ports/edit-:id', permission: 'ports-edit' },
  // sea-regions
  { path: '/configuration/sea-regions/add', permission: 'sea-regions-create' },
  { path: '/configuration/sea-regions/edit-:id', permission: ['sea-regions-edit', 'sea-regions-view'] },
  { path: '/configuration/sea-regions/view-:id', permission: 'sea-regions-view' },
  // sea-traffics
  { path: '/configuration/sea-traffics/add', permission: 'sea-traffics-create' },
  // services-contracts
  { path: '/configuration/services-contracts/add', permission: 'services-contracts-create' },
  { path: '/configuration/services-contracts/edit-:id', permission: ['services-contracts-edit', 'services-contracts-view'] },
  { path: '/configuration/services-contracts/view-:id', permission: 'services-contracts-view' },
  // shippers
  { path: '/configuration/shippers/add', permission: 'shippers-create' },
  // suppliers
  { path: '/configuration/suppliers/add', permission: 'suppliers-create' },
  { path: '/configuration/suppliers/edit-:id', permission: ['suppliers-edit', 'suppliers-view'] },
  { path: '/configuration/suppliers/types/add', permission: 'supplier-types-create' },
  { path: '/configuration/suppliers/types/edit-:id', permission: 'supplier-types-edit' },
  { path: '/configuration/suppliers/view-:id', permission: 'suppliers-view' },
  // tracking-events
  { path: '/configuration/tracking-events/add', permission: 'tracking-events-create' },
  { path: '/configuration/tracking-events/edit-:id', permission: ['tracking-events-edit', 'tracking-events-view'] },
  // vessels
  { path: '/configuration/vessels/add', permission: 'vessel-lines-create' },
  { path: '/configuration/vessels/edit-:id', permission: 'vessel-lines-edit' },
  { path: '/configuration/vessels/view-:id', permission: 'vessel-lines-view' },
  // voyages
  { path: '/configuration/voyages/add', permission: 'voyages-create' },
  { path: '/configuration/voyages/view-:id', permission: 'voyages-view' },
  // warehouses
  { path: '/configuration/warehouses/add', permission: 'warehouses-create' },
  { path: '/configuration/warehouses/edit-:id', permission: ['warehouses-edit', 'warehouses-view'] },
  { path: '/configuration/warehouses/view-:id', permission: 'warehouses-view' },

  // páginas cuya ruta no sigue el patrón add / edit-:id / view-:id
  { path: '/configuration/shippers/edit/:id', permission: 'shippers-edit' },
  { path: '/configuration/customers/groups/:id', permission: 'consignee-groups-edit' },
  { path: '/configuration/voyages/:id', permission: ['voyages-edit', 'voyages-view'] },
]

const compiled = routePermissions.map((rule) => ({
  rule,
  // `:id` matches numeric ids only, so '/voyages/:id' doesn't swallow '/voyages/add'.
  regex: new RegExp('^' + rule.path.replace(/:[A-Za-z]+/g, '[0-9]+') + '/?$'),
}))

/** Permisos que exige una ruta, o null si no tiene regla. */
export function permissionForPath(path: string): PermissionSpec | null {
  return compiled.find((c) => c.regex.test(path))?.rule.permission ?? null
}
