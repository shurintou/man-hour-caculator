<template>
    <a-tabs :activeKey="showWhich" size="large" @change="changeTab" @edit="editTab" type="editable-card" hide-add
        :style="{ marginTop: isPcMode ? '' : '20px' }">
        <a-tab-pane v-if="dateStore.selectedDateList.length === 0" :closable="tabClosable"
            :key="props.currentDate.format('YYYYMMDD')" :tab="dateTabName"> </a-tab-pane>
        <template v-else v-for=" date in displayTabDateList()" :key="date.format('YYYYMMDD')">
            <a-tab-pane :tab="date.format('YYYY-MM-DD')" :closable="tabClosable"
                :active="date.format('YYYYMMDD') === showWhich"> </a-tab-pane>
        </template>
        <a-tab-pane key="month" :tab="monthTabName"></a-tab-pane>
    </a-tabs>
    <DateDisplayer :current-date="currentDate" v-if="showWhich !== 'month'"></DateDisplayer>
    <MonthDisplayer :current-date="currentDate" v-else></MonthDisplayer>
</template>

<script lang="ts" setup>
import { ref, computed, inject, watch } from 'vue'
import DateDisplayer from '@/components/displayTab/DateDisplayer.vue'
import MonthDisplayer from '@/components/displayTab/MonthDisplayer.vue'
import dayjs, { type Dayjs } from 'dayjs'
import { isPcModeKey } from '@/types/inject'
import { isPcModeRef } from '@/main'
import { useDateStore } from '@/stores/date'

const props = defineProps<{
    currentDate: Dayjs,
    changeDate: (date: Dayjs) => void,
}>()
const showWhich = ref<string>(props.currentDate.format('YYYYMMDD'))
const dateTabName = computed(() => props.currentDate.format('YYYY-MM-DD'))
const monthTabName = computed(() => props.currentDate.format('YYYY-MM'))
const dateStore = useDateStore()
const tabClosable = computed(() => dateStore.selectedDateList.length > 1)
const isPcMode = inject(isPcModeKey, isPcModeRef)

const changeTab = (key: string) => {
    props.changeDate(dayjs(key, 'YYYYMMDD'))
    showWhich.value = key
}
const editTab = (targetKey: string | MouseEvent, action: string) => {
    if (action === 'remove') {
        const index = dateStore.selectedDateList.findIndex(date => date.format('YYYYMMDD') === targetKey)
        dateStore.$patch(state => state.selectedDateList.splice(index, 1))
    }
}

const displayTabDateList = (() => dateStore.selectedDateList.sort((a, b) => a.date() - b.date()))

watch(() => props.currentDate, (newVal) => showWhich.value = newVal.format('YYYYMMDD'))

</script>

<style scoped>
:where(.css-dev-only-do-not-override-eq3tly).ant-input-disabled,
:where(.css-dev-only-do-not-override-eq3tly).ant-input[disabled] {
    color: #000000;
}
</style>