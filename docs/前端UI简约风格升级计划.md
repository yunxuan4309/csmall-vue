# 前端 UI 简约风格升级计划

> 更新时间：2026-07-26
> 状态：已批准，待实施

---

## 一、为什么要做

当前 csmall-vue 前端页面视觉表现力不足：

| 问题 | 示例 |
|------|------|
| 标题滥用 emoji | ProductList 的 "🛍️ 商品列表"、SeckillList 的 "⚡ 秒杀专区" |
| 全部使用 Element Plus 默认蓝色色系 | 缺少品牌识别，按钮/菜单/标签都是默认蓝 |
| 页面切换无过渡动画 | 路由切换生硬，没有流畅感 |
| 卡片样式平平 | 直角、默认阴影、hover 时上移 5px 幅度过大 |
| Dashboard 全是硬编码假数据 | "1,234 用户"、"567 商品" 没有对接后端 |
| 整体观感"模板化" | 像是初学者项目，缺少精致感 |

用户偏好：**简约风格** + **页面切换动画流畅自然**

---

## 二、改动原则

- ✅ 不修改业务逻辑，纯表现层改动
- ✅ 保持 `<script setup>` + Composition API 代码风格
- ✅ 不改动后端接口
- ✅ 全站响应式适配保留且兼容
- ✅ 不引入新 npm 依赖

---

## 三、涉及文件清单（12 个文件）

| 文件 | 改动类型 | 改动内容 |
|------|---------|---------|
| `src/styles/variables.css` | **新增** | 全局 CSS 变量（品牌色/圆角/阴影/过渡/字体） |
| `src/main.js` | 修改 | 引入全局 CSS 变量文件 |
| `src/App.vue` | 修改 | 添加页面级 `<Transition>` 动画 |
| `src/views/front/layout/FrontLayout.vue` | 修改 | 导航简约化 + router-view 过渡 |
| `src/views/admin/layout/AdminLayout.vue` | 修改 | router-view 过渡动画 |
| `src/views/admin/login/LoginView.vue` | 修改 | 简约风格登录页（去掉紫色渐变） |
| `src/views/front/product/ProductList.vue` | 修改 | 移除 emoji + 卡片简约化 |
| `src/views/front/seckill/SeckillList.vue` | 修改 | 移除 emoji + 卡片简约化 |
| `src/views/front/cart/CartList.vue` | 修改 | 卡片线条/布局微调 |
| `src/views/front/order/OrderPay.vue` | 修改 | 卡片简约化 |
| `src/views/front/order/PayResult.vue` | 修改 | 卡片圆角统一 |
| `src/views/admin/dashboard/DashboardView.vue` | 修改 | 移除假数据占位 |

---

## 四、实施步骤

### 第一步：全局设计变量

新增 `src/styles/variables.css`，定义：

```
--brand-primary: #4a6cf7         品牌主色（中性蓝紫）
--brand-primary-light: #eef1ff   主色极浅色
--brand-text: #1e293b            主文字（深灰蓝）
--brand-text-secondary: #64748b  次要文字
--brand-bg: #f8fafc             页面背景
--brand-border: #e2e8f0         边框色

--radius-sm: 6px   小圆角
--radius-md: 10px  中圆角（卡片）
--radius-lg: 16px  大圆角

--shadow-sm: 0 1px 3px rgba(0,0,0,0.04)   卡片默认
--shadow-md: 0 4px 12px rgba(0,0,0,0.06)  卡片hover
--shadow-lg: 0 8px 24px rgba(0,0,0,0.08)  弹窗

--transition-fast: 0.2s ease
--transition-normal: 0.3s ease

--font-family: ...系统字体栈
```

同时覆盖 Element Plus CSS 变量（`--el-color-primary` 等），使全部组件自动适配品牌色。

---

### 第二步：页面过渡动画

利用 Vue 3 `<Transition>` 对 router-view 做包装：

**动画曲线**：`cubic-bezier(0.4, 0, 0.2, 1)` — Material Design 标准缓动

**参数**：

| 属性 | 值 | 说明 |
|------|-----|------|
| enter 持续时间 | 0.25s | 新页面进入稍长，更自然 |
| leave 持续时间 | 0.15s | 旧页面离开稍短，干脆 |
| enter 起始 | opacity 0 + translateY(8px) | 页面从下方浮入 |
| leave 终点 | opacity 0 + translateY(-4px) | 页面向上淡出 |

涉及文件：`App.vue`、`FrontLayout.vue`、`AdminLayout.vue`

---

### 第三步：导航简约化

**FrontLayout.vue**：
- "商城首页" 文字改为纯文字，去掉蓝色高亮
- header 去掉 box-shadow，改为极淡底部边框
- 导航菜单文字字重改轻

**AdminLayout.vue**：
- 侧边栏从 `#304156` 改为 `#1e293b`（更深、更克制）
- logo 区微调

---

### 第四步：页面卡片简约化

统一改造模式（6 个页面文件）：

```
当前                        →  改造后
───────────────────────────────────────────────
border-radius: 默认(0)     →  var(--radius-md) 10px
box-shadow: 默认           →  var(--shadow-sm)
hover 上移 5px             →  hover 上移 2px
价格 color: #f56c6c(红色)   →  color: var(--brand-primary)
标题 emoji                  →  纯文字
页面标题蓝色分割线           →  极淡灰分割线或无
```

---

### 第五步：登录页简约化

当前紫色渐变背景 + 大白卡片：
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

改为：
- 背景：纯色 `var(--brand-bg)` 或极淡渐变色
- 卡片：窄边框 + 轻阴影，圆角 10px
- 前景用户登录页同步改造

---

### 第六步：Dashboard 去假数据

移除硬编码数据卡片（"1,234 用户"等），保留骨架结构但不展示虚假数据。为后续对接后端统计接口预留。

---

## 五、实施顺序

```
Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6
全局变量   过渡动画   导航     卡片们    登录页    Dashboard
```

- Step 1 必须先做，后面所有页面引用全局变量
- Step 2 独立，随时可做
- Step 3~6 可按模块逐个推进，互不依赖

---

## 六、验证方式

1. `npm run dev` 启动后逐页浏览
2. 切换路由检查过渡动画是否流畅自然
3. 卡片 hover 效果（上移 2px + 阴影变化）
4. 移动端 <768px 响应式布局未被破坏
5. 管理员登录页外观 + 登录流程验证
6. 前台用户登录页外观验证
7. 检查控制台无 CSS 报错
