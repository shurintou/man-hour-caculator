<template>
    <a-space wrap :size="props.pcRenderMode ? 'large' : 'middle'">
        <a-button type="primary" :icon="h(PlusOutlined)">
            <span v-if="props.pcRenderMode">Add</span>
        </a-button>
        <a-button type="primary" danger :icon="h(CloseCircleOutlined)" :disabled="!isCancelable"
            @click="dateStore.$reset()">
            <span v-if="props.pcRenderMode">Cancel</span>
        </a-button>
        <a-button type="default" :icon="h(EditOutlined)" :disabled="!isCancelable">
            <span v-if="props.pcRenderMode">Edit</span>
        </a-button>
    </a-space>
</template>


<script lang="ts" setup>
import { h, computed } from 'vue'
import { PlusOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons-vue'
import { useDateStore } from '@/stores/date'

const props = defineProps<{
    pcRenderMode: boolean,
}>()

const dateStore = useDateStore()

const isCancelable = computed(() => dateStore.$state.selectedDateList.length > 0)

</script>