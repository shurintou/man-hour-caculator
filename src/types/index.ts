export interface EditFormState extends CommonDateProp, CommonEditProp {
}

export interface DateTable extends CommonDateProp, CommonEditProp {
    date: string,
}

export interface TimeModalFormState extends CommonDateProp { }


interface CommonDateProp {
    startTime: string | undefined
    endTime: string | undefined
    scheduledWorkHours: number | undefined
    restHours: number | undefined
}

interface CommonEditProp {
    memo: string | undefined
}

export type mode = 'normal' | 'selectDate' | 'editDate' | 'editTime'
