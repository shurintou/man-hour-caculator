<template>
    <a-descriptions :labelStyle="descriptionsLabelCommonStyle" :contentStyle="descriptionsContentCommonStyle" size="small"
        title="Scheduled" bordered :column="{ xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 1 }">
        <a-descriptions-item label="Work days">{{ scheduledWorkDays }}</a-descriptions-item>
        <a-descriptions-item label="Holidays">{{ scheduledHolidays }}</a-descriptions-item>
        <a-descriptions-item label="Work hours">
            <span v-if="scheduledWorkHours === 0">{{ scheduledWorkHours }}</span>
            <a-badge v-else :color="overManHourStatusColor(scheduledWorkHours)" :text="scheduledWorkHours" />
        </a-descriptions-item>
        <a-descriptions-item label="Estimated hours">
            <span v-if="estimatedWorkHours === 0">{{ displayEstimatedWorkHours }}</span>
            <a-badge v-else :color="overManHourStatusColor(estimatedWorkHours)" :text="displayEstimatedWorkHours" />
        </a-descriptions-item>
    </a-descriptions>
    <br>
    <a-descriptions :labelStyle="descriptionsLabelCommonStyle" :contentStyle="descriptionsContentCommonStyle" size="small"
        title="Actual" bordered :column="{ xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 1 }">
        <a-descriptions-item label="Work days">{{ realWorkDays }}</a-descriptions-item>
        <a-descriptions-item label="Holidays">{{ realWorkHolidays }}</a-descriptions-item>
        <a-descriptions-item label="Work hours">
            <span v-if="realWorkHours === 0">{{ displayRealWorkHours }}</span>
            <a-badge v-else :color="overManHourStatusColor(realWorkHours)" :text="displayRealWorkHours" />
        </a-descriptions-item>
        <a-descriptions-item label="Overtime hours">{{ displayOvertimeHours }} </a-descriptions-item>
    </a-descriptions>
    <br>
    <a-descriptions :labelStyle="memoDescriptionStyle" size="small" title="Memo" :bordered="memos.length > 0" :column="1">
        <a-descriptions-item v-for="{ id, date, memo, isBefore, isToday } in memos" :key="id" :label="date"
        :contentStyle="{backgroundColor: getMemoDescriptionItemBackgroundColor(isBefore, isToday) }">
            <a-textarea :style="{ color: !isToday && isBefore ? 'gray' : 'black', padding: '0px' }" disabled
                :bordered="false" :auto-size="{ minRows: 1, maxRows: 5 }" :value="memo" placeholder="" />
        </a-descriptions-item>
    </a-descriptions>
    <br v-if="!isPcMode" />
</template>

<script lang="ts" setup>
import { ref, inject, onMounted, watch, computed, onUnmounted } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import emitter from '@/utils/emitter'
import db from '@/utils/datebase'
import { fixNumToStr } from '@/utils/common'
import { gridTypeKey, isPcModeKey } from '@/types/inject'
import { gridTypeRef, isPcModeRef } from '@/main'

const props = defineProps<{
    currentDate: Dayjs,
}>()

const gridType = inject(gridTypeKey, gridTypeRef)
const isPcMode = inject(isPcModeKey, isPcModeRef)
const memoDescriptionStyle = computed(() => {
    if (['xxl', 'xl', 'lg'].includes(gridType.value)) {
        return { width: '12.5%' }
    }
    if (['md', 'sm'].includes(gridType.value)) {
        return { width: '25%' }
    }
    return { width: '150px' }
})

const descriptionsLabelCommonStyle = { width: '150px' }
const descriptionsContentCommonStyle = computed(() => {
    if (['xxl', 'xl', 'lg', 'md', 'sm'].includes(gridType.value)) {
        return { width: '150px' }
    }
    return {}
})

const overManHourStatusColor = (workHours: number) => {
    if (workHours > 180) {
        return 'red'
    }
    else if (workHours < 140 && workHours > 0) {
        return 'red'
    }
    return 'green'
}

const getMemoDescriptionItemBackgroundColor = (isBefore: boolean, isToday: boolean) : string => {
    if (isToday) {
        return '#e6f4ff'
    }
    else if (isBefore) {
        return '#f2f4f7'
    }
    return ''
}

const scheduledWorkDays = ref<number>(0)
const scheduledHolidays = ref<number>(0)
const scheduledWorkHours = ref<number>(0)
const estimatedWorkHours = ref<number>(0)
const realWorkDays = ref<number>(0)
const realWorkHolidays = ref<number>(0)
const realWorkHours = ref<number>(0)
const overtimeHours = ref<number>(0)
const memos = ref<({ id: string, date: string, memo: string, isBefore: boolean, isToday: boolean })[]>([])

const displayEstimatedWorkHours = computed(() => fixNumToStr(estimatedWorkHours.value))
const displayRealWorkHours = computed(() => fixNumToStr(realWorkHours.value))
const displayOvertimeHours = computed(() => fixNumToStr(overtimeHours.value))

watch(() => props.currentDate, async (newDate, oldDate) => {
    if (newDate.year() !== oldDate.year() || newDate.month() !== oldDate.month()) {
        fetchData()
    }
})

const fetchData = async () => {
    scheduledWorkDays.value = scheduledHolidays.value = scheduledWorkHours.value = estimatedWorkHours.value = realWorkDays.value = realWorkHolidays.value = realWorkHours.value = overtimeHours.value = 0
    memos.value = []
    const dbHandler = await db
    const rangeStart = props.currentDate.startOf('M').format("YYYYMMDD")
    const rangeEnd = props.currentDate.endOf('M').format("YYYYMMDD")
    const storedCurrentMonthDates = await dbHandler.getAll("dates", IDBKeyRange.bound(rangeStart, rangeEnd))
    scheduledWorkDays.value = storedCurrentMonthDates.filter(date => date.scheduledWorkHours && date.scheduledWorkHours > 0).length
    scheduledHolidays.value = props.currentDate.daysInMonth() - scheduledWorkDays.value
    scheduledWorkHours.value = storedCurrentMonthDates.reduce((accumulator, date) => accumulator + (date.scheduledWorkHours || 0), 0)
    realWorkDays.value = storedCurrentMonthDates.filter(date => date.startTime && date.endTime).length
    realWorkHolidays.value = props.currentDate.daysInMonth() - realWorkDays.value
    estimatedWorkHours.value = storedCurrentMonthDates.reduce((acuumulator, date) => {
        const startDate = dayjs(date.startTime, 'HHmm')
        const endDate = dayjs(date.endTime, 'HHmm')
        const realWorkTime = endDate.diff(startDate, "hour", true)
        return acuumulator + ((realWorkTime - (date.restHours || 0)) || date.scheduledWorkHours || 0)
    }, 0)
    realWorkHours.value = storedCurrentMonthDates.reduce((acuumulator, { scheduledWorkHours, startTime, endTime, restHours }) => {
        let workTime: number | undefined = undefined
        if (startTime && endTime) {
            const startDate = dayjs(startTime, 'HHmm')
            const endDate = dayjs(endTime, 'HHmm')
            workTime = endDate.diff(startDate, "hour", true)
        }
        let realWorkTime = 0
        if (workTime) {
            realWorkTime = (workTime) - (restHours || 0)
        }
        const correctScheduledWorkHours = (scheduledWorkHours || 0)
        if ((realWorkTime > 0 && correctScheduledWorkHours > 0)) {
            const overtimeHour = realWorkTime - correctScheduledWorkHours
            overtimeHours.value += overtimeHour > 0 ? overtimeHour : 0
        }
        return acuumulator + realWorkTime
    }, 0)
    storedCurrentMonthDates.forEach(({ date, memo }) => {
        if (memo){
            const dateObj = dayjs(date)
            const todayObj = dayjs(new Date())
            const isToday = dateObj.isSame(todayObj,'date')
            const isBefore = dateObj.isBefore(todayObj)
            memos.value.push({ id: dateObj.format('YYYY-MM-DD'), date: dateObj.format('MM-DD'), memo: memo, isBefore: isBefore, isToday: isToday })
        }
    })
}

onMounted(async () => {
    emitter.on("timeModalUpdated", fetchData)
    fetchData()
})
onUnmounted(() => emitter.off("timeModalUpdated", fetchData))

</script>