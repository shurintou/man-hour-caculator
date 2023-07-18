<template>
  <el-calendar ref="calendar">
    <template #header="{ date }">
      <span>{{ date }}</span>
      <el-button-group>
        <el-button size="small" @click="selectDate('prev-year')">
          &lt;&lt;
        </el-button>
        <el-button size="small" @click="selectDate('prev-month')">
          &lt;
        </el-button>
        <el-button size="small" @click="selectDate('next-month')">
          &gt;
        </el-button>
        <el-button size="small" @click="selectDate('next-year')">
          &gt;&gt;
        </el-button>
      </el-button-group>
    </template>
    <template #date-cell="{ data }">
      <DateButton :data="{ type: data.type, isSelected: data.isSelected, day: data.day, date: data.date }"></DateButton>
    </template>
  </el-calendar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import DateButton from './DateButton.vue';
import type { CalendarDateType, CalendarInstance } from 'element-plus'

const calendar = ref<CalendarInstance>()
const selectDate = (val: CalendarDateType) => {
  if (!calendar.value) return
  calendar.value.selectDate(val)
}
</script>
