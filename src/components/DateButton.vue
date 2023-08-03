<template>
    <div class="calendar-date-box" :style="{ 'width': responsiveDateButtonWidth }" @click="changeDate(props.date)">
        <div class="calendar-date-text" :style="{ 'color': dateColor }">
            <span style=" border-radius: 15px;"
                :style="{ backgroundColor: props.isSelected ? dateColor : '', color: props.isSelected ? '#FFFFFF' : '' }">
                {{ props.date.date() }}
            </span>
            <template v-if="isJapaneseHolidayGot">
                <span v-if="windowWidth >= smWidth">{{ japaneseHolidayName }}</span>
                <span v-else>●</span><!-- to show a dot when at a short width device -->
            </template>
        </div>
        <div class="calendar-date-content">
            <div style="height: 100%;">
                <span v-if="isCurrentMonth && workTime > 0">
                    {{ displayWorkTime }}
                    <ClockCircleTwoTone v-if="isReal" />
                    <ClockCircleOutlined v-else />
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import dayjs, { Dayjs } from 'dayjs'
import { ClockCircleTwoTone, ClockCircleOutlined } from '@ant-design/icons-vue'
import { computed, onUpdated, ref } from 'vue'
import { getJapenseHoliday } from '@/utils/holidays'
import { useWindowWidthStore } from '@/stores/windowWidth'
import { storeToRefs } from 'pinia'
import constant from '@/config/constants'
import db from '@/utils/datebase'


const windowWidthStore = useWindowWidthStore()
const { windowWidth } = storeToRefs(windowWidthStore)
const { smWidth } = constant

const emit = defineEmits<{
    (e: 'changeDate', newDate: Dayjs): void
}>()

const props = defineProps<{
    date: Dayjs,
    isCurrentMonth: boolean,
    isSelected: boolean,
}>()

const japaneseHolidayName = computed(() => {
    let holidayName = isJapaneseHolidayGot.value?.name_en
    if (holidayName) {
        if (holidayName.indexOf("振替") !== -1) return "振替休日"
        return holidayName
    }
    return ''
})

const responsiveDateButtonWidth = computed(() => (windowWidth.value / 7) - 4 + 'px') // 7 is for 7 days in one line, and 4 is for 2*2 of two borders.

const isJapaneseHolidayGot = computed(() => getJapenseHoliday(props.date.toDate()))

const dateColor = computed(() => {
    const day = props.date.day()
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

onUpdated(async () => {
    const dbHandler = await db
    const res = await dbHandler.get("dates", props.date.format("YYYYMMDD"))
    if (res) {
        const { startTime, endTime, restHours, scheduledWorkHours } = res
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
    }
    else {
        workTime.value = 0
    }
})

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