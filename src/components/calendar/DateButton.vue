<template>
    <div class="calendar-date-box" :style="{ 'width': responsiveDateButtonWidth }" @click="changeDate(props.currentDate)">
        <div class="calendar-date-text" :style="{ 'color': dateColor }">
            <span style=" border-radius: 15px;"
                :style="{ backgroundColor: props.isSelected ? dateColor : '', color: props.isSelected ? '#FFFFFF' : '' }">
                {{ props.currentDate.date() }}
            </span>
            <template v-if="isJapaneseHolidayGot">
                <span v-if="windowWidth >= smWidth">{{ japaneseHolidayName }}</span>
                <span v-else>●</span><!-- to show a dot when at a short width device -->
            </template>
        </div>
        <div class="calendar-date-content">
            <div style="height: 100%;">
                <a-space :size="4">
                    <span v-if="isCurrentMonth && workTime > 0">
                        {{ displayWorkTime }}
                        <ClockCircleTwoTone v-if="isReal" />
                        <ClockCircleOutlined v-else />
                    </span>
                    <span v-if="taskExist || memoExist">
                        <a-badge :dot="taskExist && !taskDone">
                            <ScheduleOutlined v-if="!taskExist" />
                            <ScheduleTwoTone v-else />
                        </a-badge>
                    </span>
                </a-space>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, computed, onUpdated, ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { windowWidthRef } from '@/main'
import { ClockCircleTwoTone, ClockCircleOutlined, ScheduleTwoTone, ScheduleOutlined } from '@ant-design/icons-vue'
import { getJapenseHoliday } from '@/utils/holidays'
import { windowWidthConstant } from '@/config/constants'
import { windowWidthKey } from '@/types/inject'
import emitter from '@/utils/emitter'
import db from '@/utils/datebase'

const windowWidth = inject(windowWidthKey, windowWidthRef)
const { smWidth } = windowWidthConstant

const emit = defineEmits<{
    (e: 'changeDate', newDate: Dayjs): void
}>()

const props = defineProps<{
    currentDate: Dayjs,
    isCurrentMonth: boolean,
    isSelected: boolean,
}>()

emitter.on(props.currentDate.format("YYYYMMDD"), () => fetchDateData())

const japaneseHolidayName = computed(() => {
    let holidayName = isJapaneseHolidayGot.value?.name_en
    if (holidayName) {
        if (holidayName.indexOf("振替") !== -1) return "振替休日"
        return holidayName
    }
    return ''
})

const responsiveDateButtonWidth = computed(() => (windowWidth.value / 7) - 4 + 'px') // 7 is for 7 days in one line, and 4 is for 2*2 of two borders.

const isJapaneseHolidayGot = computed(() => getJapenseHoliday(props.currentDate.toDate()))

const dateColor = computed(() => {
    const day = props.currentDate.day()
    if (!props.isCurrentMonth) return ''
    if (day === 0 || isJapaneseHolidayGot.value) return '#ff4d4f'
    if (day === 6) return '#1677ff'
    return '#000000'
})

const changeDate = (newDate: Dayjs) => {
    emit("changeDate", newDate)
}

const workTime = ref<number>(0)
const isReal = ref<boolean>(false)
const displayWorkTime = computed(() => {
    if (countDecimalPlaces(workTime.value) > 2) {
        return workTime.value.toFixed(2)
    } return workTime.value
})

const countDecimalPlaces = (number: number) => {
    const decimalPart = (number.toString().split('.')[1] || '').length
    return decimalPart
}

const taskExist = ref<boolean>(false)
const taskDone = ref<boolean>(false)
const memoExist = ref<boolean>(false)

onUpdated(async () => fetchDateData())
onMounted(async () => fetchDateData())

const fetchDateData = async () => {
    const dbHandler = await db
    const res = await dbHandler.get("dates", props.currentDate.format("YYYYMMDD"))
    taskExist.value = taskDone.value = memoExist.value = isReal.value = false
    workTime.value = 0
    if (res) {
        const { startTime, endTime, restHours, scheduledWorkHours, taskIndexes, memo } = res
        if (startTime && endTime) {
            const startDate = dayjs(startTime, 'HHmm')
            const endDate = dayjs(endTime, 'HHmm')
            const realWorkTime = endDate.diff(startDate, "hour", true)
            workTime.value = realWorkTime - (restHours || 0)
            isReal.value = true
        }
        else if (scheduledWorkHours) {
            workTime.value = scheduledWorkHours
        }
        if (taskIndexes && taskIndexes.length > 0) {
            const taskList = await dbHandler.getAll("tasks", ...taskIndexes)
            taskExist.value = true
            taskDone.value = taskList.every(task => task.isDone === true)
        }
        memoExist.value = memo !== undefined && memo.length > 0
    }
    else {
        workTime.value = 0
    }
}

</script>

<style scoped>
.calendar-date-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: large;
    font-weight: bold;
}

.calendar-date-content {
    height: 25px !important;
}
</style>