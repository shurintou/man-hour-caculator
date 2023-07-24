<template>
    <a-modal title="Time" centered :open="props.isModalVisible" @ok="changeModalVisible(false)"
        @cancel="changeModalVisible(false)" okText="submit">
        <a-form :model="formState">
            <a-form-item label="Activity name">
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useDateStore } from '@/stores/date'
import type { UnwrapRef } from 'vue'
import type { TimeModalFormState } from '@/types/index'
const emit = defineEmits<{
    (e: 'changeTimeModalVisible', flg: boolean): void
}>()

const props = defineProps<{
    isModalVisible: boolean,
}>()

const dateStore = useDateStore()

const formState: UnwrapRef<TimeModalFormState> = reactive({
    dateList: dateStore.$state.selectedDateList,
    predictWorkHours: 0,
    startTime: undefined,
    EndTime: undefined,
    restHours: 0,
})
const changeModalVisible = (flg: boolean) => {
    emit("changeTimeModalVisible", flg)
}
</script>