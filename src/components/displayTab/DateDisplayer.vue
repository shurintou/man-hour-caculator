<template>
    <a-form ref="formRef" :model="formState">
        <a-descriptions size="small" bordered :column="{ xxl: 3, xl: 3, lg: 3, md: 1, sm: 1, xs: 1 }">
            <template #title>
                <div class="date-displayer-holiday">{{ displayJapaneseHoliday }}</div>
            </template>
            <template #extra>
                <a-space v-if="isEditing">
                    <a-button type="primary" :icon="h(CheckOutlined)">
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
    </a-form>
</template>

<script lang="ts" setup>
import { h, ref, reactive, computed, watch, onMounted, inject, type UnwrapRef } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { getJapenseHoliday } from '@/utils/holidays'
import { timeInputAddonAfter, timeInputStep, timeMinuteStep, timeDisplayFormat, timeValueFormat, timeModalRuleRef } from '@/utils/rules'
import { EditOutlined, CloseCircleOutlined, CheckOutlined } from '@ant-design/icons-vue'
import db from '@/utils/datebase'
import type { EditFormState, TaskForm } from '@/types/index'
import { fixNumToStr } from '@/utils/common'
import { useModeStore } from '@/stores/mode'
import { Form, message } from 'ant-design-vue'
import { isPcModeRef } from '@/main'
import { isPcModeKey } from '@/types/inject'
const isPcMode = inject(isPcModeKey, isPcModeRef)

const useForm = Form.useForm

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
const overtimeHours = ref<string>("")

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
    displayStartTime.value = displayEndTime.value = displayMemo.value = displayRestHours.value = displayScheduledWorkHours.value = overtimeHours.value = ""
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
            displayOvertimeHours.value = fixNumToStr(realWorkTime - (restHours || 0) - (scheduledWorkHours || 0))
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
</script>

<style scoped>
.date-displayer-holiday {
    margin-left: 18px;
    color: #ff4d4f;
    font-weight: bold;
}
</style>