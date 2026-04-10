import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useFrontUserStore } from '@/store/frontUser'

const routes = [
  // 前台路由
  {
    path: '/',
    component: () => import('@/views/front/layout/FrontLayout.vue'),
    redirect: '/products',
    children: [
      {
        path: 'products',
        name: 'ProductList',
        component: () => import('@/views/front/product/ProductList.vue'),
        meta: { title: '商品列表' }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/front/product/ProductDetail.vue'),
        meta: { title: '商品详情' }
      },
      {
        path: 'seckill',
        name: 'SeckillList',
        component: () => import('@/views/front/seckill/SeckillList.vue'),
        meta: { title: '秒杀专区' }
      },
      {
        path: 'seckill/:id',
        name: 'SeckillDetail',
        component: () => import('@/views/front/seckill/SeckillDetail.vue'),
        meta: { title: '秒杀详情' }
      },
      {
        path: 'user/profile',
        name: 'UserProfile',
        component: () => import('@/views/front/user/UserProfile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      }
    ]
  },
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
  
  // 默认重定向到前台商品列表
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const frontUserStore = useFrontUserStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - Mall` : 'Mall'
  
  // 判断是否需要登录（后台管理）
  const requiresAdminAuth = to.path.startsWith('/admin') && to.path !== '/admin/login'
  
  // 判断是否需要登录（前台）
  const requiresFrontAuth = to.meta.requiresAuth === true
  
  if (requiresAdminAuth && !userStore.token) {
    // 后台未登录，跳转到登录页
    next('/admin/login')
  } else if (to.path === '/admin/login' && userStore.token) {
    // 后台已登录，跳转到首页
    next('/admin/dashboard')
  } else if (requiresFrontAuth && !frontUserStore.token) {
    // 前台需要登录但未登录
    next('/login')
  } else {
    next()
  }
})

export default router
