<template>
    <a-form :layout="layout" :model="formState">
        <a-row>
            <a-col :md="{ span: 24 }" :lg="{ offset: lgOffset, span: 5 }" :xl="{ offset: xlOffset, span: 5 }">
                <a-form-item label="Scheduled work hours" timeMinuteStep v-bind="validateInfos.scheduledWorkHours">
                    <a-input-number type="number" :style="inputStyle" timeMinuteStep
                        v-model:value="formState.scheduledWorkHours" :addon-after="timeInputAddonAfter"
                        :step="timeInputStep" />
                </a-form-item>
            </a-col>
            <a-col :md="{ span: 24 }" :lg="{ span: 6 }" :xl="{ span: 5 }">
                <a-form-item label="Start time" timeMinuteStep v-bind="validateInfos.startTime">
                    <a-time-picker v-model:value="formState.startTime" :valueFormat="timeValueFormat"
                        :format="timeDisplayFormat" :inputReadOnly="true" :timeMinuteStep="timeMinuteStep" />
                </a-form-item>
            </a-col>
            <a-col :md="{ span: 24 }" :lg="{ span: 6 }" :xl="{ span: 5 }">
                <a-form-item label="End time" timeMinuteStep v-bind="validateInfos.endTime">
                    <a-time-picker v-model:value="formState.endTime" :valueFormat="timeValueFormat"
                        :format="timeDisplayFormat" :inputReadOnly="true" :timeMinuteStep="timeMinuteStep" />
                </a-form-item>
            </a-col>
            <a-col :md="{ span: 24 }" :lg="{ span: 6 }" :xl="{ span: 5 }">
                <a-form-item label="Rest hours" timeMinuteStep v-bind="validateInfos.restHours">
                    <a-input-number type="number" :style="inputStyle" timeMinuteStep v-model:value="formState.restHours"
                        :addon-after="timeInputAddonAfter" :step="timeInputStep" />
                </a-form-item>
            </a-col>
        </a-row>
        <a-row>
            <a-col :lg="{ offset: lgOffset }" :xl="{ offset: xlOffset }">
                <a-form-item label="memo">
                    <a-textarea v-model:value="formState.memo" :style="textAreaStyle"
                        :placeholder="modeStore.currentMode === 'editDate' ? 'take down some memos' : ''" :rows="2" />
                </a-form-item>
            </a-col>
        </a-row>
    </a-form>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, inject, watch, type UnwrapRef } from 'vue'
import type { Dayjs } from 'dayjs'
import { windowWidthKey } from '@/types/inject'
import { windowWidthRef } from '@/main'
import type { EditFormState } from '@/types/index'
import { timeModalRuleRef, timeInputAddonAfter, timeInputStep, timeMinuteStep, timeDisplayFormat, timeValueFormat } from '@/utils/rules'
import { Form } from 'ant-design-vue'
import { windowWidthConstant } from '@/config/constants'
import db from '@/utils/datebase'
import { useModeStore } from '@/stores/mode'

const inputStyle = { width: '120px' }
const textAreaStyle = { width: '1200px' }
const lgOffset = 1
const xlOffset = 2
const windowWidth = inject(windowWidthKey, windowWidthRef)
const { mdWidth } = windowWidthConstant
const useForm = Form.useForm
const props = defineProps<{
    currentDate: Dayjs,
}>()
const a = ref<string>("")
const layout = computed(() => {
    if (windowWidth.value < mdWidth) return 'horizontal'
    return 'vertical'
})
const isEditing = ref<boolean>(false)

const formState: UnwrapRef<EditFormState> = reactive({
    startTime: undefined,
    endTime: undefined,
    scheduledWorkHours: undefined,
    restHours: undefined,
    tasks: undefined,
    unsavedTasks: undefined,
    memo: undefined,
})

const modeStore = useModeStore()
watch(() => props.currentDate, async (newVal, oldVal) => {
    if (!oldVal || newVal.format('YYYYMMDD') !== oldVal.format('YYYYMMDD')) {
        const dbHandler = await db
        const transaction = dbHandler.transaction('dates', 'readwrite')
        const dateKey = props.currentDate.format("YYYYMMDD")
        const storedDateInfo = await dbHandler.get("dates", dateKey)
        await transaction.done
        if (storedDateInfo) {
            const { startTime, endTime, scheduledWorkHours, restHours, memo } = storedDateInfo
            formState.startTime = startTime
            formState.endTime = endTime
            formState.scheduledWorkHours = scheduledWorkHours
            formState.restHours = restHours
            formState.memo = memo
        }
    }
}, { immediate: true })

const { validate, validateInfos } = useForm(formState, timeModalRuleRef)

</script>