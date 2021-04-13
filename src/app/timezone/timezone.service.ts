/**
 * Timezone conversion courtesy of André Pena
 * (https://stackoverflow.com/questions/37001869/)
 */
import { Injectable } from '@angular/core'
import * as cityTimeZones from 'city-timezones'
import * as moment from 'moment-timezone'

@Injectable({ providedIn: 'root' })
export class TimezoneService {
  // Returns the UTC offset for the given timezone
  getNormalizedUtcOffset(timezone: string): number | null {
    const momentTimezone = moment.tz(timezone)
    if (!momentTimezone) {
      return null
    }
    let offset = momentTimezone.utcOffset()
    if (momentTimezone.isDST()) {
      // utcOffset will return the offset normalized by DST. If the location
      // is in daylight saving time now, it will be adjusted for that
      offset -= 60
    }
    return offset / 60
  }

  // Returns the offset range for the given city or region
  getUtcOffsetForLocation(location: string): number[] | null {
    const timezones = cityTimeZones.findFromCityStateProvince(location)
    if (timezones && timezones.length) {
      // Timezones will contain an array of all timezones for all cities inside
      // the given location. For example, if location is a country, this will contain
      // all timezones of all cities inside the country
      const offsetSet = new Set<number>()
      for (const timezone of timezones) {
        const offset = this.getNormalizedUtcOffset(timezone.timezone)
        if (offset !== null) {
          offsetSet.add(offset)
        }
      }

      return [...offsetSet].sort((a, b) => a - b)
    }
    return null
  }
}
