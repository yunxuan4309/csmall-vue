<template>
  <div class="order-detail-page" v-loading="loading">
    <el-card v-if="orderDetail">
      <template #header>
        <div class="header-content">
          <h3>订单详情</h3>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <!-- 订单状态 -->
      <div class="status-section">
        <el-steps :active="getStepActive(orderDetail.state)" align-center>
          <el-step title="提交订单" :description="orderDetail.gmtOrder" />
          <el-step title="已支付" :description="orderDetail.gmtPay || '待支付'" />
          <el-step title="已签收" description="完成" />
        </el-steps>
        <div class="status-text">
          当前状态：<el-tag :type="getStateType(orderDetail.state)">{{ getStateText(orderDetail.state) }}</el-tag>
        </div>
      </div>

      <!-- 收货地址 -->
      <div class="info-section">
        <h4>收货信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="联系人">{{ orderDetail.contactName }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ orderDetail.mobilePhone }}</el-descriptions-item>
          <el-descriptions-item label="固定电话" v-if="orderDetail.telephone">{{ orderDetail.telephone }}</el-descriptions-item>
          <el-descriptions-item label="标签" v-if="orderDetail.tag">{{ orderDetail.tag }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ orderDetail.provinceName }}{{ orderDetail.cityName }}{{ orderDetail.districtName }}{{ orderDetail.streetName }}{{ orderDetail.detailedAddress }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 商品信息 -->
      <div class="info-section">
        <h4>商品信息</h4>
        <div class="goods-list">
          <div v-for="item in orderDetail.orderItems" :key="item.id" class="goods-item">
            <el-image 
              :src="item.mainPicture || 'https://via.placeholder.com/80'" 
              fit="cover"
              class="goods-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="goods-info">
              <div class="goods-title">{{ item.title }}</div>
              <div class="goods-specs" v-if="item.data">{{ parseSpecs(item.data) }}</div>
              <div class="goods-price-qty">
                <span class="price">¥{{ item.price }}</span>
                <span class="qty">x{{ item.quantity }}</span>
              </div>
            </div>
            <div class="goods-subtotal">
              ¥{{ (item.price * item.quantity).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="info-section">
        <h4>订单信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ orderDetail.sn }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ getPaymentText(orderDetail.paymentType) }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ orderDetail.gmtOrder }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ orderDetail.gmtPay || '-' }}</el-descriptions-item>
          <el-descriptions-item label="商品总额">¥{{ orderDetail.amountOfOriginalPrice }}</el-descriptions-item>
          <el-descriptions-item label="运费">¥{{ orderDetail.amountOfFreight }}</el-descriptions-item>
          <el-descriptions-item label="优惠金额">-¥{{ orderDetail.amountOfDiscount }}</el-descriptions-item>
          <el-descriptions-item label="积分">{{ orderDetail.rewardPoint || 0 }}</el-descriptions-item>
          <el-descriptions-item label="实付金额" :span="2">
            <span class="actual-pay">¥{{ orderDetail.amountOfActualPay }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button 
          v-if="orderDetail.state === 0" 
          type="danger"
          @click="cancelOrder"
        >
          取消订单
        </el-button>
        <el-button 
          v-if="orderDetail.state === 3" 
          type="primary"
          @click="confirmReceive"
        >
          确认收货
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderDetail, cancelOrder as apiCancelOrder, confirmReceive as apiConfirmReceive } from '@/api/order'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const orderDetail = ref(null)

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

const paymentMap = {
  0: '银联',
  1: '微信',
  2: '支付宝'
}

const getStateText = (state) => stateMap[state] || '未知'
const getStateType = (state) => stateTypeMap[state] || ''
const getPaymentText = (type) => paymentMap[type] || '未知'

// 获取步骤进度
const getStepActive = (state) => {
  if (state === 0) return 1
  if ([1, 2].includes(state)) return 1
  if (state === 3) return 2
  if (state >= 4) return 3
  return 1
}

// 解析规格JSON
const parseSpecs = (dataStr) => {
  try {
    const specs = JSON.parse(dataStr)
    return specs.map(s => `${s.name}:${s.value}`).join(', ')
  } catch {
    return dataStr
  }
}

// 获取订单详情
const fetchOrderDetail = async () => {
  const orderId = route.query.id
  if (!orderId) {
    ElMessage.error('订单ID不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    const res = await getOrderDetail(orderId)
    orderDetail.value = res.data
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 取消订单
const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await apiCancelOrder(orderDetail.value.id)
    ElMessage.success('订单已取消')
    fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 确认收货
const confirmReceive = async () => {
  try {
    await ElMessageBox.confirm('确认已收到货物？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    
    await apiConfirmReceive(orderDetail.value.id)
    ElMessage.success('确认收货成功')
    fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败')
    }
  }
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h3 {
  margin: 0;
  font-size: 20px;
}

.status-section {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 30px;
}

.status-text {
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
}

.info-section {
  margin-bottom: 30px;
}

.info-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #303133;
  border-left: 3px solid #409eff;
  padding-left: 10px;
}

.goods-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  margin-right: 15px;
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

.goods-info {
  flex: 1;
}

.goods-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-specs {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.goods-price-qty {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.goods-price-qty .price {
  color: #f56c6c;
  font-weight: 600;
}

.goods-price-qty .qty {
  color: #909399;
}

.goods-subtotal {
  width: 120px;
  text-align: right;
  font-size: 16px;
  color: #f56c6c;
  font-weight: 600;
}

.actual-pay {
  font-size: 20px;
  color: #f56c6c;
  font-weight: 600;
}

.action-section {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
