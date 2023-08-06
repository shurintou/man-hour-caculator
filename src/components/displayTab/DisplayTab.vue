<template>
    <a-tabs v-model:activeKey="showWhich">
        <a-tab-pane key="date" :tab="dateTabName"> </a-tab-pane>
        <a-tab-pane key="month" :tab="monthTabName"></a-tab-pane>
    </a-tabs>
    <DateDisplayer :current-date="currentDate" v-if="showWhich === 'date'"></DateDisplayer>
    <MonthDisplayer :current-date="currentDate" v-else></MonthDisplayer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import DateDisplayer from '@/components/displayTab/DateDisplayer.vue'
import MonthDisplayer from '@/components/displayTab/MonthDisplayer.vue'
import type { Dayjs } from 'dayjs'

const showWhich = ref<"date" | "month">("date")
const dateTabName = computed(() => props.currentDate.format('YYYY-MM-DD'))
const monthTabName = computed(() => props.currentDate.format('YYYY-MM'))

const props = defineProps<{
    currentDate: Dayjs,
}>()



</script>

<style scoped>
:where(.css-dev-only-do-not-override-eq3tly).ant-input-disabled,
:where(.css-dev-only-do-not-override-eq3tly).ant-input[disabled] {
    color: #000000;
}
</style>