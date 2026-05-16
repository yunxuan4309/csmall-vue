# Csmall Vue - 电商管理系统前端

一个基于 Vue 3 + Vite + Element Plus 的现代化电商管理系统前端应用，包含完整的后台管理功能和前台用户购物功能。

## 🚀 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI 组件库**: 
  - Element Plus (桌面端)
  - NutUI (移动端)
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **图标**: Element Plus Icons

## ✨ 功能特性

### 后台管理系统
- 📊 数据仪表盘
- 👥 管理员管理
- 🔐 角色权限管理
- 📦 商品管理（品牌、分类、SPU）
- 🛒 订单管理
- 🔑 登录认证

### 前台用户系统
- 🏠 首页展示
- 🔍 商品搜索与列表
- 📱 商品详情
- 🛒 购物车管理
- 💳 订单结算与支付
- ⚡ 秒杀活动
- 👤 用户中心
- 🤖 AI 智能助手

## 📁 项目结构

```
csmall-vue/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口定义
│   │   ├── admin.js       # 后台管理接口
│   │   ├── ai.js          # AI 相关接口
│   │   ├── cart.js        # 购物车接口
│   │   ├── order.js       # 订单接口
│   │   ├── product.js     # 商品相关接口
│   │   ├── user.js        # 用户接口
│   │   └── request.js     # Axios 请求封装
│   ├── assets/            # 资源文件
│   ├── components/        # 组件
│   │   ├── admin/         # 后台组件
│   │   ├── common/        # 公共组件
│   │   └── front/         # 前台组件
│   ├── composables/       # 组合式函数
│   ├── router/            # 路由配置
│   ├── store/             # Pinia 状态管理
│   │   ├── user.js        # 用户状态
│   │   ├── cart.js        # 购物车状态
│   │   └── permission.js  # 权限状态
│   ├── styles/            # 样式文件
│   ├── utils/             # 工具函数
│   ├── views/             # 页面视图
│   │   ├── admin/         # 后台页面
│   │   │   ├── dashboard/ # 仪表盘
│   │   │   ├── login/     # 登录页
│   │   │   ├── product/   # 商品管理
│   │   │   ├── order/     # 订单管理
│   │   │   └── ...
│   │   └── front/         # 前台页面
│   │       ├── home/      # 首页
│   │       ├── product/   # 商品页面
│   │       ├── cart/      # 购物车
│   │       ├── order/     # 订单页面
│   │       ├── seckill/   # 秒杀页面
│   │       └── ...
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── .env                   # 环境变量
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── vite.config.js         # Vite 配置
├── package.json           # 项目依赖
└── README.md              # 项目说明
```

## 🛠️ 快速开始

### 环境要求

- Node.js >= 16.x
- npm >= 8.x 或 yarn >= 1.22.x

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 预览生产构建

```bash
npm run preview
# 或
yarn preview
```

## ⚙️ 配置说明

### 环境变量

项目使用 `.env` 文件管理环境变量：

- `.env` - 通用环境变量
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

### API 代理配置

在 `vite.config.js` 中配置了后端服务的代理：

```javascript
server: {
  proxy: {
    '/sso': 'http://localhost:10087',
    '/front': 'http://localhost:10087',
    '/oms': 'http://localhost:10087',
    '/search': 'http://localhost:10087',
    '/resource': 'http://localhost:10087',
    '/seckill': 'http://localhost:10087',
    '/admin': 'http://localhost:10087',
    '/user': 'http://localhost:10087',
    '/ai': 'http://localhost:10087',
  }
}
```

## 📝 开发规范

### 代码风格

- 使用 Vue 3 Composition API (`<script setup>`)
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### 路径别名

项目中配置了 `@` 别名指向 `src` 目录：

```javascript
import xxx from '@/components/xxx.vue'
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📧 联系方式

如有问题或建议，请提交 Issue 或联系项目维护者。

---

**注意**: 本项目需要配合后端微服务使用，请确保后端服务已启动并正确配置。
