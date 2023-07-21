<template>
    <div class="ant-picker-cell-inner ant-picker-calendar-date" @click="changeDate(props.date)">
        <div class="ant-picker-calendar-date-value" style="font-size: large; font-weight: bold;"
            :style="{ 'color': dateColor }">
            {{ props.date.date() }}
        </div>
        <div class="ant-picker-calendar-date-content"></div>
    </div>
</template>

<script lang="ts" setup>
import { Dayjs } from 'dayjs'
import { computed } from 'vue'
const emit = defineEmits<{
    (e: 'changeDate', newDate: Dayjs): void
}>()

const props = defineProps<{
    date: Dayjs,
    isCurrentMonth: boolean,
}>()

const dateColor = computed(() => {
    const day = props.date.day()
    if (!props.isCurrentMonth) return ''
    if (day === 0) return '#ff4d4f'
    if (day === 6) return '#1677ff'
    return ''
})

const changeDate = (newDate: Dayjs) => {
    emit("changeDate", newDate)
}

</script>