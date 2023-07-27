<template>
    <a-modal title="Time" centered :open="props.isModalVisible" @ok="submitHandler" @cancel="changeModalVisible(false)"
        okText="submit" :maskClosable="false">
        <a-form :model="formState">
            <a-form-item label="Scheduled work hours" :labelCol="labelColStyle">
                <a-input-number :style="inputStyle" v-model:value="formState.scheduledWorkHours" :min="inputMin"
                    :max="inputMax" :addon-after="inputAddonAfter" :step="inputStep" />
            </a-form-item>
            <a-form-item label="Real work times" :labelCol="labelColStyle">
                <a-time-range-picker v-model:value="formState.workTimeRange" format="HH:mm" :inputReadOnly="true" />
            </a-form-item>
            <a-form-item label="Real rest hours" :labelCol="labelColStyle">
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
import type { TimeModalFormState, DateType, HolidayType } from '@/types/index'
import db from '@/utils/datebase'

const inputMin = 0
const inputMax = 24
const inputAddonAfter = "hour"
const inputStep = 0.01
const inputStyle = { width: '120px' }
const labelColStyle = { lg: { offset: 2 } }

const emit = defineEmits<{
    (e: 'changeTimeModalVisible', flg: boolean): void
}>()

const props = defineProps<{
    isModalVisible: boolean,
}>()

const dateStore = useDateStore()

const formState: UnwrapRef<TimeModalFormState> = reactive({
    scheduledWorkHours: undefined,
    workTimeRange: undefined,
    restHours: undefined,
})
const changeModalVisible = (flg: boolean) => {
    emit("changeTimeModalVisible", flg)
}

const submitHandler = async (e: Event) => {
    console.log(123)
    e.preventDefault()
    const dbHandler = await db
    const transaction = dbHandler.transaction('dates', 'readwrite')
    dateStore.$state.selectedDateList.forEach(async (selectedDate) => {
        const dateKey = selectedDate.toDate()
        const storedDateInfo = await dbHandler.get("dates", dateKey)
        if (storedDateInfo) {
            type TimeModalFormStateKey = keyof typeof formState
            type DateInfoModalFormStateKey = keyof typeof storedDateInfo
            Object.keys(formState).forEach((key) => {
                if (formState[key as TimeModalFormStateKey] && key in storedDateInfo) {
                    storedDateInfo[key as DateInfoModalFormStateKey] = formState[key as TimeModalFormStateKey] as never
                }
            })
            const res = await dbHandler.put("dates", storedDateInfo)
        }
        else {
            const addDto = {
                date: dateKey,
                type: "" as DateType,
                holidayType: "" as HolidayType,
                tasks: [],
                restHours: formState.restHours || 0,
                scheduledWorkHours: formState.scheduledWorkHours || 0,
                workTimeRange: formState.workTimeRange || [undefined, undefined],
                memo: "",
                indexes: { "by-memo": "" }
            }
            const res = await dbHandler.add("dates", addDto)
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