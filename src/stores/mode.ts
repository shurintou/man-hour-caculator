import { defineStore } from 'pinia'

export const useModeStore = defineStore('mode', {
    state: () => {
        return {
            currentMode: 'normal' as 'normal' | 'selectDate' | 'editDate' | 'editTime'
        }
    },
    actions: {
        initialize() {
            this.currentMode = 'normal'
        },
    }
})
