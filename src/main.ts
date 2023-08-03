
import { createApp, ref, computed } from 'vue'
import { createPinia } from 'pinia'
import { Calendar, DatePicker, Space, Button, Row, Col, Badge, Dropdown, Menu, Modal, Form, InputNumber, TimePicker, Alert } from 'ant-design-vue'
import App from './App.vue'
import { windowWidthKey, gridTypeKey, isPcModeKey, isSpModeKey } from '@/types/inject'
import { windowWidthConstant } from '@/config/constants'
import { throttle } from '@/utils/common'

const app = createApp(App)

export const windowWidthRef = ref(window.innerWidth)
const { xsWidth, smWidth, mdWidth, lgWidth, xlWidth } = windowWidthConstant

export const gridTypeRef = computed(() => {
    const { value } = windowWidthRef
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

export const isPcModeRef = computed(() => windowWidthRef.value >= mdWidth)

export const isSPModeRef = computed(() => windowWidthRef.value < mdWidth)

window.addEventListener('resize', throttle(() => {
    windowWidthRef.value = window.innerWidth
}))

app.provide(windowWidthKey, windowWidthRef)
app.provide(gridTypeKey, gridTypeRef)
app.provide(isPcModeKey, isPcModeRef)
app.provide(isSpModeKey, isSPModeRef)


app.use(createPinia())
app.use(Alert)
app.use(Badge)
app.use(Button)
app.use(Calendar)
app.use(Col)
app.use(DatePicker)
app.use(Dropdown)
app.use(Form)
app.use(InputNumber)
app.use(Menu)
app.use(Modal)
app.use(Row)
app.use(Space)
app.use(TimePicker)
app.mount('#app')
