import dayjs from 'dayjs'
import dayJsutcPlugin from 'dayjs/plugin/utc'

export function composeSevenDaysUtcDate(): string {
  // @ts-ignore
  dayjs.extend(dayJsutcPlugin)

  const sevenDaysAgo = dayjs.utc().subtract(7, 'day')

  const formattedTimestamp = `${sevenDaysAgo.year()}-0${
    sevenDaysAgo.month() + 1
  }-${sevenDaysAgo.date()}T00:00:00+00:00`

  return formattedTimestamp
}
