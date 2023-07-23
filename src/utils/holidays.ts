import * as holiday_jp from '@holiday-jp/holiday_jp'
import { Dayjs } from 'dayjs'

const format = (date: Date) => {
    var year = date.getFullYear()
    var month = ('0' + (date.getMonth() + 1)).slice(-2)
    var day = ('0' + (date.getDate())).slice(-2)
    return (year + '-' + month + '-' + day)
}

export const getJapenseHoliday = (date: Date) => holiday_jp.holidays[format(date)]

export const isSameDay = (date1: Dayjs, date2: Dayjs) => date1.isSame(date2, "day")
