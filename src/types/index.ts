export interface UnsavedTaskForm extends CommonTaskProp { validated: boolean }

export interface TaskTable extends CommonTaskProp { id?: number }

export interface TaskForm extends TaskTable { isDelete: boolean, validated: boolean }

export interface EditFormState extends CommonDateProp, CommonEditProp {
    tasks: TaskForm[] | undefined
    unsavedTasks: UnsavedTaskForm[]
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