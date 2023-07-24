import { Dayjs } from 'dayjs'

export interface Task {
    isDone: boolean
    startTime?: Dayjs
    endTime?: Dayjs
    description: string
}

export interface EditModalFormState {
    date: Dayjs
    type?: "workday" | "holiday" | ""
    holidayType?: "holiday" | "paid" | "sick" | "compensation" | "bereavement" | ""
    tasks?: Task[]
    memo?: string
}

export interface TimeModalFormState {
    dateList: Dayjs[]
    predictWorkHours?: number
    startTime?: Dayjs
    EndTime?: Dayjs
    restHours?: number
}