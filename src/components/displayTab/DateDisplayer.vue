<template>
    <a-form ref="formRef" :model="formState">
        <a-descriptions size="small" bordered :column="{ xxl: 3, xl: 3, lg: 3, md: 1, sm: 1, xs: 1 }">
            <template #title>
                <div class="date-displayer-holiday">{{ displayJapaneseHoliday }}</div>
            </template>
            <template #extra>
                <a-space v-if="isEditing">
                    <a-button type="primary" :icon="h(CheckOutlined)" @click="submitEditForm">
                        <span v-if="isPcMode">Submit</span>
                    </a-button>
                    <a-button type="primary" :icon="h(CloseCircleOutlined)" danger @click="editDate">
                        <span v-if="isPcMode">Cancel</span>
                    </a-button>
                </a-space>
                <a-button v-else :icon="h(EditOutlined)" @click="editDate">
                    <span v-if="isPcMode">Edit</span>
                </a-button>
            </template>
            <a-descriptions-item label="Scheduled work hours">
                <a-input-number v-if="isEditing" type="number" :style="inputStyle"
                    v-model:value="formState.scheduledWorkHours" v-bind="validateInfos.scheduledWorkHours"
                    :addon-after="timeInputAddonAfter" :step="timeInputStep" />
                <div v-else :style="inputStyle">{{ displayScheduledWorkHours }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="Actual work hours">{{ displayWorkTime }}</a-descriptions-item>
            <a-descriptions-item label="Overtime hours">
                {{ displayOvertimeHours }}
            </a-descriptions-item>
            <a-descriptions-item label="Start time">
                <a-time-picker v-if="isEditing" v-model:value="formState.startTime" :valueFormat="timeValueFormat"
                    :style="inputStyle" v-bind="validateInfos.startTime" :format="timeDisplayFormat" :inputReadOnly="true"
                    :minuteStep="timeMinuteStep" />
                <div v-else :style="inputStyle">{{ displayStartTime }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="End time">
                <a-time-picker v-if="isEditing" v-model:value="formState.endTime" :valueFormat="timeValueFormat"
                    :style="inputStyle" v-bind="validateInfos.endTime" :format="timeDisplayFormat" :inputReadOnly="true"
                    :minuteStep="timeMinuteStep" />
                <div v-else :style="inputStyle"> {{ displayEndTime }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="Rest hours">
                <a-input-number v-if="isEditing" type="number" :style="inputStyle" v-model:value="formState.restHours"
                    v-bind="validateInfos.restHours" :addon-after="timeInputAddonAfter" :step="timeInputStep" />
                <div v-else :style="inputStyle"> {{ displayRestHours }} </div>
            </a-descriptions-item>
            <a-descriptions-item label="Memo" :span="isPcMode ? 3 : 1" :style="textAreaStyle">
                <a-textarea :style="textAreaStyle" v-if="isEditing" :auto-size="{ minRows: 2, maxRows: 5 }"
                    v-model:value="formState.memo" placeholder="take down some memos" />
                <div v-else :style="textAreaStyle">{{ displayMemo }}</div>
            </a-descriptions-item>
        </a-descriptions>
        <a-divider orientation="left">Tasks</a-divider>
        <a-row v-for="task in formState.tasks" :key="task.id" style="display: flex;" align="baseline">
            <a-col :lg="{ offset: lgOffset }" :xl="{ offset: xlOffset }">
                <a-space align="baseline">
                    <a-form-item label="Done">
                        <a-checkbox v-model:checked="task.isDone" :disabled="task.isDelete" />
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
                    <a-form-item label="Description" :rules="{ required: true }"
                        :help="task.validated ? '' : 'Missing description'" :validateStatus="task.validated ? '' : 'error'">
                        <a-input v-model:value="task.description" show-count :maxlength="taskMaxLength"
                            :disabled="task.isDelete" />
                    </a-form-item>
                    <a-button v-if="!task.isDelete" @click="removeTask(task)" :icon="h(MinusCircleOutlined)" danger
                        type="primary" :size="isPcMode ? 'middle' : 'small'">
                    </a-button>
                    <a-button v-else @click="removeTask(task)" :icon="h(PauseCircleOutlined)"
                        :size="isPcMode ? 'middle' : 'small'">
                    </a-button>
                </a-space>
            </a-col>
        </a-row>
        <a-row v-for="(task, index) in formState.unsavedTasks" :key="index" style="display: flex;" align="baseline">
            <a-col :lg="{ offset: lgOffset }" :xl="{ offset: xlOffset }">
                <a-space align="baseline">
                    <a-form-item label="Done">
                        <a-checkbox v-model:checked="task.isDone" />
                    </a-form-item>
                    <a-form-item label="Start time" v-bind="validateInfos.startTime">
                        <a-time-picker v-model:value="task.startTime" :valueFormat="timeValueFormat" style="height: 35px;"
                            :format="timeDisplayFormat" :inputReadOnly="true"
                            :placeholder="isPcMode ? 'Select time' : ''" />
                    </a-form-item>
                    <a-form-item label="End time" v-bind="validateInfos.endTime">
                        <a-time-picker v-model:value="task.endTime" :valueFormat="timeValueFormat" style="height: 35px;"
                            :format="timeDisplayFormat" :inputReadOnly="true"
                            :placeholder="isPcMode ? 'Select time' : ''" />
                    </a-form-item>
                    <a-form-item label="Description" :rules="{ required: true }"
                        :help="task.validated ? '' : 'Missing description'" :validateStatus="task.validated ? '' : 'error'">
                        <a-input v-model:value="task.description" show-count :maxlength="taskMaxLength"
                            style="height: 35px;" />
                    </a-form-item>
                    <a-popconfirm title="Are you sure delete this task?" ok-text="Yes" cancel-text="No" placement="left"
                        @confirm="removeUnsavedTask(index)">
                        <a-button :icon="h(MinusCircleOutlined)" danger type="primary"
                            :size="isPcMode ? 'middle' : 'small'">
                        </a-button>
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
    </a-form>
</template>

<script lang="ts" setup>
import { h, ref, reactive, computed, watch, onMounted, inject, type UnwrapRef } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { getJapenseHoliday } from '@/utils/holidays'
import { timeInputAddonAfter, timeInputStep, timeMinuteStep, timeDisplayFormat, timeValueFormat, timeModalRuleRef } from '@/utils/rules'
import { EditOutlined, CloseCircleOutlined, CheckOutlined, PlusOutlined, MinusCircleOutlined, PauseCircleOutlined } from '@ant-design/icons-vue'
import db from '@/utils/datebase'
import type { EditFormState, TaskForm, DateTable } from '@/types/index'
import { fixNumToStr } from '@/utils/common'
import { useModeStore } from '@/stores/mode'
import { Form, message } from 'ant-design-vue'
import { isPcModeRef } from '@/main'
import { isPcModeKey } from '@/types/inject'
import emitter from '@/utils/emitter'
const isPcMode = inject(isPcModeKey, isPcModeRef)

const useForm = Form.useForm
const formRef = ref()

const props = defineProps<{
    currentDate: Dayjs,
}>()
const modeStore = useModeStore()
const editDate = () => modeStore.toggltEditDate()
const isEditing = computed(() => modeStore.currentMode === 'editDate')
const inputStyle = { width: '120px', height: '30px', lineHeight: '30px' }
const textAreaStyle = computed(() => isPcMode.value === true ? { height: '54px' } : { minWidth: '46vw', height: '54px' }) // 54px height will keep the description label's position stable.

const displayJapaneseHoliday = ref<string>("")
const displayStartTime = ref<string>("")
const displayEndTime = ref<string>("")
const displayWorkTime = ref<string>("")
const displayRestHours = ref<string>("")
const displayOvertimeHours = ref<string>("")
const displayMemo = ref<string>("")
const displayScheduledWorkHours = ref<string>("")

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


onMounted(async () => fetchDateData())
watch(() => props.currentDate, async (newDate, oldDate) => {
    if (!newDate.isSame(oldDate)) fetchDateData()
})

const fetchDateData = async () => {
    const dbHandler = await db
    const dateKey = props.currentDate.format("YYYYMMDD")
    const storedDateInfo = await dbHandler.get("dates", dateKey)
    displayWorkTime.value = displayOvertimeHours.value = ""
    displayStartTime.value = displayEndTime.value = displayMemo.value = displayRestHours.value = displayScheduledWorkHours.value = ""
    formState.startTime = undefined
    formState.endTime = undefined
    formState.scheduledWorkHours = undefined
    formState.restHours = undefined
    formState.memo = undefined
    formState.tasks = undefined
    if (storedDateInfo) {
        const { startTime, endTime, restHours, scheduledWorkHours, taskIndexes, memo } = storedDateInfo
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
                if (storedTaskInfo) storedTaskList.push({ isDelete: false, validated: true, ...storedTaskInfo })
            }
            formState.tasks = storedTaskList
        }
        let startDate, endDate = null
        if (startTime) {
            startDate = dayjs(startTime, 'HHmm')
            displayStartTime.value = startDate.format('HH:mm')
        }
        if (endTime) {
            endDate = dayjs(endTime, 'HHmm')
            displayEndTime.value = endDate.format('HH:mm')
        }
        displayRestHours.value = restHours?.toString() || ""
        if (startDate && endDate) {
            const realWorkTime = endDate.diff(startDate, "hour", true)
            displayWorkTime.value = fixNumToStr(realWorkTime - (restHours || 0))
            const overtimeHours = realWorkTime - (restHours || 0) - (scheduledWorkHours || 0)
            if (overtimeHours > 0) displayOvertimeHours.value = fixNumToStr(overtimeHours)
        }
        displayScheduledWorkHours.value = scheduledWorkHours?.toString() || ""
        displayMemo.value = memo || ''
    }

    const japaneseHoliday = getJapenseHoliday(props.currentDate.toDate())
    displayJapaneseHoliday.value = ""
    if (japaneseHoliday) {
        displayJapaneseHoliday.value = japaneseHoliday.name_en
        if (japaneseHoliday.name.indexOf("振替") !== -1) { displayJapaneseHoliday.value += "　振替休日" }
        else { displayJapaneseHoliday.value += "　" + japaneseHoliday.name }
    }
}

const lgOffset = 1
const xlOffset = 2
const taskMaxLength = 50
const removeTask = (task: TaskForm) => task.isDelete = !task.isDelete
const addUnsavedTask = () => { formState.unsavedTasks.push({ validated: true, startTime: undefined, endTime: undefined, description: undefined, isDone: false }) }
const removeUnsavedTask = (index: number) => formState.unsavedTasks.splice(index, 1)
const submitEditForm = async () => {
    await validate()
    const dbHandler = await db
    const transaction = dbHandler.transaction(['dates', 'tasks'], 'readwrite')
    let shouldSubmit = true
    try {
        const dateKey = props.currentDate.format("YYYYMMDD")
        const storedDateInfo = await transaction.objectStore("dates").get(dateKey)
        let unsavedTasksIndex: number[] = []
        if (formState.unsavedTasks.length > 0) {
            for (const task of formState.unsavedTasks) {
                if (task.description && task.description.length > 0) {
                    const key = await transaction.objectStore("tasks").add({ ...task })
                    unsavedTasksIndex.push(key)
                }
                else {
                    task.validated = false
                    shouldSubmit = false
                }
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
                        if (index !== undefined && index >= 0) {
                            storedDateInfo.taskIndexes?.splice(index, 1)
                            if (task.id) await transaction.objectStore("tasks").delete(task.id)
                        }
                    }
                    else {
                        if (task.description && task.description.length > 0) {
                            await transaction.objectStore("tasks").put(
                                { id: task.id, isDone: task.isDone, startTime: task.startTime, endTime: task.endTime, description: task.description }
                            )
                        }
                        else {
                            task.validated = false
                            shouldSubmit = false
                        }
                    }
                }
            }
            storedDateInfo.taskIndexes = (storedDateInfo.taskIndexes || []).concat(unsavedTasksIndex)
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
        if (!shouldSubmit) {
            transaction.abort()
            return
        }
        emitter.emit(dateKey)
        formState.unsavedTasks = []
        await transaction.done
        await fetchDateData()
        message.success('update succeeded!')
        modeStore.initialize()
        formRef.value.resetFields()
    }
    catch (e: any) {
        console.error(e)
        message.error(e.message)
        transaction.abort()
    }
}
</script>

<style scoped>
.date-displayer-holiday {
    margin-left: 18px;
    color: #ff4d4f;
    font-weight: bold;
}
</style>