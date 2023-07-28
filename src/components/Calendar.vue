<template>
  <a-calendar :value="date" :disabledDate="isDisabledMonth" class="custom-ant-calendar" @select="selectDate">
    <template #headerRender="{ value }">
      <CalendarHeader @change-date="changeDate" :currentDate="value"></CalendarHeader>
    </template>
    <template #dateFullCellRender="{ current }">
      <DateButton @change-date="changeDate" :date="current" :is-current-month="!isDisabledMonth(current)"
        :isSelected="dateStore.selectedDateList.some(old => isSameDay(old, current))"></DateButton>
    </template>
  </a-calendar>
  <OperationBar v-if="windowWidth < smWidth" :currentDate="date"></OperationBar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import DateButton from '@/components/DateButton.vue'
import CalendarHeader from '@/components/CalendarHeader.vue'
import OperationBar from './OperationBar.vue'
import { isSameDay } from '@/utils/holidays'
import { useDateStore } from '@/stores/date'
import { useWindowWidthStore } from '@/stores/windowWidth'
import constant from '@/config/constants'
import { storeToRefs } from 'pinia'

const date = ref<Dayjs>(dayjs())
const dateStore = useDateStore()
const windowWidthStore = useWindowWidthStore()
const { windowWidth } = storeToRefs(windowWidthStore)
const { smWidth } = constant

const isDisabledMonth = (currentDate: Dayjs) => currentDate.month() !== date.value?.month()

const changeDate = (newDate: Dayjs) => {
  date.value = newDate
}

const selectDate = (selectedDate: Dayjs) => {
  const oldIndex = dateStore.selectedDateList.findIndex(old => isSameDay(old, selectedDate))
  if (oldIndex === -1) {
    dateStore.$patch(state => state.selectedDateList.push(selectedDate))
  }
  else {
    dateStore.$patch(state => state.selectedDateList.splice(oldIndex, 1))
  }
}
</script>

<style>
.custom-ant-calendar .ant-picker-content {
  /* to override the style of the header of the calendar. */
  text-align: center;
}
</style>