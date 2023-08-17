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
                    <span v-if="isCurrentMonth && workTime > 0" :style="{ color: isReal ? '#1677FF' : '#000000' }">
                        {{ displayWorkTime + 'h' }}
                    </span>
                    <span v-if="memoExist">
                        <ScheduleTwoTone />
                    </span>
                </a-space>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, computed, watch, ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { windowWidthRef } from '@/main'
import { ScheduleTwoTone } from '@ant-design/icons-vue'
import { getJapenseHoliday } from '@/utils/holidays'
import { windowWidthConstant } from '@/config/constants'
import { windowWidthKey } from '@/types/inject'
import emitter from '@/utils/emitter'
import { fixNumToStr } from '@/utils/common'
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

const asyncFechDateData = async () => fetchDateData()

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
const displayWorkTime = computed(() => fixNumToStr(workTime.value))

const memoExist = ref<boolean>(false)

watch(() => props.currentDate, async (newDate, oldDate) => {
    if (!newDate.isSame(oldDate)) {
        fetchDateData()
        emitter.on(newDate.format("YYYYMMDD"), asyncFechDateData)
        emitter.off(oldDate.format("YYYYMMDD"), asyncFechDateData)
    }
})
onMounted(asyncFechDateData)

const fetchDateData = async () => {
    const dbHandler = await db
    const res = await dbHandler.get("dates", props.currentDate.format("YYYYMMDD"))
    workTime.value = 0
    if (res) {
        const { startTime, endTime, restHours, scheduledWorkHours, memo } = res
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