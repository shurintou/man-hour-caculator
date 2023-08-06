<template>
    <a-modal title="Time" centered :open="props.isModalVisible" @ok="submitHandler" @cancel="changeModalVisible(false)"
        okText="submit" :maskClosable="false">
        <a-form :model="formState">
            <a-form-item label="Scheduled work hours" :labelCol="labelColStyle" v-bind="validateInfos.scheduledWorkHours">
                <a-input-number type="number" :style="inputStyle" v-model:value="formState.scheduledWorkHours"
                    :addon-after="inputAddonAfter" :step="inputStep" />
            </a-form-item>
            <a-form-item label="Start time" :labelCol="labelColStyle" v-bind="validateInfos.startTime">
                <a-time-picker v-model:value="formState.startTime" valueFormat="HHmm" format="HH:mm" :inputReadOnly="true"
                    :minuteStep="minuteStep" />
            </a-form-item>
            <a-form-item label="End time" :labelCol="labelColStyle" v-bind="validateInfos.endTime">
                <a-time-picker v-model:value="formState.endTime" valueFormat="HHmm" format="HH:mm" :inputReadOnly="true"
                    :minuteStep="minuteStep" />
            </a-form-item>
            <a-form-item label="Rest hours" :labelCol="labelColStyle" v-bind="validateInfos.restHours">
                <a-input-number type="number" :style="inputStyle" v-model:value="formState.restHours"
                    :addon-after="inputAddonAfter" :step="inputStep" />
            </a-form-item>
        </a-form>
        <a-alert v-if="dateStore.selectedDateList.length > 1" message="You are going to update multiple dates."
            type="warning" show-icon />
    </a-modal>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { useDateStore } from '@/stores/date'
import type { UnwrapRef } from 'vue'
import type { TimeModalFormState, DateType, HolidayType, DateTable } from '@/types/index'
import emitter from '@/utils/emitter'
import db from '@/utils/datebase'
import { Form } from 'ant-design-vue'

const inputAddonAfter = "hour"
const inputStep = 0.01
const inputStyle = { width: '120px' }
const labelColStyle = { lg: { offset: 2 } }
const minuteStep = 5
const useForm = Form.useForm

const rulesRef = reactive({
    scheduledWorkHours: [
        {
            pattern: /^(?:\d|1\d|2[0-3])(\.\d{1,2})?$|^24(\.00?)?$/,
            message: 'Hour should be 0 to 24',
            trigger: 'blur',
        },
    ],
    startTime: [
        {
            pattern: /^([0-1][0-9]|2[0-3])[0-5][0-9]$/,
            message: 'Format is not valid',
            trigger: 'blur',
        },
    ],
    endTime: [
        {
            pattern: /^([0-1][0-9]|2[0-3])[0-5][0-9]$/,
            message: 'Format is not valid',
            trigger: 'blur',
        },
    ],
    restHours: [
        {
            pattern: /^(?:\d|1\d|2[0-3])(\.\d{1,2})?$|^24(\.00?)?$/,
            message: 'Hour should be 0 to 24',
            trigger: 'blur',
        },
    ],
})


const emit = defineEmits<{
    (e: 'changeTimeModalVisible', flg: boolean): void
}>()

const props = defineProps<{
    isModalVisible: boolean,
}>()

const dateStore = useDateStore()

watch(() => props.isModalVisible, async (newVal) => {
    if (newVal === true) {
        if (dateStore.$state.selectedDateList.length === 1) {
            const dbHandler = await db
            const transaction = dbHandler.transaction('dates', 'readwrite')
            const dateKey = dateStore.$state.selectedDateList[0].format("YYYYMMDD")
            const storedDateInfo = await dbHandler.get("dates", dateKey)
            await transaction.done
            if (storedDateInfo) {
                const { startTime, endTime, scheduledWorkHours, restHours } = storedDateInfo
                formState.startTime = startTime
                formState.endTime = endTime
                formState.scheduledWorkHours = scheduledWorkHours
                formState.restHours = restHours
                return
            }
        }
    }
    formState.startTime = undefined
    formState.endTime = undefined
    formState.scheduledWorkHours = undefined
    formState.restHours = undefined
})

const formState: UnwrapRef<TimeModalFormState> = reactive({
    startTime: undefined,
    endTime: undefined,
    scheduledWorkHours: undefined,
    restHours: undefined,
})

const { validate, validateInfos } = useForm(formState, rulesRef)


const changeModalVisible = (flg: boolean) => {
    emit("changeTimeModalVisible", flg)
}

const submitHandler = async (e: Event) => {
    e.preventDefault()
    const valid = await validate()
    if (valid) {
        const dbHandler = await db
        const transaction = dbHandler.transaction('dates', 'readwrite')
        dateStore.$state.selectedDateList.forEach(async (selectedDate) => {
            const dateKey = selectedDate.format("YYYYMMDD")
            const storedDateInfo = await dbHandler.get("dates", dateKey)
            if (storedDateInfo) {
                type TimeModalFormStateKey = keyof typeof formState
                type DateInfoModalFormStateKey = keyof typeof storedDateInfo
                Object.keys(formState).forEach((key) => {
                    const value = formState[key as TimeModalFormStateKey]
                    if (value && key in storedDateInfo) {
                        storedDateInfo[key as DateInfoModalFormStateKey] = value as never
                    }
                })
                await dbHandler.put("dates", storedDateInfo)
            }
            else {
                const addDto: DateTable = {
                    date: dateKey,
                    type: "" as DateType,
                    holidayType: "" as HolidayType,
                    tasks: undefined,
                    startTime: formState.startTime,
                    endTime: formState.endTime,
                    restHours: formState.restHours,
                    scheduledWorkHours: formState.scheduledWorkHours,
                    memo: "",
                }
                await dbHandler.add("dates", addDto)
            }
            emitter.emit(dateKey)
        })
        await transaction.done
        dateStore.$reset()
        changeModalVisible(false)
    }
}
</script>

<style >
.ant-picker-time-panel-column {
    overflow-y: auto !important
}
</style>