<template>
    <a-modal title="Time" centered :open="props.isModalVisible" @ok="submitHandler" @cancel="changeModalVisible(false)"
        okText="submit" :maskClosable="false">
        <a-form :model="formState">
            <a-form-item label="Scheduled work hours" :labelCol="labelColStyle" v-bind="validateInfos.scheduledWorkHours">
                <a-input-number type="number" :style="inputStyle" v-model:value="formState.scheduledWorkHours"
                    :addon-after="timeInputAddonAfter" :step="timeInputStep" />
            </a-form-item>
            <a-form-item label="Start time" :labelCol="labelColStyle" v-bind="validateInfos.startTime">
                <a-time-picker v-model:value="formState.startTime" :valueFormat="timeValueFormat"
                    :format="timeDisplayFormat" :inputReadOnly="true" :minuteStep="timeMinuteStep" />
            </a-form-item>
            <a-form-item label="End time" :labelCol="labelColStyle" v-bind="validateInfos.endTime">
                <a-time-picker v-model:value="formState.endTime" :valueFormat="timeValueFormat" :format="timeDisplayFormat"
                    :inputReadOnly="true" :minuteStep="timeMinuteStep" />
            </a-form-item>
            <a-form-item label="Rest hours" :labelCol="labelColStyle" v-bind="validateInfos.restHours">
                <a-input-number type="number" :style="inputStyle" v-model:value="formState.restHours"
                    :addon-after="timeInputAddonAfter" :step="timeInputStep" />
            </a-form-item>
        </a-form>
        <a-alert v-if="dateStore.selectedDateList.length > 1" message="You are going to update multiple dates."
            type="warning" show-icon />
    </a-modal>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { useDateStore } from '@/stores/date'
import { useModeStore } from '@/stores/mode'
import type { UnwrapRef } from 'vue'
import type { TimeModalFormState, DateTable } from '@/types/index'
import emitter from '@/utils/emitter'
import db from '@/utils/datebase'
import { Form, message } from 'ant-design-vue'
import { timeModalRuleRef, timeInputAddonAfter, timeInputStep, timeMinuteStep, timeDisplayFormat, timeValueFormat } from '@/utils/rules'

const inputStyle = { width: '120px' }
const labelColStyle = { lg: { offset: 2 } }
const useForm = Form.useForm

const emit = defineEmits<{
    (e: 'changeTimeModalVisible', flg: boolean): void
}>()

const props = defineProps<{
    isModalVisible: boolean,
}>()

const dateStore = useDateStore()
const modeStore = useModeStore()

watch(() => props.isModalVisible, async (newVal) => {
    if (newVal === true) {
        if (dateStore.$state.selectedDateList.length === 1) {
            const dbHandler = await db
            const dateKey = dateStore.$state.selectedDateList[0].format("YYYYMMDD")
            const storedDateInfo = await dbHandler.get("dates", dateKey)
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

const { validate, validateInfos } = useForm(formState, timeModalRuleRef)


const changeModalVisible = (flg: boolean) => {
    emit("changeTimeModalVisible", flg)
}

const submitHandler = async (e: Event) => {
    e.preventDefault()
    const valid = await validate()
    if (valid) {
        const dbHandler = await db
        const transaction = dbHandler.transaction('dates', 'readwrite')
        try {
            for (const selectedDate of dateStore.$state.selectedDateList) {
                const dateKey = selectedDate.format("YYYYMMDD")
                const storedDateInfo = await transaction.objectStore("dates").get(dateKey)
                if (storedDateInfo) {
                    type TimeModalFormStateKey = keyof typeof formState
                    type DateInfoModalFormStateKey = keyof typeof storedDateInfo
                    Object.keys(formState).forEach((key) => {
                        const value = formState[key as TimeModalFormStateKey]
                        if (key in storedDateInfo) {
                            storedDateInfo[key as DateInfoModalFormStateKey] = value as never
                        }
                    })
                    await transaction.objectStore("dates").put(storedDateInfo)
                }
                else {
                    const addDto: DateTable = {
                        date: dateKey,
                        taskIndexes: undefined,
                        startTime: formState.startTime,
                        endTime: formState.endTime,
                        restHours: formState.restHours,
                        scheduledWorkHours: formState.scheduledWorkHours,
                        memo: undefined,
                    }
                    await transaction.objectStore("dates").add(addDto)
                }
                emitter.emit(dateKey)
            }
            await transaction.done
            dateStore.$reset()
            modeStore.initialize()
            message.success('update succeeded!')
        }
        catch (e: any) {
            console.error(e)
            message.error(e.message)
            transaction.abort()
        }
        changeModalVisible(false)
    }
}
</script>

<style >
.ant-picker-time-panel-column {
    overflow-y: auto !important
}
</style>