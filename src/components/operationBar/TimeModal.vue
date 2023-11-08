<template>
    <a-modal title="Time" centered :open="props.isModalVisible" :maskClosable="false" :closable="false">
        <template #footer>
            <OkCancelButton :submitFunc="submitHandler" :cancelFunc="cancelHandler"
                :isFormStateModified="isFormStateModified" />
        </template>
        <a-form :model="formState" ref="formRef">
            <a-form-item label="Scheduled work hours" :labelCol="labelColStyle" v-bind="validateInfos.scheduledWorkHours"
                :validateStatus="scheduledWorkHoursValidateStatus"
                :help="scheduledWorkHoursValidateStatus === 'warning' ? helpMessage : ''">
                <a-input-number type="number" :style="inputStyle" v-model:value="formState.scheduledWorkHours"
                    :addon-after="timeInputAddonAfter" :step="timeInputStep" />
            </a-form-item>
            <a-form-item label="Start time" :labelCol="labelColStyle" v-bind="validateInfos.startTime"
                :validateStatus="startTimeValidateStatus" :help="startTimeValidateStatus === 'warning' ? helpMessage : ''">
                <a-time-picker v-model:value="formState.startTime" :valueFormat="timeValueFormat"
                    :format="timeDisplayFormat" :inputReadOnly="true" :minuteStep="timeMinuteStep" />
            </a-form-item>
            <a-form-item label="End time" :labelCol="labelColStyle" v-bind="validateInfos.endTime"
                :validateStatus="endTimeValidateStatus" :help="endTimeValidateStatus === 'warning' ? helpMessage : ''">
                <a-time-picker v-model:value="formState.endTime" :valueFormat="timeValueFormat" :format="timeDisplayFormat"
                    :inputReadOnly="true" :minuteStep="timeMinuteStep" />
            </a-form-item>
            <a-form-item label="Rest hours" :labelCol="labelColStyle" v-bind="validateInfos.restHours"
                :validateStatus="restHoursValidateStatus" :help="restHoursValidateStatus === 'warning' ? helpMessage : ''">
                <a-input-number type="number" :style="inputStyle" v-model:value="formState.restHours"
                    :addon-after="timeInputAddonAfter" :step="timeInputStep" />
            </a-form-item>
        </a-form>
        <a-alert message="The empty item won't affect any dates." type="info" show-icon style="margin-bottom: 7px;" />
        <a-alert v-if="dateStore.selectedDateList.length > 1" message="The filled item will update all selected dates."
            type="warning" show-icon />
    </a-modal>
</template>

<script lang="ts" setup>
import { watch, ref, nextTick } from 'vue'
import { useDateStore } from '@/stores/date'
import { useModeStore } from '@/stores/mode'
import type { TimeModalFormState, DateTable } from '@/types/index'
import emitter from '@/utils/emitter'
import db from '@/utils/datebase'
import { Form, message } from 'ant-design-vue'
import { timeModalRuleRef, timeInputAddonAfter, timeInputStep, timeMinuteStep, timeDisplayFormat, timeValueFormat } from '@/utils/rules'
import type { ValidateStatus } from 'ant-design-vue/es/form/FormItem'
import { useFormWatcher } from '@/utils/formWatcher'
import OkCancelButton from '@/components/common/OkCancleButton.vue'

const inputStyle = { width: '120px' }
const labelColStyle = { lg: { offset: 2 } }
const useForm = Form.useForm
const formRef = ref()
const helpMessage = 'Including different values.'

const emit = defineEmits<{
    (e: 'changeTimeModalVisible', flg: boolean): void
}>()

const props = defineProps<{
    isModalVisible: boolean,
}>()

const dateStore = useDateStore()
const modeStore = useModeStore()

const scheduledWorkHoursValidateStatus = ref<ValidateStatus>("")
const startTimeValidateStatus = ref<ValidateStatus>("")
const endTimeValidateStatus = ref<ValidateStatus>("")
const restHoursValidateStatus = ref<ValidateStatus>("")

watch(() => props.isModalVisible, async (newVal) => {
    if (newVal === true) {
        isFormStateModified.value = false
        modeStore.currentMode = 'editTime'
        let shouldCheckScheduledWorkHours = true
        let shouldCheckStartTime = true
        let shouldCheckEndTime = true
        let shouldCheckRestHours = true
        const dbHandler = await db
        for (const selectedDate of dateStore.$state.selectedDateList) {
            if (scheduledWorkHoursValidateStatus.value === "warning") shouldCheckScheduledWorkHours = false
            if (startTimeValidateStatus.value === "warning") shouldCheckStartTime = false
            if (endTimeValidateStatus.value === "warning") shouldCheckEndTime = false
            if (restHoursValidateStatus.value === "warning") shouldCheckRestHours = false
            if (shouldCheckScheduledWorkHours === false && shouldCheckStartTime === false && shouldCheckEndTime === false && shouldCheckRestHours === false) break
            const dateKey = selectedDate.format("YYYYMMDD")
            const storedDateInfo = await dbHandler.get("dates", dateKey)
            let scheduledWorkHours = undefined
            let startTime = undefined
            let endTime = undefined
            let restHours = undefined
            if (storedDateInfo) {
                startTime = storedDateInfo.startTime
                endTime = storedDateInfo.endTime
                scheduledWorkHours = storedDateInfo.scheduledWorkHours
                restHours = storedDateInfo.restHours
            }
            if (shouldCheckScheduledWorkHours) {
                shouldCheckScheduledWorkHours = formState.scheduledWorkHours === undefined || formState.scheduledWorkHours === scheduledWorkHours
                if (!shouldCheckScheduledWorkHours) {
                    formState.scheduledWorkHours = undefined
                    scheduledWorkHoursValidateStatus.value = "warning"
                }
                else {
                    formState.scheduledWorkHours = scheduledWorkHours
                }
            }
            if (shouldCheckStartTime) {
                shouldCheckStartTime = formState.startTime === undefined || formState.startTime === startTime
                if (!shouldCheckStartTime) {
                    formState.startTime = undefined
                    startTimeValidateStatus.value = "warning"
                }
                else {
                    formState.startTime = startTime
                }
            }
            if (shouldCheckEndTime) {
                shouldCheckEndTime = formState.endTime === undefined || formState.endTime === endTime
                if (!shouldCheckEndTime) {
                    formState.endTime = undefined
                    endTimeValidateStatus.value = "warning"
                }
                else {
                    formState.endTime = endTime
                }
            }
            if (shouldCheckRestHours) {
                shouldCheckRestHours = formState.restHours === undefined || formState.restHours === restHours
                if (!shouldCheckRestHours) {
                    formState.restHours = undefined
                    restHoursValidateStatus.value = "warning"
                }
                else {
                    formState.restHours = restHours
                }
            }
        }
        await nextTick()
        isFormStateModified.value = false
        return
    }
    modeStore.initialize()
    if (dateStore.$state.selectedDateList.length > 0) {
        modeStore.currentMode = 'selectDate'
    }
    formState.scheduledWorkHours = undefined
    formState.startTime = undefined
    formState.endTime = undefined
    formState.restHours = undefined
    scheduledWorkHoursValidateStatus.value = startTimeValidateStatus.value = endTimeValidateStatus.value = restHoursValidateStatus.value = ""
})

const formStateObj: TimeModalFormState = {
    startTime: undefined,
    endTime: undefined,
    scheduledWorkHours: undefined,
    restHours: undefined,
}
const { formState, isFormStateModified } = useFormWatcher('editTime', formStateObj)

const { validate, validateInfos } = useForm(formState, timeModalRuleRef)

const cancelHandler = () => {
    changeModalVisible(false)
}

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
                        if (value !== undefined && key in storedDateInfo) {
                            storedDateInfo[key as DateInfoModalFormStateKey] = value as never
                        }
                    })
                    await transaction.objectStore("dates").put(storedDateInfo)
                }
                else {
                    const addDto: DateTable = {
                        date: dateKey,
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
            formRef.value.resetFields()
            emitter.emit("timeModalUpdated")
            isFormStateModified.value = false
            changeModalVisible(false)
        }
        catch (e: any) {
            console.error(e)
            message.error(e.message)
            transaction.abort()
        }
    }
}
</script>

<style >
.ant-picker-time-panel-column {
    overflow-y: auto !important
}
</style>