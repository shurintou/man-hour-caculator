
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Calendar, DatePicker, Space, Button, Row, Col, Badge } from 'ant-design-vue'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(Calendar)
app.use(DatePicker)
app.use(Space)
app.use(Button)
app.use(Row)
app.use(Col)
app.use(Badge)
app.mount('#app')
