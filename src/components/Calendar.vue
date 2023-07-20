<template>
  <a-calendar v-model:value="value" :disabledDate="isDisabledMonth" class="custom-ant-calendar">
    <template #dateFullCellRender="{ current }">
      <DateButton :data="current" :is-current-month="!isDisabledMonth(current)"></DateButton>
    </template>
  </a-calendar>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import DateButton from '@/components/DateButton.vue'
const value = ref<Dayjs>(dayjs())
console.log(value.value.locale())

const isDisabledMonth = (currentDate: Dayjs) => currentDate.month() !== value.value?.month()
</script>

<style>
.custom-ant-calendar .ant-picker-content {
  /* to override the style of the header of the calendar. */
  text-align: center;
}
</style>