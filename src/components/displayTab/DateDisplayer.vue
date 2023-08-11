<template>
    <a-form :layout="layout" :model="formState">
        <a-divider orientation="left">Time</a-divider>
        <a-row>
            <a-col :md="{ span: 24 }" :lg="{ offset: lgOffset, span: 5 }" :xl="{ offset: xlOffset, span: 5 }">
                <a-form-item label="Scheduled work hours" v-bind="validateInfos.scheduledWorkHours">
                    <a-input-number type="number" :style="inputStyle" v-model:value="formState.scheduledWorkHours"
                        :addon-after="timeInputAddonAfter" :step="timeInputStep" />
                </a-form-item>
            </a-col>
            <a-col :md="{ span: 24 }" :lg="{ span: 6 }" :xl="{ span: 5 }">
                <a-form-item label="Start time" v-bind="validateInfos.startTime">
                    <a-time-picker v-model:value="formState.startTime" :valueFormat="timeValueFormat"
                        :format="timeDisplayFormat" :inputReadOnly="true" :minuteStep="timeMinuteStep" />
                </a-form-item>
            </a-col>
            <a-col :md="{ span: 24 }" :lg="{ span: 6 }" :xl="{ span: 5 }">
                <a-form-item label="End time" v-bind="validateInfos.endTime">
                    <a-time-picker v-model:value="formState.endTime" :valueFormat="timeValueFormat"
                        :format="timeDisplayFormat" :inputReadOnly="true" :minuteStep="timeMinuteStep" />
                </a-form-item>
            </a-col>
            <a-col :md="{ span: 24 }" :lg="{ span: 6 }" :xl="{ span: 5 }">
                <a-form-item label="Rest hours" v-bind="validateInfos.restHours">
                    <a-input-number type="number" :style="inputStyle" v-model:value="formState.restHours"
                        :addon-after="timeInputAddonAfter" :step="timeInputStep" />
                </a-form-item>
            </a-col>
        </a-row>
        <a-row>
            <a-col :lg="{ offset: lgOffset }" :xl="{ offset: xlOffset }">
                <a-form-item label="memo">
                    <a-textarea v-model:value="formState.memo" :style="textAreaStyle" placeholder="take down some memos"
                        :rows="2" />
                </a-form-item>
            </a-col>
        </a-row>
        <a-divider orientation="left">Tasks</a-divider>
        <a-row v-for="task in formState.tasks" :key="task.id" style="display: flex;" align="baseline">
            <a-col :lg="{ offset: lgOffset }" :xl="{ offset: xlOffset }">
                <a-space>
                    <a-form-item label="done">
                        <a-checkbox v-model:checked="task.isDone" :disabled="task.isDelete">Done</a-checkbox>
                    </a-form-item>
                    <a-form-item label="Start time" v-bind="validateInfos.startTime">
                        <a-time-picker v-model:value="task.startTime" :valueFormat="timeValueFormat"
                            :disabled="task.isDelete" :format="timeDisplayFormat" :inputReadOnly="true"
                            :placeholder="isPcMode ? 'Select time' : ''" />
                    </a-form-item>
                    <a-form-item label="End time" v-bind="validateInfos.endTime">
                        <a-time-picker v-model:value="task.endTime" :valueFormat="timeValueFormat" :disabled="task.isDelete"
                            :format="timeDisplayFormat" :inputReadOnly="true"
                            :placeholder="isPcMode ? 'Select time' : ''" />
                    </a-form-item>
                    <a-form-item label="description">
                        <a-input v-model:value="task.description" show-count :maxlength="taskMaxLength"
                            :disabled="task.isDelete" />
                    </a-form-item>
                    <MinusCircleOutlined v-if="!task.isDelete" @click="removeTask(task)" />
                    <PauseCircleOutlined v-else @click="removeTask(task)" />
                </a-space>
            </a-col>
        </a-row>
        <a-row v-for="(task, index) in formState.unsavedTasks" :key="index" style="display: flex;" align="baseline">
            <a-col :lg="{ offset: lgOffset }" :xl="{ offset: xlOffset }">
                <a-space>
                    <a-form-item label="done">
                        <a-checkbox v-model:checked="task.isDone">Done</a-checkbox>
                    </a-form-item>
                    <a-form-item label="Start time" v-bind="validateInfos.startTime">
                        <a-time-picker v-model:value="task.startTime" :valueFormat="timeValueFormat"
                            :format="timeDisplayFormat" :inputReadOnly="true"
                            :placeholder="isPcMode ? 'Select time' : ''" />
                    </a-form-item>
                    <a-form-item label="End time" v-bind="validateInfos.endTime">
                        <a-time-picker v-model:value="task.endTime" :valueFormat="timeValueFormat"
                            :format="timeDisplayFormat" :inputReadOnly="true"
                            :placeholder="isPcMode ? 'Select time' : ''" />
                    </a-form-item>
                    <a-form-item label="description">
                        <a-input v-model:value="task.description" show-count :maxlength="taskMaxLength" />
                    </a-form-item>
                    <a-popconfirm title="Are you sure delete this task?" ok-text="Yes" cancel-text="No"
                        @confirm="removeUnsavedTask(index)">
                        <MinusCircleOutlined />
                    </a-popconfirm>
                </a-space>
            </a-col>
        </a-row>
        <a-row>
            <a-col :lg="{ offset: lgOffset }" :xl="{ offset: xlOffset }">
                <a-form-item>
                    <a-button type="dashed" block @click="addUnsavedTask">
                        <PlusOutlined /> Add Task
                    </a-button>
                </a-form-item>
            </a-col>
        </a-row>
        <a-row>
            <a-col :lg="{ offset: lgOffset }" :xl="{ offset: xlOffset }">
                <a-form-item>
                    <a-button type="primary" @click="submitEditForm">Update</a-button>
                </a-form-item>
            </a-col>
        </a-row>
    </a-form>
</template>

<script lang="ts" setup>
import { reactive, computed, inject, watch, type UnwrapRef } from 'vue'
import type { Dayjs } from 'dayjs'
import { isPcModeKey, windowWidthKey, } from '@/types/inject'
import { windowWidthRef, isPcModeRef } from '@/main'
import type { EditFormState, TaskForm, DateTable } from '@/types/index'
import { timeInputAddonAfter, timeInputStep, timeMinuteStep, timeDisplayFormat, timeValueFormat } from '@/utils/rules'
import { Form, message } from 'ant-design-vue'
import { windowWidthConstant } from '@/config/constants'
import db from '@/utils/datebase'
import { PlusOutlined, MinusCircleOutlined, PauseCircleOutlined } from '@ant-design/icons-vue'
import { timeModalRuleRef } from '@/utils/rules'
import emitter from '@/utils/emitter'

const inputStyle = { width: '120px' }
const textAreaStyle = { width: '1200px' }
const lgOffset = 1
const xlOffset = 2
const taskMaxLength = 50
const windowWidth = inject(windowWidthKey, windowWidthRef)
const { mdWidth } = windowWidthConstant
const isPcMode = inject(isPcModeKey, isPcModeRef)
const useForm = Form.useForm
const props = defineProps<{
    currentDate: Dayjs,
}>()
const layout = computed(() => {
    if (windowWidth.value < mdWidth) return 'horizontal'
    return 'vertical'
})

const formState: UnwrapRef<EditFormState> = reactive({
    startTime: undefined,
    endTime: undefined,
    scheduledWorkHours: undefined,
    restHours: undefined,
    tasks: undefined,
    unsavedTasks: [],
    memo: undefined,
})

const { validate, validateInfos } = useForm(formState, timeModalRuleRef)

const fetchData = async () => {
    const dbHandler = await db
    const dateKey = props.currentDate.format("YYYYMMDD")
    const storedDateInfo = await dbHandler.get("dates", dateKey)
    if (storedDateInfo) {
        const { startTime, endTime, scheduledWorkHours, restHours, memo, taskIndexes } = storedDateInfo
        formState.startTime = startTime
        formState.endTime = endTime
        formState.scheduledWorkHours = scheduledWorkHours
        formState.restHours = restHours
        formState.memo = memo
        formState.tasks = undefined
        if (taskIndexes && taskIndexes.length > 0) {
            const storedTaskList: TaskForm[] = []
            for (const index of taskIndexes) {
                const storedTaskInfo = await dbHandler.get("tasks", index)
                if (storedTaskInfo) storedTaskList.push({ isDelete: false, ...storedTaskInfo })
            }
            formState.tasks = storedTaskList
        }
    }
    else {
        formState.startTime = undefined
        formState.endTime = undefined
        formState.scheduledWorkHours = undefined
        formState.restHours = undefined
        formState.memo = undefined
        formState.tasks = undefined
    }
}

watch(() => props.currentDate, async (newVal, oldVal) => {
    if (!oldVal || newVal.format('YYYYMMDD') !== oldVal.format('YYYYMMDD')) await fetchData()
}, { immediate: true })

const removeTask = (task: TaskForm) => task.isDelete = !task.isDelete

const addUnsavedTask = () => { formState.unsavedTasks.push({ startTime: undefined, endTime: undefined, description: undefined, isDone: false }) }
const removeUnsavedTask = (index: number) => formState.unsavedTasks.splice(index, 1)

const submitEditForm = async () => {
    await validate()
    const dbHandler = await db
    const transaction = dbHandler.transaction(['dates', 'tasks'], 'readwrite')
    try {
        const dateKey = props.currentDate.format("YYYYMMDD")
        const storedDateInfo = await transaction.objectStore("dates").get(dateKey)
        let unsavedTasksIndex: number[] = []
        if (formState.unsavedTasks.length > 0) {
            for (const task of formState.unsavedTasks) {
                const key = await transaction.objectStore("tasks").add({ ...task })
                unsavedTasksIndex.push(key)
            }
        }
        if (storedDateInfo) {
            type TimeModalFormStateKey = keyof typeof formState
            type DateInfoModalFormStateKey = keyof typeof storedDateInfo
            Object.keys(formState).forEach((key) => {
                const value = formState[key as TimeModalFormStateKey]
                if (key in storedDateInfo) {
                    storedDateInfo[key as DateInfoModalFormStateKey] = value as never
                }
            })
            if (formState.tasks) {
                for (const task of formState.tasks) {
                    const index = storedDateInfo.taskIndexes?.findIndex(taskIndex => taskIndex === task.id)
                    if (task.isDelete) {
                        if (index) {
                            storedDateInfo.taskIndexes?.splice(index, 1)
                            await transaction.objectStore("tasks").delete(index)
                        }
                    }
                    else {
                        await transaction.objectStore("tasks").put(
                            { id: task.id, isDone: task.isDone, startTime: task.startTime, endTime: task.endTime, description: task.description }
                        )
                    }
                }
            }
            storedDateInfo.taskIndexes = storedDateInfo.taskIndexes?.concat(unsavedTasksIndex)
            await transaction.objectStore("dates").put(storedDateInfo)
        }
        else {
            const addDto: DateTable = {
                date: dateKey,
                taskIndexes: unsavedTasksIndex,
                startTime: formState.startTime,
                endTime: formState.endTime,
                restHours: formState.restHours,
                scheduledWorkHours: formState.scheduledWorkHours,
                memo: formState.memo,
            }
            await transaction.objectStore("dates").add(addDto)
        }
        emitter.emit(dateKey)
        formState.unsavedTasks = []
        await transaction.done
        await fetchData()
    }
    catch (e: any) {
        console.error(e)
        message.error(e.message)
        transaction.abort()
    }
}

</script>