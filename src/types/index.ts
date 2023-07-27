import { Dayjs } from 'dayjs'

export interface Task {
    isDone: boolean
    startTime?: Dayjs
    endTime?: Dayjs
    description: string
}

export interface TaskTable {
    isDone: boolean
    startTime: Dayjs
    endTime: Dayjs
    description: string
    indexes: {
        'by-isDone': boolean
        'by-description': string
    }
}

export type DateType = "workday" | "holiday" | ""

export type HolidayType = "holiday" | "paid" | "sick" | "compensation" | "bereavement" | ""

export interface EditModalFormState {
    date: Dayjs
    type: DateType
    holidayType: HolidayType
    tasks?: Task[]
    memo?: string
}

export interface DateTable {
    date: Date,
    type: DateType
    holidayType: HolidayType
    tasks: number[]
    memo: string
    scheduledWorkHours: number
    workTimeRange: [Dayjs, Dayjs] | [undefined, undefined]
    restHours: number
    indexes: {
        'by-memo': string
    }
}

export interface TimeModalFormState {
    scheduledWorkHours?: number
    workTimeRange?: [Dayjs, Dayjs] | [undefined, undefined]
    restHours?: number
}