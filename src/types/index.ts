export interface Task extends CommonTaskProp { }

export interface TaskTable extends CommonTaskProp { }

export type DateType = "workday" | "holiday" | ""

export type HolidayType = "holiday" | "paid" | "sick" | "compensation" | "bereavement" | ""

export interface EditModalFormState extends CommonEditProp {
    date: string
    tasks: Task[] | undefined
}

export interface DateTable extends CommonDateProp, CommonEditProp {
    date: string,
    taskIndexes: number[] | undefined
}

export interface TimeModalFormState extends CommonDateProp { }


interface CommonDateProp {
    startTime: string | undefined
    endTime: string | undefined
    scheduledWorkHours: number | undefined
    restHours: number | undefined
}

interface CommonEditProp {
    type: DateType | undefined
    holidayType: HolidayType | undefined
    memo: string
}

interface CommonTaskProp {
    isDone: boolean
    startTime: string | undefined
    endTime: string | undefined
    description: string | undefined
}