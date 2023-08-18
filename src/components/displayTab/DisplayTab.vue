<template>
    <a-tabs :activeKey="showWhich" size="large" @change="changeTab" @edit="editTab" type="editable-card" hide-add
        :style="{ marginTop: isPcMode ? '' : '20px' }">
        <a-tab-pane v-if="dateStore.selectedDateList.length === 0" :closable="tabClosable"
            :key="props.currentDate.format('YYYYMMDD')" :tab="dateTabName"> </a-tab-pane>
        <template v-else v-for=" date in displayTabDateList()" :key="date.format('YYYYMMDD')">
            <a-tab-pane :tab="date.format('MM-DD')" :closable="tabClosable"
                :active="date.format('YYYYMMDD') === showWhich"> </a-tab-pane>
        </template>
        <template #rightExtra>
            <a-button class="tabs-extra-button" @click="showMonthReport" :icon="h(BarChartOutlined)">
                <span v-if="isPcMode"> {{ monthTabName + ' report' }} </span>
            </a-button>
        </template>
    </a-tabs>
    <DateDisplayer :current-date="currentDate" v-if="showWhich !== 'month'"></DateDisplayer>
    <MonthDisplayer :current-date="currentDate" v-else></MonthDisplayer>
</template>

<script lang="ts" setup>
import { h, ref, computed, inject, watch } from 'vue'
import { BarChartOutlined } from '@ant-design/icons-vue'
import DateDisplayer from '@/components/displayTab/DateDisplayer.vue'
import MonthDisplayer from '@/components/displayTab/MonthDisplayer.vue'
import dayjs, { type Dayjs } from 'dayjs'
import { isPcModeKey } from '@/types/inject'
import { isPcModeRef } from '@/main'
import { useDateStore } from '@/stores/date'
import { useModeStore } from '@/stores/mode'

const props = defineProps<{
    currentDate: Dayjs,
    changeDate: (date: Dayjs) => void,
}>()
const showWhich = ref<string>(props.currentDate.format('YYYYMMDD'))
const dateTabName = computed(() => props.currentDate.format('MM-DD'))
const monthTabName = computed(() => props.currentDate.format('YYYY-MM'))
const dateStore = useDateStore()
const modeStore = useModeStore()
const tabClosable = computed(() => dateStore.selectedDateList.length > 1)
const isPcMode = inject(isPcModeKey, isPcModeRef)

const changeTab = (key: string) => {
    props.changeDate(dayjs(key, 'YYYYMMDD'))
    showWhich.value = key
}
const showMonthReport = () => {
    modeStore.currentMode = 'normal'
    showWhich.value = 'month'
}
const editTab = (targetKey: string | MouseEvent, action: string) => {
    if (action === 'remove') {
        const index = dateStore.selectedDateList.findIndex(date => date.format('YYYYMMDD') === targetKey)
        const displayIndex = displayTabDateList().findIndex(date => date.format('YYYYMMDD') === targetKey)
        if (index >= 0) {
            dateStore.$patch(state => state.selectedDateList.splice(index, 1))
            let nextIndex = 0
            if (displayIndex > 1) nextIndex = displayIndex - 1
            if (showWhich.value !== 'month') showWhich.value = displayTabDateList()[nextIndex].format('YYYYMMDD')
        }
    }
}

const displayTabDateList = (() => dateStore.selectedDateList.sort((a, b) => a.date() - b.date()))

watch(() => props.currentDate, (newVal) => { if (showWhich.value !== 'month') showWhich.value = newVal.format('YYYYMMDD') })

</script>

<style scoped>
.tabs-extra-button {
    margin-left: 6px
}
</style>