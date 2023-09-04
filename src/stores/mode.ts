import { defineStore } from 'pinia'
import { type mode } from '@/types/index'

export const useModeStore = defineStore('mode', {
    state: () => {
        return {
            currentMode: 'normal' as mode
        }
    },
    actions: {
        initialize() {
            this.currentMode = 'normal'
        },
        toggltEditDate() {
            if (this.currentMode === 'normal') {
                this.currentMode = 'editDate'
            }
            else if (this.currentMode === 'editDate') {
                this.currentMode = 'normal'
            }
        },
    }
})
