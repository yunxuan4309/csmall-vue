import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// 引入 NutUI
import NutUI from '@nutui/nutui'
import '@nutui/nutui/dist/style.css'
import pinia from './store'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用 Pinia
app.use(pinia)

// 使用路由
app.use(router)

// 使用 Element Plus，配置中文
app.use(ElementPlus, {
  locale: zhCn,
})

// 使用 NutUI（移动端组件库）
app.use(NutUI)

app.mount('#app')
