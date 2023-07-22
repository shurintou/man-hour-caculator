<template>
  <a-calendar :value="date" :disabledDate="isDisabledMonth" class="custom-ant-calendar" @select="selectDate">
    <template #headerRender="{ value }">
      <CalendarHeader @change-date="changeDate" :currentDate="value"></CalendarHeader>
    </template>
    <template #dateFullCellRender="{ current }">
      <DateButton @change-date="changeDate" :date="current" :is-current-month="!isDisabledMonth(current)"
        :is-selected="dateStore.selectedDateList.some(old => old.isSame(current))"></DateButton>
    </template>
  </a-calendar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import DateButton from '@/components/DateButton.vue'
import CalendarHeader from '@/components/CalendarHeader.vue'
import { useDateStore } from '@/stores/date'

const date = ref<Dayjs>(dayjs())
const dateStore = useDateStore()

const isDisabledMonth = (currentDate: Dayjs) => currentDate.month() !== date.value?.month()

const changeDate = (newDate: Dayjs) => {
  date.value = newDate
}

const selectDate = (selectedDate: Dayjs) => {
  const oldIndex = dateStore.selectedDateList.findIndex(old => old.isSame(selectedDate))
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