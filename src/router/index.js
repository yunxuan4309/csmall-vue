import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  // 前台路由
  {
    path: '/login',
    name: 'FrontLogin',
    component: () => import('@/views/front/login/LoginView.vue'),
    meta: { title: '用户登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/front/register/RegisterView.vue'),
    meta: { title: '用户注册' }
  },
  
  // 后台管理路由
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/login/LoginView.vue'),
    meta: { title: '管理员登录' }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/layout/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/dashboard/DashboardView.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'admin-user',
        name: 'AdminUser',
        component: () => import('@/views/admin/admin-user/AdminList.vue'),
        meta: { title: '管理员管理', icon: 'User' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/admin/role/RoleList.vue'),
        meta: { title: '角色管理', icon: 'Avatar' }
      },
      {
        path: 'permission',
        name: 'Permission',
        component: () => import('@/views/admin/permission/PermissionList.vue'),
        meta: { title: '权限管理', icon: 'Lock' }
      },
      {
        path: 'product/category',
        name: 'Category',
        component: () => import('@/views/admin/product/CategoryList.vue'),
        meta: { title: '分类管理', icon: 'Menu' }
      },
      {
        path: 'product/brand',
        name: 'Brand',
        component: () => import('@/views/admin/product/BrandList.vue'),
        meta: { title: '品牌管理', icon: 'Collection' }
      },
      {
        path: 'product/spu',
        name: 'Spu',
        component: () => import('@/views/admin/product/SpuList.vue'),
        meta: { title: '商品管理', icon: 'Goods' }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/admin/order/OrderList.vue'),
        meta: { title: '订单管理', icon: 'List' }
      }
    ]
  },
  
  // 默认重定向
  {
    path: '/',
    redirect: '/admin/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - Mall Admin` : 'Mall Admin'
  
  // 判断是否需要登录
  const requiresAuth = to.path.startsWith('/admin') && to.path !== '/admin/login'
  
  if (requiresAuth && !userStore.token) {
    // 未登录，跳转到登录页
    next('/admin/login')
  } else if (to.path === '/admin/login' && userStore.token) {
    // 已登录，跳转到首页
    next('/admin/dashboard')
  } else {
    next()
  }
})

export default router
