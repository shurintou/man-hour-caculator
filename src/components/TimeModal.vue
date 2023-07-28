<template>
    <a-modal title="Time" centered :open="props.isModalVisible" @ok="submitHandler" @cancel="changeModalVisible(false)"
        okText="submit" :maskClosable="false">
        <a-form :model="formState">
            <a-form-item label="Scheduled work hours" :labelCol="labelColStyle">
                <a-input-number :style="inputStyle" v-model:value="formState.scheduledWorkHours" :min="inputMin"
                    :max="inputMax" :addon-after="inputAddonAfter" :step="inputStep" />
            </a-form-item>
            <a-form-item label="Start time" :labelCol="labelColStyle">
                <a-time-picker v-model:value="formState.startTime" valueFormat="HHmm" format="HH:mm" :inputReadOnly="true"
                    :minuteStep="minuteStep" />
            </a-form-item>
            <a-form-item label="End time" :labelCol="labelColStyle">
                <a-time-picker v-model:value="formState.endTime" valueFormat="HHmm" format="HH:mm" :inputReadOnly="true"
                    :minuteStep="minuteStep" />
            </a-form-item>
            <a-form-item label="Rest hours" :labelCol="labelColStyle">
                <a-input-number :style="inputStyle" v-model:value="formState.restHours" :min="inputMin" :max="inputMax"
                    :addon-after="inputAddonAfter" :step="inputStep" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useDateStore } from '@/stores/date'
import type { UnwrapRef } from 'vue'
import type { TimeModalFormState, DateType, HolidayType, DateTable } from '@/types/index'
import db from '@/utils/datebase'

const inputMin = 0
const inputMax = 24
const inputAddonAfter = "hour"
const inputStep = 0.01
const inputStyle = { width: '120px' }
const labelColStyle = { lg: { offset: 2 } }
const minuteStep = 5

const emit = defineEmits<{
    (e: 'changeTimeModalVisible', flg: boolean): void
}>()

const props = defineProps<{
    isModalVisible: boolean,
}>()

const dateStore = useDateStore()

const formState: UnwrapRef<TimeModalFormState> = reactive({
    startTime: undefined,
    endTime: undefined,
    scheduledWorkHours: undefined,
    restHours: undefined,
})
const changeModalVisible = (flg: boolean) => {
    emit("changeTimeModalVisible", flg)
}

const submitHandler = async (e: Event) => {
    e.preventDefault()
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

    })
    await transaction.done
    changeModalVisible(false)
}
</script>

<style >
.ant-picker-time-panel-column {
    overflow-y: auto !important;

}
</style>