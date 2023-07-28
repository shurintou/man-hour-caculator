<template>
    <div class="ant-picker-cell-inner ant-picker-calendar-date" @click="changeDate(props.date)">
        <div class="ant-picker-calendar-date-value" style="font-size: large; font-weight: bold;"
            :style="{ 'color': dateColor }">
            <a-row>
                <a-col v-if="windowWidth >= mdWidth" :lg="{ span: 6 }">
                    <a-badge v-if="props.isSelected" :number-style="{ backgroundColor: dateColor, fontWeight: 'bold' }"
                        :count="props.date.date()" />
                    <span v-else> {{ props.date.date() }}</span>
                </a-col>
                <a-col v-if="windowWidth < mdWidth" :xs="{ span: 14 }" :sm="{ span: 8 }" :md="{ span: 4 }">
                    <span
                        :style="{ backgroundColor: props.isSelected ? dateColor : '', borderRadius: '15px', color: props.isSelected ? '#FFFFFF' : '' }">
                        {{ props.date.date() }}
                    </span>
                </a-col>
                <a-col v-if="isJapaneseHolidayGot && windowWidth >= smWidth" :md="{ span: 20 }" :lg="{ span: 18 }"
                    class="japanese-holiday-name-text">
                    <span>{{ japaneseHolidayName }}</span>
                </a-col>
                <a-col v-if="isJapaneseHolidayGot && windowWidth < smWidth" :xs="{ span: 10 }" :sm="{ span: 16 }">
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
import { useWindowWidthStore } from '@/stores/windowWidth'
import { storeToRefs } from 'pinia'
import constant from '@/config/constants'

const windowWidthStore = useWindowWidthStore()
const { windowWidth } = storeToRefs(windowWidthStore)
const { smWidth, mdWidth } = constant

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
    if (day === 0 || isJapaneseHolidayGot.value) return '#ff4d4f'
    if (day === 6) return '#1677ff'
    return '#000000'
})

const changeDate = (newDate: Dayjs) => {
    emit("changeDate", newDate)
}

</script>

<style scoped>
.japanese-holiday-name-text {
    text-align: left;
}
</style>