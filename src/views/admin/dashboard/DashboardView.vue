<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>
    <p class="page-subtitle">欢迎回来{{ userStore.userInfo?.nickname ? '，' + userStore.userInfo.nickname : '' }}</p>

    <el-row :gutter="20" style="margin-top: 24px">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card card-clean">
          <div class="stat-content">
            <el-icon class="stat-icon" color="var(--brand-primary)"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card card-clean">
          <div class="stat-content">
            <el-icon class="stat-icon" color="var(--el-color-success)"><Goods /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.todayNewUsers }}</div>
              <div class="stat-label">今日新增用户</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card card-clean">
          <div class="stat-content">
            <el-icon class="stat-icon" color="var(--el-color-warning)"><List /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.pendingOrders }}</div>
              <div class="stat-label">待处理订单</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card card-clean">
          <div class="stat-content">
            <el-icon class="stat-icon" color="var(--el-color-danger)"><Money /></el-icon>
            <div class="stat-info">
              <div class="stat-value">¥{{ dashboard.todayRevenue || '0.00' }}</div>
              <div class="stat-label">今日销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售额趋势 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="never" class="card-clean">
          <template #header>
            <div class="card-header-row">
              <span>销售额趋势</span>
              <div style="display:flex;gap:8px;align-items:center">
                <el-date-picker
                  v-model="salesDateRange"
                  type="daterange"
                  range-separator="~"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  size="small"
                  :shortcuts="dateShortcuts"
                  @change="fetchSalesByDate"
                />
              </div>
            </div>
          </template>
          <div v-if="salesData.length" class="chart-wrap" v-loading="salesLoading" style="position:relative">
            <div v-if="tipIdx >= 0 && chartPoints[tipIdx]" class="chart-tip" :style="{ left: chartPoints[tipIdx].x / chartW * 100 + '%', top: '0' }">
              <span class="tip-date">{{ salesData[tipIdx]?.date?.slice(5) }}</span>
              <span class="tip-amount">¥{{ (salesData[tipIdx]?.amount || 0).toFixed(2) }}</span>
            </div>
            <svg :viewBox="`0 0 ${chartW} 240`" class="line-chart" preserveAspectRatio="xMidYMid meet" style="width:100%">
              <!-- Y轴网格线 -->
              <line v-for="(pct, i) in [0, 25, 50, 75, 100]" :key="'y'+i"
                :x1="55" :y1="20 + i * 45" :x2="chartW - 10" :y2="20 + i * 45"
                stroke="#e8e8e8" stroke-width="1" />
              <!-- Y轴标签 -->
              <text v-for="(pct, i) in [0, 25, 50, 75, 100]" :key="'yl'+i"
                :x="50" :y="24 + i * 45" text-anchor="end" font-size="12" fill="#999">
                ¥{{ (maxSalesAmount * (100 - i * 25) / 100).toFixed(0) }}
              </text>
              <!-- 填充区域 -->
              <polygon :points="areaPoints" fill="url(#gradient)" opacity="0.3" />
              <!-- 折线 -->
              <polyline :points="linePoints" fill="none" stroke="#409EFF" stroke-width="2.5" stroke-linejoin="round" />
              <!-- 数据点（悬停热点更大） -->
              <circle v-for="(pt, i) in chartPoints" :key="'h'+i"
                :cx="pt.x" :cy="pt.y" r="22" fill="transparent" style="cursor:pointer"
                @mouseenter="tipIdx = i" @mouseleave="tipIdx = -1" />
              <circle v-for="(pt, i) in chartPoints" :key="'c'+i"
                :cx="pt.x" :cy="pt.y" :r="tipIdx === i ? 6 : 4"
                :fill="tipIdx === i ? '#337ECC' : '#409EFF'"
                stroke="white" stroke-width="2" style="transition: r 0.15s" />
              <!-- X轴日期标签 -->
              <text v-for="(pt, i) in chartPoints" :key="'x'+i"
                :x="pt.x" :y="228" text-anchor="middle" font-size="11" fill="#666"
                v-if="showXLabel(i)">
                {{ (salesData[i]?.date || '').slice(5) }}
              </text>
            </svg>
            <!-- 渐变定义 -->
            <svg width="0" height="0"><defs><linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#409EFF" /><stop offset="100%" stop-color="#409EFF" stop-opacity="0" /></linearGradient></defs></svg>
          </div>
          <el-empty v-else description="暂无销售数据" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 周销售额趋势(备用) -->
    <el-row v-if="false" :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="never" class="card-clean">
          <template #header>
            <span>近 7 天销售额</span>
          </template>
          <div v-if="dashboard.weeklyTrend && dashboard.weeklyTrend.length" class="weekly-trend">
            <div v-for="(day, i) in dashboard.weeklyTrend" :key="i" class="trend-bar-row">
              <span class="trend-date">{{ day.date }}</span>
              <div class="trend-bar-wrap">
                <div class="trend-bar" :style="{ width: day.amount / maxTrendAmount * 100 + '%' }"></div>
              </div>
              <span class="trend-amount">¥{{ day.amount?.toFixed(2) || '0.00' }}</span>
            </div>
          </div>
          <el-empty v-else description="暂无销售数据" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 近期订单 + 快捷操作 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :md="14">
        <el-card shadow="never" class="card-clean">
          <template #header>
            <div class="card-header-row">
              <span>近期订单</span>
              <el-button size="small" text @click="$router.push('/admin/order')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentOrders" size="small" v-loading="orderLoading" stripe>
            <el-table-column prop="sn" label="订单号" width="150" />
            <el-table-column prop="contactName" label="客户" width="100" />
            <el-table-column label="金额" width="100">
              <template #default="{ row }">¥{{ row.amountOfActualPay }}</template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="(['warning','info','info','primary','success','danger','warning','info'])[row.state]||'info'" size="small">
                  {{ (['未付','关闭','取消','已付','签收','拒收','退款中','退款'])[row.state] || '未知' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="gmtCreate" label="时间" width="160" />
          </el-table>
          <el-empty v-if="!orderLoading && recentOrders.length === 0" description="暂无订单" :image-size="60" />
        </el-card>
      </el-col>

      <el-col :xs="24" :md="10">
        <el-card shadow="never" class="card-clean">
          <template #header><span>快捷操作</span></template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/admin/product/spu')">添加商品</el-button>
            <el-button type="success" @click="$router.push('/admin/order')">查看订单</el-button>
            <el-button type="warning" @click="$router.push('/admin/admin-user')">管理用户</el-button>
            <el-button type="info" @click="$router.push('/admin/role')">角色设置</el-button>
          </div>
          <el-divider />
          <div class="system-info">
            <p><strong>当前用户：</strong>{{ userStore.userInfo?.nickname || '管理员' }}</p>
            <p><strong>登录时间：</strong>{{ currentTime }}</p>
            <p><strong>系统版本：</strong>v1.0.0</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { User, Goods, List, Money } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import { getDashboard } from '@/api/sso'
import { getOrderList, getSalesByDate } from '@/api/order'

const userStore = useUserStore()
const currentTime = ref(formatDate(new Date()))

const dashboard = ref({
  totalUsers: 0,
  todayNewUsers: 0,
  todayOrders: 0,
  todayRevenue: 0,
  pendingOrders: 0,
  weeklyTrend: []
})

const recentOrders = ref([])
const orderLoading = ref(false)
const salesData = ref([])
const salesLoading = ref(false)
const salesDateRange = ref([])
const tipIdx = ref(-1)

const dateShortcuts = [
  { text: '最近一周', value: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 7); return [s, e] } },
  { text: '最近一月', value: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth() - 1); return [s, e] } },
  { text: '最近三月', value: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth() - 3); return [s, e] } }
]

const maxSalesAmount = computed(() => {
  if (!salesData.value.length) return 1
  return Math.max(...salesData.value.map(d => d.amount || 0), 1)
})

const chartW = 800
const chLeft = 58, chRight = 15, chTop = 20, chBottom = 30
const chartInnerW = computed(() => chartW - chLeft - chRight)
const chartInnerH = 180

const chartPoints = computed(() => {
  if (!salesData.value.length) return []
  const max = maxSalesAmount.value
  return salesData.value.map((d, i) => ({
    x: chLeft + (salesData.value.length === 1 ? chartInnerW.value / 2 : i / (salesData.value.length - 1) * chartInnerW.value),
    y: chTop + chartInnerH - ((d.amount || 0) / max * chartInnerH)
  }))
})

const showXLabel = (i) => {
  const len = salesData.value.length
  if (len <= 10) return true
  if (len <= 31) return i % 2 === 0 || i === len - 1
  return i % 7 === 0 || i === len - 1
}

const linePoints = computed(() => chartPoints.value.map(p => `${p.x},${p.y}`).join(' '))

const areaPoints = computed(() => {
  if (!chartPoints.value.length) return ''
  const first = chartPoints.value[0]
  const last = chartPoints.value[chartPoints.value.length - 1]
  const yb = chTop + chartInnerH
  return `${first.x},${yb} ` + chartPoints.value.map(p => `${p.x},${p.y}`).join(' ') + ` ${last.x},${yb}`
})

const fetchSalesByDate = async () => {
  if (!salesDateRange.value || salesDateRange.value.length !== 2) return
  salesLoading.value = true
  try {
    const res = await getSalesByDate(salesDateRange.value[0], salesDateRange.value[1])
    salesData.value = padSalesData(salesDateRange.value[0], salesDateRange.value[1], res.data || [])
  } catch (e) {
    console.error('获取销售额失败', e)
  } finally {
    salesLoading.value = false
  }
}

// 补全缺失日期为0值
const padSalesData = (start, end, data) => {
  const map = {}
  data.forEach(d => { map[d.date] = d.amount || 0 })
  const result = []
  const s = new Date(start)
  const e = new Date(end)
  while (s <= e) {
    const ds = s.toISOString().split('T')[0]
    result.push({ date: ds, amount: map[ds] || 0 })
    s.setDate(s.getDate() + 1)
  }
  return result
}

const fetchDashboard = async () => {
  try {
    const res = await getDashboard()
    if (res.data) {
      dashboard.value = res.data
    }
  } catch (e) {
    console.error('获取仪表盘数据失败', e)
  }
}

const fetchRecentOrders = async () => {
  orderLoading.value = true
  try {
    const res = await getOrderList({ page: 1, pageSize: 5 })
    recentOrders.value = (res.data.list || res.data.records || []).slice(0, 5)
  } catch (e) {
    console.error('获取近期订单失败', e)
  } finally {
    orderLoading.value = false
  }
}

onMounted(() => {
  if (!userStore.userInfo) {
    userStore.fetchUserInfo()
  }
  fetchDashboard()
  fetchRecentOrders()
  // 默认加载最近7天
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 7)
  salesDateRange.value = [formatDate(start, 'YYYY-MM-DD'), formatDate(end, 'YYYY-MM-DD')]
  fetchSalesByDate()
})
</script>

<style scoped>
.dashboard h2 {
  margin: 0;
}

.stat-card {
  cursor: default;
  transition: all var(--transition-fast, 0.2s);
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--brand-text, #333);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--brand-text-secondary, #999);
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.system-info p {
  margin: 10px 0;
  color: var(--brand-text-secondary, #606266);
  line-height: 1.6;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-wrap {
  min-height: 200px;
  width: 100%;
  overflow: hidden;
  margin: -10px 0;
}

.line-chart {
  width: 100%;
  display: block;
}

.chart-tip {
  position: absolute;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.75);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.tip-date { opacity: 0.8; }
.tip-amount { font-weight: 600; }

@media (max-width: 767px) {
  .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  .el-row .el-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
    flex: 0 0 50%;
    max-width: 50%;
    margin-bottom: 10px;
  }
  .el-row .el-col:last-child:nth-child(odd) {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .stat-icon {
    font-size: 32px;
  }
  .stat-value {
    font-size: 18px;
  }
  .quick-actions {
    flex-direction: column;
  }
  .quick-actions .el-button {
    width: 100%;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .el-row .el-col {
    flex: 0 0 50%;
    max-width: 50%;
    margin-bottom: 16px;
  }
}
</style>
