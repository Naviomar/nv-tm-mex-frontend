import moment from 'moment-timezone'
import type { IPortLogbookEntry } from '~/repository/modules/catalogs/portLogbook'

const MX_TZ = 'America/Mexico_City'

const EVENT_ICONS: Record<string, string> = {
  hurricane: 'mdi-weather-hurricane',
  tropical_storm: 'mdi-weather-lightning-rainy',
  weather: 'mdi-weather-windy',
  port_closure: 'mdi-door-closed-lock',
  strike: 'mdi-account-multiple-remove-outline',
  congestion: 'mdi-timer-sand',
  security: 'mdi-shield-alert-outline',
  maintenance: 'mdi-wrench-outline',
  customs: 'mdi-file-alert-outline',
  other: 'mdi-information-outline',
}

const OPERATIONS_COLORS: Record<string, string> = {
  closed: 'error',
  restricted: 'warning',
  delayed: 'info',
}

const OPERATIONS_ICONS: Record<string, string> = {
  closed: 'mdi-lock-outline',
  restricted: 'mdi-alert-outline',
  delayed: 'mdi-clock-alert-outline',
}

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  active: { label: 'Active', color: 'error', icon: 'mdi-alert-circle-outline' },
  scheduled: { label: 'Scheduled', color: 'secondary', icon: 'mdi-calendar-clock-outline' },
  resolved: { label: 'Resolved', color: 'success', icon: 'mdi-check-circle-outline' },
}

/**
 * Shared presentation helpers of the port logbook. Entry dates are Mexico City wall-clock strings
 * ("YYYY-MM-DD HH:mm:ss") exactly as the API stores them, so they are always parsed in that zone.
 */
export const usePortLogbook = () => {
  const eventIcon = (type: string) => EVENT_ICONS[type] ?? EVENT_ICONS.other
  const operationsColor = (status: string) => OPERATIONS_COLORS[status] ?? 'secondary'
  const operationsIcon = (status: string) => OPERATIONS_ICONS[status] ?? 'mdi-information-outline'
  const statusMeta = (status: string) => STATUS_META[status] ?? STATUS_META.resolved

  const entryTitle = (entry: IPortLogbookEntry) => entry.event_name || entry.event_type_label

  /** Elapsed time of the event ("5 h", "3 d"); an open event counts up to now. */
  const duration = (entry: IPortLogbookEntry) => {
    const start = moment.tz(entry.starts_at, MX_TZ)
    const now = moment.tz(MX_TZ)
    if (start.isAfter(now)) return 'Not started'
    const end = entry.ends_at ? moment.tz(entry.ends_at, MX_TZ) : now
    const hours = Math.max(0, Math.round(end.diff(start, 'hours', true)))
    const text = hours < 48 ? `${hours} h` : `${Math.round(hours / 24)} d`
    return entry.ends_at ? text : `${text} so far`
  }

  const nowInput = () => moment.tz(MX_TZ).format('YYYY-MM-DDTHH:mm')

  return { eventIcon, operationsColor, operationsIcon, statusMeta, entryTitle, duration, nowInput }
}
