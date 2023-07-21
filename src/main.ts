
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Calendar } from 'ant-design-vue'
import { DatePicker } from 'ant-design-vue'
import { Space } from 'ant-design-vue'
import { Button } from 'ant-design-vue'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(Calendar)
app.use(DatePicker)
app.use(Space)
app.use(Button)
app.mount('#app')
