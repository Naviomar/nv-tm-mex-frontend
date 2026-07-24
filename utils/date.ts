const addWorkingDays = (startDate: Date, days: number) => {
  const date = new Date(startDate)
  while (days > 0) {
    date.setDate(date.getDate() + 1)
    // Decrease "days" only if it's a weekday.
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days -= 1
    }
  }
  return date
}

// Matches a MySQL DATETIME string with no timezone offset (e.g. "2026-07-23 16:46:35").
// Plain DATE-only strings ("2026-07-23") are intentionally excluded: they represent a
// calendar day with no instant to shift, so converting them would be wrong.
const MYSQL_DATETIME_RE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/

// The audit trail (System Logs / Mail Logs) stores raw model attributes exactly as
// persisted in the DB — i.e. in UTC (app.timezone) with no offset in the string. When
// displaying those values to a user, convert them to the business timezone instead of
// showing the raw UTC string as-is.
const convertUtcDatetimeToLocal = (value: string, timeZone = 'America/Mexico_City'): string => {
  if (!MYSQL_DATETIME_RE.test(value)) return value

  const date = new Date(value.replace(' ', 'T') + 'Z')
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('es-MX', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

// Recursively walks an arbitrary payload (System/Mail Log JSON attributes) converting
// any raw UTC datetime leaf strings to the business timezone, for display purposes only.
const convertPayloadDates = (value: unknown): unknown => {
  if (typeof value === 'string') return convertUtcDatetimeToLocal(value)
  if (Array.isArray(value)) return value.map(convertPayloadDates)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [key, convertPayloadDates(val)])
    )
  }
  return value
}

// Formats a bare "YYYY-MM-DD" calendar-day string (e.g. DashboardCaptureStat's
// stat_date, already bucketed by Mexico City day on the backend) for a chart axis.
// `new Date("YYYY-MM-DD")` parses as UTC midnight per spec; rendering it with
// toLocaleDateString() with no timeZone falls back to the browser's local zone and,
// for any zone behind UTC (Mexico City included), rolls the label back a day. Since
// this is a calendar day with no time-of-day, format it as UTC — i.e. don't shift it
// at all — instead of letting the browser's local zone reinterpret it.
const formatCaptureStatDay = (dateStr: string): string =>
  new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

const initialYear = 2022
const currentYear = new Date().getFullYear()
const maxYear = currentYear + 1
const prefixYears: string[] = []
for (let i = maxYear; i >= initialYear; i--) {
  // Start from maxYear and go backwards
  // last two digits of the year
  prefixYears.push(i.toString())
}


export { addWorkingDays, prefixYears, convertUtcDatetimeToLocal, convertPayloadDates, formatCaptureStatDay }
