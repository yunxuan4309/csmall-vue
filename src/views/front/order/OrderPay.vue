<template>
  <div class="order-pay-page" v-loading="loading">
    <el-card class="pay-container">
      <template #header>
        <div class="header-content">
          <h3>订单支付</h3>
          <el-button link @click="$router.back()">返回</el-button>
        </div>
      </template>

      <!-- 订单信息 -->
      <div class="order-info" v-if="orderDetail">
        <div class="info-row">
          <span class="label">订单编号：</span>
          <span class="value">{{ orderDetail.sn }}</span>
        </div>
        <div class="info-row">
          <span class="label">下单时间：</span>
          <span class="value">{{ orderDetail.gmtOrder }}</span>
        </div>
        <div class="info-row">
          <span class="label">订单状态：</span>
          <el-tag :type="getStateType(orderDetail.state)">{{ getStateText(orderDetail.state) }}</el-tag>
        </div>
      </div>

      <!-- 支付金额 -->
      <div class="pay-amount-section">
        <div class="amount-label">应付金额</div>
        <div class="amount-value">¥{{ orderDetail?.amountOfActualPay || '0.00' }}</div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-section">
        <h4>选择支付方式</h4>
        <el-radio-group v-model="selectedPaymentType" class="payment-options">
          <el-radio :value="1" class="payment-option">
            <div class="option-content">
              <el-icon :size="24" color="#07c160"><Wallet /></el-icon>
              <span>微信支付</span>
            </div>
          </el-radio>
          <el-radio :value="2" class="payment-option">
            <div class="option-content">
              <el-icon :size="24" color="#1677ff"><Money /></el-icon>
              <span>支付宝</span>
            </div>
          </el-radio>
          <el-radio :value="0" class="payment-option">
            <div class="option-content">
              <el-icon :size="24" color="#ff6b6b"><CreditCard /></el-icon>
              <span>银联支付</span>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 支付按钮 -->
      <div class="pay-action">
        <el-button 
          type="primary" 
          size="large" 
          :loading="paying"
          :disabled="!canPay"
          class="pay-btn"
          @click="handlePay"
        >
          确认支付 ¥{{ orderDetail?.amountOfActualPay || '0.00' }}
        </el-button>
        <el-button 
          size="large" 
          @click="$router.back()"
          :disabled="paying"
        >
          取消
        </el-button>
      </div>

      <!-- 提示信息 -->
      <el-alert
        v-if="orderDetail && orderDetail.state !== 0"
        :title="`当前订单${getStateText(orderDetail.state)}，无需支付`"
        type="warning"
        :closable="false"
        style="margin-top: 20px"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Wallet, Money, CreditCard } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderDetail, payOrder } from '@/api/order'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const paying = ref(false)
const orderDetail = ref(null)
const selectedPaymentType = ref(1)

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

// 是否可以支付
const canPay = computed(() => {
  return orderDetail.value && orderDetail.value.state === 0 && !paying.value
})

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
    
    // 如果订单已有支付方式，默认选中
    if (orderDetail.value.paymentType !== undefined) {
      selectedPaymentType.value = orderDetail.value.paymentType
    }
    
    // 如果订单已支付或已取消，提示用户
    if (orderDetail.value.state !== 0) {
      ElMessage.warning(`订单${getStateText(orderDetail.value.state)}`)
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 处理支付
const handlePay = async () => {
  if (!orderDetail.value) return
  
  // 确认支付
  try {
    await ElMessageBox.confirm(
      `确认使用${getPaymentText(selectedPaymentType.value)}支付 ¥${orderDetail.value.amountOfActualPay}？`,
      '确认支付',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  paying.value = true
  try {
    const res = await payOrder({
      id: orderDetail.value.id,
      paymentType: selectedPaymentType.value
    })
    
    ElMessage.success('支付成功！')
    
    // 跳转到订单详情页
    setTimeout(() => {
      router.replace({
        path: '/order/detail',
        query: { id: orderDetail.value.id }
      })
    }, 1500)
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.error(error.message || '支付失败，请重试')
  } finally {
    paying.value = false
  }
}

// 获取支付方式文本
const getPaymentText = (type) => {
  const map = { 0: '银联', 1: '微信', 2: '支付宝' }
  return map[type] || '未知'
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-pay-page {
  max-width: 800px;
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

.order-info {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #606266;
  width: 80px;
}

.value {
  color: #303133;
  font-weight: 500;
}

.pay-amount-section {
  text-align: center;
  padding: 30px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 30px;
}

.amount-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.amount-value {
  font-size: 48px;
  color: #f56c6c;
  font-weight: bold;
}

.payment-section {
  margin-bottom: 30px;
}

.payment-section h4 {
  margin-bottom: 20px;
  font-size: 16px;
  color: #303133;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.payment-option {
  margin-right: 0;
}

.payment-option :deep(.el-radio__label) {
  padding-left: 15px;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.option-content span {
  font-size: 16px;
  color: #303133;
}

.pay-action {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.pay-btn {
  min-width: 200px;
}

@media (max-width: 767px) {
  .amount-value {
    font-size: 36px;
  }
  .pay-amount-section {
    padding: 20px 0;
    margin-bottom: 16px;
  }
  .order-info {
    padding: 12px;
    margin-bottom: 16px;
  }
  .pay-action {
    flex-direction: column;
    gap: 10px;
  }
  .pay-action .el-button {
    width: 100%;
  }
  .pay-btn {
    min-width: auto;
  }
  .label {
    width: auto;
    flex-shrink: 0;
  }
}
</style>
