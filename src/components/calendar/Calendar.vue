<template>
  <a-calendar :fullscreen="false" :value="date" :disabledDate="isDisabledMonth" class="custom-ant-calendar"
    @select="selectDate">
    <template #headerRender="{ value }">
      <CalendarHeader @change-date="changeDate" :currentDate="value"></CalendarHeader>
    </template>
    <template #dateFullCellRender="{ current }">
      <DateButton @change-date="changeDate" :date="current" :is-current-month="!isDisabledMonth(current)"
        :isSelected="dateStore.selectedDateList.some(old => isSameDay(old, current))"></DateButton>
    </template>
  </a-calendar>
  <OperationBar v-if="windowWidth < smWidth" :currentDate="date"></OperationBar>
  <DisplayTab :current-date="date"></DisplayTab>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue'
import { windowWidthRef } from '@/main'
import dayjs, { Dayjs } from 'dayjs'
import DateButton from '@/components/calendar/DateButton.vue'
import CalendarHeader from '@/components/calendar/CalendarHeader.vue'
import OperationBar from '@/components/operationBar/OperationBar.vue'
import DisplayTab from '@/components/displayTab/DisplayTab.vue'
import { isSameDay } from '@/utils/holidays'
import { useDateStore } from '@/stores/date'
import { windowWidthKey } from '@/types/inject'
import type { ChangeDateData } from '@/types/index'
import { windowWidthConstant } from '@/config/constants'

const date = ref<Dayjs>(dayjs())
const dateStore = useDateStore()
const windowWidth = inject(windowWidthKey, windowWidthRef)
const { smWidth } = windowWidthConstant

const isDisabledMonth = (currentDate: Dayjs) => currentDate.month() !== date.value?.month()

const changeDate = (changeDateData: ChangeDateData) => {
  date.value = changeDateData.newDate
  if (changeDateData.clearAll) dateStore.$reset()
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

:where(.css-dev-only-do-not-override-eq3tly).ant-picker-calendar .ant-picker-cell-disabled::before {
  /* not to set background color for date in previous or next month */
  background-color: unset !important;
}

.ant-picker-cell {
  padding: 0px !important;
}

@media screen and (min-width: 992px) {
  .ant-picker-cell :hover {
    background-color: #f2f4f7;
  }
}

.ant-picker-cell-today {
  border-top-style: solid;
  border-top-width: 2px;
  border-top-color: #1677ff;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  background-color: #e6f4ff;
}
</style>