<template>
    <div class="ant-picker-cell-inner ant-picker-calendar-date" @click="changeDate(props.date)">
        <div class="ant-picker-calendar-date-value date-text"
            :style="{ 'color': dateColor, 'width': responsiveDateButtonWidth }">
            <span style=" border-radius: 15px;"
                :style="{ backgroundColor: props.isSelected ? dateColor : '', color: props.isSelected ? '#FFFFFF' : '' }">
                {{ props.date.date() }}
            </span>
            <template v-if="isJapaneseHolidayGot">
                <span v-if="windowWidth >= smWidth">{{ japaneseHolidayName }}</span>
                <span v-else>●</span><!-- to show a dot when at a short width device -->
            </template>
        </div>
        <div class="ant-picker-calendar-date-content"></div>
    </div>
</template>

<script lang="ts" setup>
import { Dayjs } from 'dayjs'
import { computed } from 'vue'
import { getJapenseHoliday } from '@/utils/holidays'
import { useWindowWidthStore } from '@/stores/windowWidth'
import { storeToRefs } from 'pinia'
import constant from '@/config/constants'

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

const responsiveDateButtonWidth = computed(() => (windowWidth.value / 7) + 'px') // 7 is for 7 days in one line.

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

</script>

<style scoped>
.date-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: large;
    font-weight: bold;
}

@media(max-width: 767px) {
    :where(.css-dev-only-do-not-override-eq3tly).ant-picker-calendar .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
        position: absolute;
        top: 0;
        inset-inline-end: 0;
        bottom: 0;
        left: -6px;
        z-index: 1;
        border: 1px solid #1677ff;
        border-radius: 4px;
        content: "";
    }
}


.ant-picker-cell-selected .ant-picker-cell-inner {
    background: #FFFFFF !important;
}
</style>