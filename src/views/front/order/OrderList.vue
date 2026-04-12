<template>
  <div class="order-list-page">
    <el-card>
      <template #header>
        <h3>我的订单</h3>
      </template>

      <!-- 订单状态Tab -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待付款" name="0" />
        <el-tab-pane label="已关闭" name="1" />
        <el-tab-pane label="已取消" name="2" />
        <el-tab-pane label="已支付" name="3" />
        <el-tab-pane label="已签收" name="4" />
      </el-tabs>

      <!-- 订单列表 -->
      <div class="order-list" v-loading="loading">
        <div v-for="order in orderList" :key="order.id" class="order-card">
          <!-- 订单头部 -->
          <div class="order-header">
            <span class="order-sn">订单号: {{ order.sn }}</span>
            <span class="order-time">{{ order.gmtOrder }}</span>
            <el-tag :type="getStateType(order.state)">{{ getStateText(order.state) }}</el-tag>
          </div>

          <!-- 订单商品 -->
          <div class="order-items">
            <div v-for="item in order.orderItems" :key="item.id" class="order-item">
              <el-image 
                :src="item.mainPicture || 'https://via.placeholder.com/60'" 
                fit="cover"
                class="item-image"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="item-info">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-price-qty">
                  <span class="price">¥{{ item.price }}</span>
                  <span class="qty">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 订单底部 -->
          <div class="order-footer">
            <div class="order-total">
              共{{ getTotalQuantity(order) }}件 实付: 
              <span class="price">¥{{ order.amountOfActualPay }}</span>
            </div>
            <div class="order-actions">
              <el-button size="small" @click="viewDetail(order.id)">查看详情</el-button>
              <el-button 
                v-if="order.state === 0" 
                type="danger" 
                size="small"
                @click="cancelOrder(order.id)"
              >
                取消订单
              </el-button>
              <el-button 
                v-if="order.state === 3" 
                type="primary" 
                size="small"
                @click="confirmReceive(order.id)"
              >
                确认收货
              </el-button>
              <el-button 
                v-if="[1, 2, 4, 5, 7].includes(order.state)" 
                type="danger" 
                size="small"
                link
                @click="deleteOrderItem(order.id)"
              >
                删除订单
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!loading && orderList.length === 0" description="暂无订单">
          <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchOrders"
        @current-change="fetchOrders"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, cancelOrder as apiCancelOrder, confirmReceive as apiConfirmReceive, deleteOrder as apiDeleteOrder } from '@/api/order'

const router = useRouter()

const loading = ref(false)
const activeTab = ref('all')
const orderList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 订单状态映射
const stateMap = {
  0: '待付款',
  1: '已关闭',
  2: '已取消',
  3: '已支付',
  4: '已签收',
  5: '已拒收',
  6: '退款处理中',
  7: '已退款'
}

const stateTypeMap = {
  0: 'warning',
  1: 'info',
  2: 'info',
  3: 'success',
  4: 'success',
  5: 'danger',
  6: 'warning',
  7: 'info'
}

const getStateText = (state) => stateMap[state] || '未知'
const getStateType = (state) => stateTypeMap[state] || ''

// 获取订单数量
const getTotalQuantity = (order) => {
  return order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
}

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 如果不是全部，添加状态筛选
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    
    const res = await getOrderList(params)
    orderList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取订单失败:', error)
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

// Tab切换
const handleTabChange = () => {
  currentPage.value = 1
  fetchOrders()
}

// 查看详情
const viewDetail = (orderId) => {
  router.push({
    path: '/order/detail',
    query: { id: orderId }
  })
}

// 取消订单
const cancelOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await apiCancelOrder(orderId)
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 确认收货
const confirmReceive = async (orderId) => {
  try {
    await ElMessageBox.confirm('确认已收到货物？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    
    await apiConfirmReceive(orderId)
    ElMessage.success('确认收货成功')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败')
    }
  }
}

// 删除订单
const deleteOrderItem = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await apiDeleteOrder(orderId)
    ElMessage.success('订单已删除')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单失败:', error)
      ElMessage.error('删除订单失败')
    }
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-list-page {
  max-width: 1200px;
  margin: 0 auto;
}

.order-list-page h3 {
  margin: 0;
  font-size: 20px;
}

.order-list {
  min-height: 300px;
}

.order-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 15px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.order-sn {
  font-size: 13px;
  color: #606266;
}

.order-time {
  font-size: 13px;
  color: #909399;
}

.order-items {
  padding: 15px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 12px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price-qty {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.item-price-qty .price {
  color: #f56c6c;
  font-weight: 600;
}

.item-price-qty .qty {
  color: #909399;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #fafafa;
  border-top: 1px solid #ebeef5;
}

.order-total {
  font-size: 14px;
  color: #606266;
}

.order-total .price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: 600;
}

.order-actions {
  display: flex;
  gap: 10px;
}
</style>
