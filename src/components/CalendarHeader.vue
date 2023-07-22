<template>
    <div>
        <a-row>
            <a-col :xs="{ span: 0 }" :sm="{ span: 0 }" :md="{ span: 14 }" :lg="{ span: 12 }">
                <OperationBar :pcRenderMode="true"></OperationBar>
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
                        style="width: 150px;" :allowClear="false" :onChange="changeYearMonth" />
                </a-space>
            </a-col>
        </a-row>
    </div>
</template>


<script lang="ts" setup>
import { h } from 'vue'
import OperationBar from './OperationBar.vue';
import { LeftOutlined, RightOutlined, DoubleLeftOutlined, DoubleRightOutlined, EnvironmentOutlined } from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'
const props = defineProps<{
    currentDate: Dayjs,
}>()
const emit = defineEmits<{
    (e: 'changeDate', newDate: Dayjs): void
}>()


const changeDate = (newDate: Dayjs) => {
    emit('changeDate', newDate)
}


const changeYearMonth = (newDate: Dayjs) => {
    if (newDate.year() !== props.currentDate.year() || newDate.month() !== props.currentDate.month())
        changeDate(newDate)
}


const addMonth = (payload: number) => {
    const newDate = props.currentDate.add(payload, 'month')
    changeDate(newDate)
}

</script>