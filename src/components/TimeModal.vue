<template>
    <a-modal title="Time" centered :open="props.isModalVisible" @ok="changeModalVisible(false)"
        @cancel="changeModalVisible(false)" okText="submit" :maskClosable="false">
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
import type { TimeModalFormState } from '@/types/index'

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
    dateList: dateStore.$state.selectedDateList,
    scheduledWorkHours: 0,
    workTimeRange: [undefined, undefined],
    restHours: 0,
})
const changeModalVisible = (flg: boolean) => {
    emit("changeTimeModalVisible", flg)
}
</script>

<style >
.ant-picker-time-panel-column {
    overflow-y: auto !important;

}
</style>