<template>
    <div class="ant-picker-cell-inner ant-picker-calendar-date" v-if="props.isCurrentMonth">
        <div class="ant-picker-calendar-date-value" style="font-size: large; font-weight: bold;"
            :style="{ 'color': dateColor }">
            {{ props.data.date() }}
        </div>
        <div class="ant-picker-calendar-date-content"></div>
    </div>
</template>

<script lang="ts" setup>
import { Dayjs } from 'dayjs'
import { ref, computed } from 'vue'
const props = defineProps<{
    data: Dayjs,
    isCurrentMonth: boolean,
}>()

const dateColor = computed(() => {
    const day = props.data.day()
    if (day === 0) return '#ff4d4f'
    if (day === 6) return '#1677ff'
    return ''
})

</script>