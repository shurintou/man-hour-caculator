import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { windowWidthConstant } from '@/config/constants'

export const useWindowWidthStore = defineStore('windowWidth', () => {
    const windowWidth = ref(window.innerWidth)
    const { xsWidth, smWidth, mdWidth, lgWidth, xlWidth } = windowWidthConstant

    const gridType = computed(() => {
        const { value } = windowWidth
        if (value < xsWidth) {
            return 'xs'
        }
        else if (value < smWidth) {
            return 'sm'
        }
        else if (value < mdWidth) {
            return 'md'
        }
        else if (value < lgWidth) {
            return 'lg'
        }
        else if (value < xlWidth) {
            return 'xl'
        }
        return 'xxl'
    })

    const isPcMode = computed(() => windowWidth.value >= mdWidth)

    const isSPMode = computed(() => windowWidth.value < mdWidth)

    window.addEventListener('resize', () => {
        windowWidth.value = window.innerWidth
    })

    return { windowWidth, gridType, isPcMode, isSPMode }
})