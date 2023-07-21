import * as holiday_jp from '@holiday-jp/holiday_jp'

export const { isHoliday } = holiday_jp

export const getHoliday = (date: Date) => holiday_jp.between(date, date)

export default holiday_jp