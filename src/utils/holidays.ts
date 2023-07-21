import * as holiday_jp from '@holiday-jp/holiday_jp'

const format = (date: Date) => {
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2)
    var day = ('0' + (date.getDate())).slice(-2)
    return (year + '-' + month + '-' + day)
}

export const isHoliday = (date: Date) => holiday_jp.isHoliday(date)

export const getHoliday = (date: Date) => holiday_jp.holidays[format(date)]
