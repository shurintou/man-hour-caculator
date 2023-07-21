<template>
    <div class="ant-picker-cell-inner ant-picker-calendar-date" @click="changeDate(props.date)">
        <div class="ant-picker-calendar-date-value" style="font-size: large; font-weight: bold;"
            :style="{ 'color': dateColor }">
            <a-row>
                <a-col :xs="{ span: 14 }" :sm="{ span: 8 }" :md="{ span: 4 }">
                    {{ props.date.date() }}
                </a-col>
                <a-col :xs="{ span: 0 }" :md="{ span: 20 }" v-if="isJapaneseHoliday" class="japanese-holiday-name-text">
                    <span>{{ japaneseHolidayName }}</span>
                </a-col>
                <a-col :xs="{ span: 10 }" :sm="{ span: 16 }" :md="{ span: 0 }" v-if="isJapaneseHoliday">
                    <span>●</span><!-- to show a dot when at a short width device -->
                </a-col>
            </a-row>
        </div>
        <div class="ant-picker-calendar-date-content"></div>
    </div>
</template>

<script lang="ts" setup>
import { Dayjs } from 'dayjs'
import { computed } from 'vue'
import { isHoliday, getHoliday } from '@/utils/holidays'
const emit = defineEmits<{
    (e: 'changeDate', newDate: Dayjs): void
}>()

const props = defineProps<{
    date: Dayjs,
    isCurrentMonth: boolean,
}>()

const japaneseHolidayName = computed(() => getHoliday(props.date.toDate())[0].name)

const isJapaneseHoliday = computed(() => isHoliday(props.date.toDate()))

const dateColor = computed(() => {
    const day = props.date.day()
    if (!props.isCurrentMonth) return ''
    if (day === 0 || isJapaneseHoliday.value) return '#ff4d4f !important'
    if (day === 6) return '#1677ff !important'
    return ''
})

const changeDate = (newDate: Dayjs) => {
    emit("changeDate", newDate)
}

</script>

<style scoped>
/* to override the style of the date button being selected. */
.ant-picker-cell-selected .ant-picker-calendar-date {
    background-color: #f6ffed !important;
}

.ant-picker-cell-selected .ant-picker-calendar-date .ant-picker-calendar-date-value {
    color: #52c41a !important;
}

.japanese-holiday-name-text {
    text-align: left;
}
</style>