<template>
    <span>{{ data.day.split('-')[2] }}</span>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { type DateButtonProp } from '@/types/dateButton'
defineProps<{
    data: DateButtonProp
}>()
</script>