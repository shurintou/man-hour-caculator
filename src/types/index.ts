export interface Task extends CommonTaskProp { }

export interface TaskTable extends CommonTaskProp { id: number }

export interface EditFormState extends CommonDateProp, CommonEditProp {
    tasks: TaskTable[] | undefined
    unsavedTasks: Task[] | undefined
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
    memo: string | undefined
}

interface CommonTaskProp {
    isDone: boolean
    startTime: string | undefined
    endTime: string | undefined
    description: string | undefined
}