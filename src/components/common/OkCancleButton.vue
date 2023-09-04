<script setup lang="ts">
import { ref } from 'vue'
import { CloseCircleOutlined, CheckOutlined } from '@ant-design/icons-vue'
import { h, inject } from 'vue'
import { isPcModeRef } from '@/main'
import { isPcModeKey } from '@/types/inject'

const isPcMode = inject(isPcModeKey, isPcModeRef)

const props = defineProps<{
    submitFunc: Function,
    cancelFunc: Function,
    isFormStateModified: boolean,
}>()

const popconfirmVisible = ref<boolean>(false)
const handlePopconfirmVisibleChange = (open: boolean) => {
    if (!open) {
        popconfirmVisible.value = false
        return
    }
    if (props.isFormStateModified === true) {
        popconfirmVisible.value = true
    }
    else {
        props.cancelFunc()
        popconfirmVisible.value = false
    }
}
</script>


<template>
    <a-space :size="isPcMode ? 'large' : 'middle'">
        <a-button type="primary" :icon="h(CheckOutlined)" @click="props.submitFunc" :disabled="!props.isFormStateModified">
            <span>Submit</span>
        </a-button>
        <a-popconfirm title="Are you sure cancel this edit?" ok-text="Yes" cancel-text="No" @confirm="props.cancelFunc"
            placement="left" :open="popconfirmVisible" @openChange="handlePopconfirmVisibleChange">
            <a-button type="primary" :icon="h(CloseCircleOutlined)" danger>
                <span>Cancel</span>
            </a-button>
        </a-popconfirm>
    </a-space>
</template>
