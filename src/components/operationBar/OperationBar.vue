<template>
    <a-space wrap :size="isPcMode ? 'large' : 'middle'">
        <a-dropdown>
            <a-button :type="modeStore.currentMode === 'selectDate' ? 'primary' : ''" :icon="h(PlusOutlined)">
                <span v-if="isPcMode">Select</span>
            </a-button>
            <template #overlay>
                <a-menu>
                    <a-menu-item key="1"><a-button type="link" @click="selectDates('work')">All
                            weekdays</a-button></a-menu-item>
                    <a-menu-item key="2"><a-button type="link" @click="selectDates('all')">All days</a-button></a-menu-item>
                    <a-menu-item key="3"><a-button type="link" @click="selectDates('holiday')">All
                            holidays</a-button></a-menu-item>
                    <a-menu-item key="4"><a-button type="link" v-show="modeStore.currentMode === 'normal'"
                            @click="customSelect">Custom</a-button></a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>
        <a-button type="primary" danger :icon="h(CloseCircleOutlined)" :disabled="!isCancelable" @click="cancelSelect">
            <span v-if="isPcMode">Cancel</span>
        </a-button>
        <a-button type="default" :icon="h(ClockCircleOutlined)" :disabled="!isCancelable"
            @click="changeTimeModalVisible(true)">
            <span v-if="isPcMode">Time</span>
        </a-button>
    </a-space>
    <TimeModal :isModalVisible="isTimeModalVisible" @changeTimeModalVisible="(flg: boolean) => changeTimeModalVisible(flg)">
    </TimeModal>
</template>


<script lang="ts" setup>
import { h, computed, ref, inject } from 'vue'
import { PlusOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import { Dayjs } from 'dayjs'
import { isPcModeRef } from '@/main'
import { getJapenseHoliday, isSameDay } from '@/utils/holidays'
import TimeModal from './TimeModal.vue'
import { isPcModeKey } from '@/types/inject'
import { useDateStore } from '@/stores/date'
import { useModeStore } from '@/stores/mode'

const isTimeModalVisible = ref<boolean>(false)
const isPcMode = inject(isPcModeKey, isPcModeRef)

const props = defineProps<{
    currentDate: Dayjs,
}>()

const dateStore = useDateStore()
const modeStore = useModeStore()

const isCancelable = computed(() => dateStore.$state.selectedDateList.length > 0)

const changeTimeModalVisible = (flg: boolean) => isTimeModalVisible.value = flg

const selectDates = (selectType: "work" | "all" | "holiday") => {
    const daysInCurrentMonth = props.currentDate.daysInMonth()
    const firstDateOfCurrentMonth = props.currentDate.startOf('month')
    let allSelected = true
    const indexOfSelectedDatesInSelectedDateList: number[] = []
    modeStore.currentMode = 'selectDate'
    for (let i = 0; i < daysInCurrentMonth; i++) {
        const date = firstDateOfCurrentMonth.add(i, 'day')
        let shouldPush = false
        if (selectType === "all") {
            shouldPush = true
        }
        else if (selectType === "work") {
            if (!getJapenseHoliday(date.toDate()) && ![0, 6].includes(date.day())) {
                shouldPush = true
            }
        }
        else {
            if (getJapenseHoliday(date.toDate()) || [0, 6].includes(date.day())) {
                shouldPush = true
            }
        }
        if (shouldPush) {
            const oldIndex = dateStore.selectedDateList.findIndex(old => isSameDay(old, date))
            if (oldIndex === -1) {
                allSelected = false
                dateStore.$patch(state => state.selectedDateList.push(date))
            }
            else {
                indexOfSelectedDatesInSelectedDateList.push(oldIndex)
            }
        }
    }
    if (allSelected) dateStore.$patch(state => state.selectedDateList = state.selectedDateList.filter((date, index) => !indexOfSelectedDatesInSelectedDateList.includes(index)))
}

const cancelSelect = () => {
    dateStore.$reset()
    if (modeStore.currentMode === 'selectDate') modeStore.initialize()
}

const customSelect = () => {
    dateStore.$patch(state => state.selectedDateList.push(props.currentDate))
    modeStore.currentMode = 'selectDate'
}

</script>