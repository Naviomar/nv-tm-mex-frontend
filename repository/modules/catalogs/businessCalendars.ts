import { type FetchOptions } from 'ofetch'

import FetchFactory from '../../factory'

export interface IBusinessCalendarHour {
  weekday: number
  starts_at: string
  ends_at: string
}

export interface IBusinessCalendarHoliday {
  date: string
  name: string
  is_recurring: boolean
}

export interface IBusinessCalendar {
  id?: number
  code: string
  name: string
  timezone: string
  is_default: boolean
  is_active: boolean
  hours: IBusinessCalendarHour[]
  holidays: IBusinessCalendarHoliday[]
  users?: { id: number; name: string; email: string }[]
  user_ids?: number[]
}

class BusinessCalendarsModule extends FetchFactory<any> {
  private RESOURCE = '/business-calendars'

  async list(fetchOptions?: FetchOptions): Promise<IBusinessCalendar[]> {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async save(calendar: IBusinessCalendar, fetchOptions?: FetchOptions): Promise<IBusinessCalendar> {
    const body = JSON.stringify(calendar)
    return calendar.id
      ? this.call('PUT', `${this.RESOURCE}/${calendar.id}`, { body, ...fetchOptions })
      : this.call('POST', this.RESOURCE, { body, ...fetchOptions })
  }

  async remove(id: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async preview(
    body: { calendar: IBusinessCalendar; from?: string | null; mode: string; value: number },
    fetchOptions?: FetchOptions,
  ): Promise<{ from_local: string; deadline_local: string }> {
    return this.call('POST', `${this.RESOURCE}/preview`, { body: JSON.stringify(body), ...fetchOptions })
  }
}

export default BusinessCalendarsModule
