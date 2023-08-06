<template>
    <div>
        <a-row>
            <a-col v-if="windowWidth >= smWidth" :md="{ span: 14 }" :lg="{ span: 12 }">
                <OperationBar :currentDate="currentDate"></OperationBar>
            </a-col>
            <a-col :xs="{ span: 24 }" :sm="{ span: 24 }" :md="{ span: 10 }" :lg="{ offset: 6, span: 6 }">
                <a-space warp size="large">
                    <a-space warp size="middle">
                        <a-button shape="circle" :icon="h(DoubleLeftOutlined)" @click="addMonth(-12)" />
                        <a-button shape="circle" :icon="h(LeftOutlined)" @click="addMonth(-1)" />
                        <a-button type="primary" shape="circle" :icon="h(EnvironmentOutlined)"
                            @click="changeDate(dayjs())" />
                        <a-button shape="circle" :icon="h(RightOutlined)" @click="addMonth(+1)" />
                        <a-button shape="circle" :icon="h(DoubleRightOutlined)" @click="addMonth(+12)" />
                    </a-space>
                    <a-date-picker size="large" :value="$props.currentDate" picker="month" placeholder="select year/month"
                        style="width: 110px;" :allowClear="false" :onChange="changeYearMonth" />
                </a-space>
            </a-col>
        </a-row>
    </div>
</template>


<script lang="ts" setup>
import { h, inject } from 'vue'
import { windowWidthRef } from '@/main'
import OperationBar from '@/components/operationBar/OperationBar.vue'
import { LeftOutlined, RightOutlined, DoubleLeftOutlined, DoubleRightOutlined, EnvironmentOutlined } from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'
import { windowWidthKey } from '@/types/inject'
import type { ChangeDateData } from '@/types/index'
import { windowWidthConstant } from '@/config/constants'

const { smWidth } = windowWidthConstant
const windowWidth = inject(windowWidthKey, windowWidthRef)

const props = defineProps<{
    currentDate: Dayjs,
}>()

const emit = defineEmits<{ (e: 'changeDate', changeDateData: ChangeDateData): void }>()

const changeDate = (newDate: Dayjs, clearAll = false) => {
    emit('changeDate', { newDate: newDate, clearAll: clearAll })
}


const changeYearMonth = (newDate: Dayjs) => {
    if (newDate.year() !== props.currentDate.year() || newDate.month() !== props.currentDate.month())
        changeDate(newDate, true)
}


const addMonth = (payload: number) => {
    const newDate = props.currentDate.add(payload, 'month')
    changeDate(newDate, true)
}

</script>