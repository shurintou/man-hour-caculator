<template>
    <a-space wrap :size="props.pcRenderMode ? 'large' : 'middle'">
        <a-dropdown>
            <a-button type="primary" :icon="h(PlusOutlined)">
                <span v-if="props.pcRenderMode">Add</span>
            </a-button>
            <template #overlay>
                <a-menu>
                    <a-menu-item key="1"><a-button type="link" @click="selectDate('work')">All
                            weekdays</a-button></a-menu-item>
                    <a-menu-item key="2"><a-button type="link" @click="selectDate('all')">All days</a-button></a-menu-item>
                    <a-menu-item key="3"><a-button type="link" @click="selectDate('holiday')">All
                            holidays</a-button></a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>
        <a-button type="primary" danger :icon="h(CloseCircleOutlined)" :disabled="!isCancelable"
            @click="dateStore.$reset()">
            <span v-if="props.pcRenderMode">Cancel</span>
        </a-button>
        <a-button type="default" :icon="h(EditOutlined)" :disabled="!isCancelable">
            <span v-if="props.pcRenderMode">Edit</span>
        </a-button>
    </a-space>
</template>


<script lang="ts" setup>
import { h, computed } from 'vue'
import { PlusOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons-vue'
import { Dayjs } from 'dayjs'
import { getJapenseHoliday, isSameDay } from '@/utils/holidays'
import { useDateStore } from '@/stores/date'

const props = defineProps<{
    pcRenderMode: boolean,
    currentDate: Dayjs,
}>()

const dateStore = useDateStore()

const isCancelable = computed(() => dateStore.$state.selectedDateList.length > 0)

const selectDate = (selectType: "work" | "all" | "holiday") => {
    const daysInCurrentMonth = props.currentDate.daysInMonth()
    const firstDateOfCurrentMonth = props.currentDate.startOf('month')
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
            if (oldIndex === -1) dateStore.$patch(state => state.selectedDateList.push(date))
        }
    }
}

</script>