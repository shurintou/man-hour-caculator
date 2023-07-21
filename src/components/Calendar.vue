<template>
  <a-calendar :value="date" :disabledDate="isDisabledMonth" class="custom-ant-calendar">
    <template #headerRender="{ value }">
      <CalendarHeader @change-date="changeDate" :currentDate="value"></CalendarHeader>
    </template>
    <template #dateFullCellRender="{ current }">
      <DateButton @change-date="changeDate" :date="current" :is-current-month="!isDisabledMonth(current)"></DateButton>
    </template>
  </a-calendar>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import DateButton from '@/components/DateButton.vue'
import CalendarHeader from '@/components/CalendarHeader.vue'
const date = ref<Dayjs>(dayjs())

const isDisabledMonth = (currentDate: Dayjs) => currentDate.month() !== date.value?.month()

const changeDate = (newDate: Dayjs) => {
  date.value = newDate
}
</script>

<style>
.custom-ant-calendar .ant-picker-content {
  /* to override the style of the header of the calendar. */
  text-align: center;
}
</style>