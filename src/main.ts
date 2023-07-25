
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Calendar, DatePicker, Space, Button, Row, Col, Badge, Dropdown, Menu, Modal, Form, InputNumber, TimePicker } from 'ant-design-vue'
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
app.use(Dropdown)
app.use(Menu)
app.use(Modal)
app.use(Form)
app.use(InputNumber)
app.use(TimePicker)
app.mount('#app')
