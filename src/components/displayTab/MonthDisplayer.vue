<template>
    <a-descriptions :labelStyle="descriptionsLabelCommonStyle" :contentStyle="descriptionsContentCommonStyle" size="small"
        title="Scheduled" bordered :column="{ xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 1 }">
        <a-descriptions-item label="work days">{{ scheduledWorkDays }}</a-descriptions-item>
        <a-descriptions-item label="holidays">{{ scheduledHolidays }}</a-descriptions-item>
        <a-descriptions-item label="work hours">
            <span v-if="scheduledWorkHours === 0">{{ scheduledWorkHours }}</span>
            <a-badge v-else :color="overManHourStatusColor(scheduledWorkHours)" :text="scheduledWorkHours" />
        </a-descriptions-item>
        <a-descriptions-item label="estimated hours">
            <span v-if="estimatedWorkHours === 0">{{ displayEstimatedWorkHours }}</span>
            <a-badge v-else :color="overManHourStatusColor(estimatedWorkHours)" :text="displayEstimatedWorkHours" />
        </a-descriptions-item>
    </a-descriptions>
    <br>
    <a-descriptions :labelStyle="descriptionsLabelCommonStyle" :contentStyle="descriptionsContentCommonStyle" size="small"
        title="Actual" bordered :column="{ xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 1 }">
        <a-descriptions-item label="work days">{{ realWorkDays }}</a-descriptions-item>
        <a-descriptions-item label="holidays">{{ realWorkHolidays }}</a-descriptions-item>
        <a-descriptions-item label="work hours">
            <span v-if="realWorkHours === 0">{{ displayRealWorkHours }}</span>
            <a-badge v-else :color="overManHourStatusColor(realWorkHours)" :text="displayRealWorkHours" />
        </a-descriptions-item>
        <a-descriptions-item label="overtime hours">{{ displayOvertimeHours }} </a-descriptions-item>
    </a-descriptions>
    <br>
    <a-descriptions :labelStyle="memoDescriptionStyle" size="small" title="Memo" :bordered="memos.length > 0" :column="1">
        <a-descriptions-item v-for="{ date, memo } in memos" :label="date">{{ memo }}</a-descriptions-item>
    </a-descriptions>
</template>

<script lang="ts" setup>
import { ref, inject, onMounted, watch, computed, onUnmounted } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import emitter from '@/utils/emitter'
import db from '@/utils/datebase'
import { fixNumToStr } from '@/utils/common'
import { gridTypeKey } from '@/types/inject'
import { gridTypeRef } from '@/main'

const props = defineProps<{
    currentDate: Dayjs,
}>()

const gridType = inject(gridTypeKey, gridTypeRef)
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

const scheduledWorkDays = ref<number>(0)
const scheduledHolidays = ref<number>(0)
const scheduledWorkHours = ref<number>(0)
const estimatedWorkHours = ref<number>(0)
const realWorkDays = ref<number>(0)
const realWorkHolidays = ref<number>(0)
const realWorkHours = ref<number>(0)
const overtimeHours = ref<number>(0)
const memos = ref<({ date: string, memo: string })[]>([])

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
    realWorkHours.value = storedCurrentMonthDates.reduce((acuumulator, date) => {
        const startDate = dayjs(date.startTime, 'HHmm')
        const endDate = dayjs(date.endTime, 'HHmm')
        const workTime = endDate.diff(startDate, "hour", true)
        const scheduledWorkHours = (date.scheduledWorkHours || 0)
        const realWorkTime = (workTime || 0) - (date.restHours || 0)
        if ((realWorkTime > 0 && scheduledWorkHours > 0)) overtimeHours.value += realWorkTime - scheduledWorkHours
        return acuumulator + realWorkTime
    }, 0)
    storedCurrentMonthDates.forEach(({ date, memo }) => {
        if (memo) {
            memos.value.push({ date: date, memo: memo })
        }
    })
}

onMounted(async () => {
    emitter.on("timeModalUpdated", fetchData)
    fetchData()
})
onUnmounted(() => emitter.off("timeModalUpdated", fetchData))

</script>