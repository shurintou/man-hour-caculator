<template>
    <div>
        <a-input v-model:value="a" :bordered="isEditing" :disabled="!isEditing" placeholder="Borderless" />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { Dayjs } from 'dayjs'


const props = defineProps<{
    currentDate: Dayjs,
}>()
const a = ref<string>("")
const isEditing = ref<boolean>(false)

</script>