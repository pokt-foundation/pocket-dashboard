import dayjs from 'dayjs'
import dayJsutcPlugin from 'dayjs/plugin/utc'

export function composeDaysFromNowUtcDate(daysAgo: number): string {
  dayjs.extend(dayJsutcPlugin)

  const dateDaysAgo = dayjs.utc().subtract(daysAgo, 'day')

  const formattedTimestamp = `${dateDaysAgo.year()}-0${
    dateDaysAgo.month() + 1
  }-${dateDaysAgo.date()}T00:00:00+00:00`

  return formattedTimestamp
}

export function composeHoursFromNowUtcDate(hoursAgo: number): string {
  dayjs.extend(dayJsutcPlugin)

  const dayAgo = dayjs.utc().subtract(hoursAgo, 'hour')

  const formattedTimestamp = `${dayAgo.year()}-0${
    dayAgo.month() + 1
  }-${dayAgo.date()}T${dayAgo.hour() + 1}:00:00+00:00`

  return formattedTimestamp
}

export function composeTodayUtcDate(): string {
  dayjs.extend(dayJsutcPlugin)

  const today = dayjs.utc()

  const todayBucket = `${today.year()}-0${
    today.month() + 1
  }-${today.date()}T00:00:00+00:00`

  return todayBucket
}
