<template>
    <a-form ref="formRef" :model="formState">
        <a-descriptions :labelStyle="{ width: '180px' }" size="small" bordered
            :column="{ xxl: 3, xl: 3, lg: 3, md: 1, sm: 1, xs: 1 }">
            <template #title>
                <div class="date-displayer-holiday">{{ displayJapaneseHoliday }}</div>
            </template>
            <template #extra>
                <a-space v-if="isEditing" :size="isPcMode ? 'large' : 'middle'">
                    <a-button type="primary" :icon="h(CheckOutlined)" @click="submitEditForm"
                        :disabled="!isFormStateModified">
                        <span v-if="isPcMode">Submit</span>
                    </a-button>
                    <a-popconfirm title="Are you sure cancel this edit?" ok-text="Yes" cancel-text="No"
                        @confirm="cancelEdit" placement="left" :open="popconfirmVisible"
                        @openChange="handlePopconfirmVisibleChange">
                        <a-button type="primary" :icon="h(CloseCircleOutlined)" danger>
                            <span v-if="isPcMode">Cancel</span>
                        </a-button>
                    </a-popconfirm>
                </a-space>
                <a-button v-else :icon="h(EditOutlined)" @click="editDate" :disabled="modeStore.currentMode !== 'normal'">
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
            <a-descriptions-item label="Memo" :span="isPcMode ? 3 : 1">
                <a-textarea :style="textAreaStyle" :disabled="!isEditing" :bordered="isEditing"
                    :auto-size="{ minRows: 2, maxRows: 10 }" v-model:value="formState.memo"
                    :placeholder="isEditing ? 'take down some memos' : ''" />
            </a-descriptions-item>
        </a-descriptions>
        <br v-if="!isPcMode" />
    </a-form>
</template>

<script lang="ts" setup>
import { h, ref, reactive, computed, watch, onMounted, inject, onUnmounted, type UnwrapRef } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { getJapenseHoliday } from '@/utils/holidays'
import { timeInputAddonAfter, timeInputStep, timeMinuteStep, timeDisplayFormat, timeValueFormat, timeModalRuleRef } from '@/utils/rules'
import { EditOutlined, CloseCircleOutlined, CheckOutlined } from '@ant-design/icons-vue'
import db from '@/utils/datebase'
import type { EditFormState, DateTable } from '@/types/index'
import { fixNumToStr } from '@/utils/common'
import { useModeStore } from '@/stores/mode'
import { Form, message } from 'ant-design-vue'
import { isPcModeRef } from '@/main'
import { isPcModeKey } from '@/types/inject'
import emitter from '@/utils/emitter'
import { useDateStore } from '@/stores/date'
const isPcMode = inject(isPcModeKey, isPcModeRef)

const useForm = Form.useForm
const formRef = ref()

const props = defineProps<{
    currentDate: Dayjs,
}>()
const modeStore = useModeStore()
const popconfirmVisible = ref<boolean>(false)
const handlePopconfirmVisibleChange = (open: boolean) => {
    if (!open) {
        popconfirmVisible.value = false
        return
    }
    if (isFormStateModified.value) {
        popconfirmVisible.value = true
    }
    else {
        cancelEdit()
    }
}
const dateStore = useDateStore()
const editDate = () => {
    dateStore.$reset()
    modeStore.toggltEditDate()
    if (modeStore.currentMode === 'editDate') isFormStateModified.value = false
}
const cancelEdit = async () => {
    fetchDateData()
    editDate()
    isFormStateModified.value = popconfirmVisible.value = false
}
const isEditing = computed(() => modeStore.currentMode === 'editDate')
const inputStyle = { width: '120px', height: '30px', lineHeight: '30px' }
const textAreaStyle = computed(() => {
    if (isPcMode.value === true) {
        if (isEditing.value === true) {
            return { color: 'rgba(0, 0, 0, 0.88)' }
        }
        return { color: 'rgba(0, 0, 0, 0.88)', padding: '0px' }
    }
    if (isEditing.value === true) {
        return { color: 'black' }
    }
    return { color: 'black', padding: '0px' }
})

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
    memo: undefined,
})
const isFormStateModified = ref<boolean>(false)
watch(formState, () => { if (isEditing.value === true) isFormStateModified.value = true })
const { validate, validateInfos } = useForm(formState, timeModalRuleRef)


onMounted(async () => {
    emitter.on(props.currentDate.format("YYYYMMDD"), fetchDateData)
    fetchDateData()
})
onUnmounted(() => emitter.off(props.currentDate.format("YYYYMMDD"), fetchDateData))
watch(() => props.currentDate, async (newDate, oldDate) => {
    if (!newDate.isSame(oldDate)) {
        emitter.on(newDate.format("YYYYMMDD"), fetchDateData)
        emitter.off(oldDate.format("YYYYMMDD"), fetchDateData)
        if (modeStore.currentMode !== 'selectDate') modeStore.initialize()
    }
    fetchDateData()
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
    if (storedDateInfo) {
        const { startTime, endTime, restHours, scheduledWorkHours, memo } = storedDateInfo
        formState.startTime = startTime
        formState.endTime = endTime
        formState.scheduledWorkHours = scheduledWorkHours
        formState.restHours = restHours
        formState.memo = memo
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

const submitEditForm = async () => {
    await validate()
    const dbHandler = await db
    const transaction = dbHandler.transaction(['dates'], 'readwrite')
    try {
        const dateKey = props.currentDate.format("YYYYMMDD")
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
                startTime: formState.startTime,
                endTime: formState.endTime,
                restHours: formState.restHours,
                scheduledWorkHours: formState.scheduledWorkHours,
                memo: formState.memo,
            }
            await transaction.objectStore("dates").add(addDto)
        }
        emitter.emit(dateKey)
        await transaction.done
        await fetchDateData()
        message.success('update succeeded!')
        modeStore.initialize()
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