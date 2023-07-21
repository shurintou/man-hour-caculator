
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Calendar, DatePicker, Space, Button, Row, Col } from 'ant-design-vue'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(Calendar)
app.use(DatePicker)
app.use(Space)
app.use(Button)
app.use(Row)
app.use(Col)
app.mount('#app')
