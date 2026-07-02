/**
 * Mail notifications that support port filtering
 * These notifications use pod_id in __getCustomerEmailsByMailNotyAndType calls
 */
export const PORT_FILTERABLE_NOTIFICATIONS = [
  'SeaImportIntermodalNoty',
  'SeaImportIntermodalRailNoty',
  'SeaExportBookingConfirmation',
  'SeaExportAlertDraftBl',
  'SeaImportNotifyArrival',
  'SeaImportNotifyRevalidation',
  'SeaImportChecklistNotify',
  'SeaImportPendingRevalidationInd',
  'DemurragesThreeDaysLeft',
  'SeaVoyageDestUpdatedEtaConfirmed',
  'SeaVoyageDestUpdatedEtaConsignee',
] as const

/**
 * Check if a notification supports port filtering
 * @param shortName - The short_name of the mail notification
 * @returns true if the notification supports port filtering
 */
export function isPortFilterableNotification(shortName: string): boolean {
  return PORT_FILTERABLE_NOTIFICATIONS.includes(shortName as any)
}

/**
 * Converts a camelCase notification name into a human-readable string
 * e.g. "AirExportRevalidation" → "Air Export Revalidation"
 */
export function formatNotificationName(name: string): string {
  if (!name) return name
  return name.replace(/([a-z])([A-Z])/g, '$1 $2')
}
