<template>
    <div class="ant-picker-cell-inner ant-picker-calendar-date" @click="changeDate(props.date)">
        <div class="ant-picker-calendar-date-value" style="font-size: large; font-weight: bold;"
            :style="{ 'color': dateColor }">
            <a-row>
                <a-col :xs="{ span: 14 }" :sm="{ span: 8 }" :md="{ span: 4 }">
                    <a-badge v-if="props.isSelected" :number-style="{ backgroundColor: dateColor }"
                        :count="props.date.date()" />
                    <span v-else> {{ props.date.date() }}</span>
                </a-col>
                <a-col :xs="{ span: 0 }" :md="{ span: 20 }" v-if="isJapaneseHolidayGot" class="japanese-holiday-name-text">
                    <span>{{ japaneseHolidayName }}</span>
                </a-col>
                <a-col :xs="{ span: 10 }" :sm="{ span: 16 }" :md="{ span: 0 }" v-if="isJapaneseHolidayGot">
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
import { getJapenseHoliday } from '@/utils/holidays'
const emit = defineEmits<{
    (e: 'changeDate', newDate: Dayjs): void
}>()

const props = defineProps<{
    date: Dayjs,
    isCurrentMonth: boolean,
    isSelected: boolean,
}>()

const japaneseHolidayName = computed(() => {
    let holidayName = isJapaneseHolidayGot.value?.name
    if (holidayName) {
        if (holidayName.indexOf("振替") !== -1) return "振替休日"
        return holidayName
    }
    return ''
})

const isJapaneseHolidayGot = computed(() => getJapenseHoliday(props.date.toDate()))

const dateColor = computed(() => {
    const day = props.date.day()
    if (!props.isCurrentMonth) return ''
    if (day === 0 || isJapaneseHolidayGot.value) return '#ff4d4f !important'
    if (day === 6) return '#1677ff !important'
    return '#000000'
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