<template>
    <a-descriptions size="small" title="Scheduled" bordered :column="{ xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 1 }">
        <a-descriptions-item label="work days">{{ scheduledWorkDays }}</a-descriptions-item>
        <a-descriptions-item label="holidays">{{ scheduledHolidays }}</a-descriptions-item>
        <a-descriptions-item label="work hours">
            <a-badge :color="overManHourStatusColor(scheduledWorkHours)" :text="scheduledWorkHours" />
        </a-descriptions-item>
        <a-descriptions-item label="estimated hours">
            <a-badge :color="overManHourStatusColor(estimatedWorkHours)" :text="estimatedWorkHours" />
        </a-descriptions-item>
    </a-descriptions>
    <br>
    <a-descriptions size="small" title="Real" bordered :column="{ xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 1 }">
        <a-descriptions-item label="work days">{{ realWorkDays }}</a-descriptions-item>
        <a-descriptions-item label="holidays">{{ realWorkHolidays }}</a-descriptions-item>
        <a-descriptions-item label="work hours">
            <a-badge :color="overManHourStatusColor(realWorkHours)" :text="realWorkHours" />
        </a-descriptions-item>
        <a-descriptions-item label="overtime hours">
            <a-badge :color="overtimeStatusColor" :text="overtimeHours" />
        </a-descriptions-item>
    </a-descriptions>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import emitter from '@/utils/emitter'
import db from '@/utils/datebase'

const props = defineProps<{
    currentDate: Dayjs,
}>()

const overtimeStatusColor = computed(() => {
    if (realWorkDays.value > 0) {
        if (overtimeHours.value >= realWorkDays.value * 3) {
            return 'red'
        }
        else if (overtimeHours.value >= realWorkDays.value * 2) {
            return 'pink'
        }
        else if (overtimeHours.value >= realWorkDays.value * 1) {
            return 'orange'
        }
        else if (overtimeHours.value > 0) {
            return 'yellow'
        }
    }
    return 'green'
})

const overManHourStatusColor = (workHours: number) => {
    if (workHours > 210) {
        return 'red'
    }
    else if (workHours > 200) {
        return 'pink'
    }
    else if (workHours > 190) {
        return 'orange'
    }
    else if (workHours > 180) {
        return 'yellow'
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

watch(() => props.currentDate, async () => fetchData())

emitter.on("timeModalUpdated", async () => fetchData())

const fetchData = async () => {
    scheduledWorkDays.value = scheduledHolidays.value = scheduledWorkHours.value = estimatedWorkHours.value = realWorkDays.value = realWorkHolidays.value = realWorkHours.value = overtimeHours.value = 0
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
        const realWorkTime = (workTime || 0) - (date.restHours || 0)
        const overtime = realWorkTime - (date.scheduledWorkHours || 0)
        overtimeHours.value += overtime > 0 ? overtime : 0
        return acuumulator + realWorkTime
    }, 0)

}

onMounted(async () => fetchData())

</script>