<template>
    <a-modal title="Edit" centered :open="props.isModalVisible" @ok="changeModalVisible(false)"
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
import type { EditModalFormState } from '@/types/index'
const emit = defineEmits<{
    (e: 'changeEditModalVisible', flg: boolean): void
}>()

const props = defineProps<{
    isModalVisible: boolean,
}>()

const dateStore = useDateStore()

const formState: UnwrapRef<EditModalFormState> = reactive({
    date: dateStore.$state.selectedDateList?.[0]?.format("YYYYMMDD") || "",
    type: "",
    holidayType: "",
    tasks: [],
    memo: "",
})
const changeModalVisible = (flg: boolean) => {
    emit("changeEditModalVisible", flg)
}
</script>