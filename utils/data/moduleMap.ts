export interface ModuleDefinition {
  label: string
  icon: string
  color?: string
}

/**
 * Maps the first URL path segment to a module label + icon.
 * Used by the system tab bar to auto-register pages as tabs.
 */
export const MODULE_MAP: Record<string, ModuleDefinition> = {
  'invoices':            { label: 'Invoices',        icon: 'mdi-receipt-text',         color: 'indigo' },
  'adminpack':           { label: 'Invoices',         icon: 'mdi-receipt-text',         color: 'indigo' },
  'maritime':            { label: 'Maritime',         icon: 'mdi-ferry',                color: 'blue' },
  'air':                 { label: 'Air',              icon: 'mdi-airplane',             color: 'cyan' },
  'payments':            { label: 'Payments',         icon: 'mdi-credit-card-outline',  color: 'green' },
  'banking':             { label: 'Banking',          icon: 'mdi-bank-outline',         color: 'teal' },
  'advance-payments':    { label: 'Payments',         icon: 'mdi-credit-card-outline',  color: 'green' },
  'anticipos':           { label: 'Payments',         icon: 'mdi-credit-card-outline',  color: 'green' },
  'auth-requests':       { label: 'Authorizations',   icon: 'mdi-shield-key-outline',   color: 'orange' },
  'auth-process-requests': { label: 'Authorizations', icon: 'mdi-shield-key-outline',  color: 'orange' },
  'request-assistance':  { label: 'Authorizations',   icon: 'mdi-shield-key-outline',   color: 'orange' },
  'reports':             { label: 'Reports',          icon: 'mdi-chart-bar',            color: 'purple' },
  'tracking':            { label: 'Tracking',         icon: 'mdi-map-marker-path',      color: 'deep-orange' },
  'configuration':       { label: 'Configuration',    icon: 'mdi-cog-outline',          color: 'grey' },
  'system':              { label: 'System',           icon: 'mdi-monitor-dashboard',    color: 'blue-grey' },
  'profile':             { label: 'Profile',          icon: 'mdi-account-circle-outline', color: 'blue-grey' },
}

/**
 * Maps a full route path to a human-readable page label.
 * Falls back to a prettified version of the last path segment.
 */
export const PAGE_LABEL_MAP: Record<string, { label: string; icon?: string }> = {
  '/invoices/search/sea-import':        { label: 'Sea Import',     icon: 'mdi-ferry' },
  '/invoices/search/sea-export':        { label: 'Sea Export',     icon: 'mdi-ferry' },
  '/invoices/search/air-import':        { label: 'Air Import',     icon: 'mdi-airplane-landing' },
  '/invoices/search/air-export':        { label: 'Air Export',     icon: 'mdi-airplane-takeoff' },
  '/invoices/search/free-format':       { label: 'Free Format',    icon: 'mdi-file-document-outline' },
  '/invoices/search/credit-notes':      { label: 'Credit Notes',   icon: 'mdi-file-undo-outline' },
  '/invoices/customers/commissions':    { label: 'Commissions',    icon: 'mdi-percent' },
  '/invoices/lines':                    { label: 'Lines Invoices',  icon: 'mdi-file-table-outline' },
  '/invoices/lines/notes':              { label: 'Line Notes',     icon: 'mdi-note-outline' },
  '/invoices/lines/credit-notes':       { label: 'Line Credits',   icon: 'mdi-file-undo-outline' },
  '/invoices/lines/demurrage-detentions': { label: 'Demurrage',    icon: 'mdi-timer-sand' },
  '/invoices/ffagents':                 { label: 'FF Agents',      icon: 'mdi-account-group-outline' },
  '/invoices/ffagents/notes':           { label: 'FF Notes',       icon: 'mdi-note-outline' },
  '/invoices/capture':                  { label: 'Capture',        icon: 'mdi-pencil-plus-outline' },
  '/maritime':                          { label: 'Sea Import',     icon: 'mdi-ferry' },
  '/air/import':                        { label: 'Air Import',     icon: 'mdi-airplane-landing' },
  '/air/export':                        { label: 'Air Export',     icon: 'mdi-airplane-takeoff' },
  '/auth-requests':                     { label: 'Auth Requests',  icon: 'mdi-security' },
  '/auth-process-requests':             { label: 'Process Req.',   icon: 'mdi-cog-outline' },
  '/request-assistance':                { label: 'Assistance',     icon: 'mdi-lifebuoy' },
  '/payments':                          { label: 'Payments',       icon: 'mdi-currency-usd' },
  '/reports':                           { label: 'Reports',        icon: 'mdi-chart-bar' },
  '/tracking':                          { label: 'Tracking',       icon: 'mdi-map-marker-path' },
  '/configuration':                     { label: 'Config',         icon: 'mdi-cog-outline' },
  '/system/system-logs':                { label: 'System Logs',    icon: 'mdi-text-box-search-outline' },
  '/system/alert-categories':           { label: 'Alert Categories', icon: 'mdi-bell-cog-outline' },
  '/system/alert-types':                { label: 'Alert Types',    icon: 'mdi-bell-outline' },
  '/system/users':                      { label: 'Users',          icon: 'mdi-account-group-outline' },
  '/system/roles':                      { label: 'Roles',          icon: 'mdi-shield-account-outline' },
  '/system/auth-request-types':         { label: 'Request Types',  icon: 'mdi-format-list-group' },
}

export function getModuleForPath(path: string): ModuleDefinition | null {
  const segment = path.split('/').filter(Boolean)[0]
  if (!segment) return null
  return MODULE_MAP[segment] ?? null
}

export function getPageInfoForPath(path: string): { label: string; icon?: string } {
  // Exact match first
  if (PAGE_LABEL_MAP[path]) return PAGE_LABEL_MAP[path]
  // Prefix match (longest wins)
  const match = Object.keys(PAGE_LABEL_MAP)
    .filter((key) => path.startsWith(key))
    .sort((a, b) => b.length - a.length)[0]
  if (match) return PAGE_LABEL_MAP[match]
  // Fallback: prettify last segment
  const last = path.split('/').filter(Boolean).pop() ?? path
  return { label: last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }
}
