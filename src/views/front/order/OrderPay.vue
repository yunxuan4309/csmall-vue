<template>
  <div class="order-pay-page" v-loading="loading">
    <el-card class="pay-container card-clean">
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
          <el-radio :value="1" disabled class="payment-option">
            <div class="option-content">
              <el-icon :size="24" color="#07c160"><Wallet /></el-icon>
              <span>微信支付 <el-tag size="small" type="info">未开放</el-tag></span>
            </div>
          </el-radio>
          <el-radio :value="2" class="payment-option">
            <div class="option-content">
              <el-icon :size="24" color="#1677ff"><Money /></el-icon>
              <span>支付宝</span>
            </div>
          </el-radio>
          <el-radio :value="0" class="payment-option" disabled>
            <div class="option-content">
              <el-icon :size="24" color="#ff6b6b"><CreditCard /></el-icon>
              <span>银联支付 <el-tag size="small" type="info">未开放</el-tag></span>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 扫码支付二维码 -->
      <div v-if="showQrCode" class="qr-code-section">
        <h4>请使用沙箱版支付宝APP扫码付款</h4>
        <img
          :src="'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(qrCodeUrl)"
          alt="支付二维码"
          class="qr-image"
        />
        <p class="qr-hint">打开沙箱版支付宝 → 扫一扫 → 确认付款</p>
        <p class="qr-amount">应付：<strong>¥{{ orderDetail?.amountOfActualPay || '0.00' }}</strong></p>
        <el-button type="success" size="large" :loading="checking" @click="checkPaymentStatus">
          已完成付款，查询结果
        </el-button>
      </div>

      <!-- 支付中提示 -->
      <el-alert
        v-if="showPaymentCheck"
        title="请在新打开的窗口中完成付款，付款完成后点击下方按钮确认结果"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      />

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
          v-if="showPaymentCheck"
          type="success"
          size="large"
          :loading="checking"
          @click="checkPaymentStatus"
        >
          已完成付款，查询结果
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
import { getOrderDetail, payOrder, queryPayment } from '@/api/order'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const paying = ref(false)
const checking = ref(false)
const showPaymentCheck = ref(false)
const showQrCode = ref(false)
const qrCodeUrl = ref('')
const orderDetail = ref(null)
const selectedPaymentType = ref(2)

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

    // 如果返回了支付表单（电脑网站支付），直接渲染到当前页面
    if (res.data && res.data.paymentForm) {
      document.write(res.data.paymentForm)
      document.close()
      return
    }

    // 如果返回了支付链接（支付宝扫码支付），显示二维码
    if (res.data && res.data.paymentUrl) {
      qrCodeUrl.value = res.data.paymentUrl
      showQrCode.value = true
      ElMessage.success('请使用沙箱版支付宝APP扫描二维码付款')
      return
    }

    // 无表单无链接 = 直接支付成功（银联模拟等）
    ElMessage.success('支付成功！')
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

// 主动查询支付状态
const checkPaymentStatus = async () => {
  checking.value = true
  try {
    const res = await queryPayment({
      id: orderDetail.value.id,
      paymentType: selectedPaymentType.value
    })
    if (res.data && res.data.state === 3) {
      ElMessage.success('支付成功！')
      showPaymentCheck.value = false
      router.replace({
        path: '/order/detail',
        query: { id: orderDetail.value.id }
      })
    } else {
      ElMessage.warning('订单尚未支付，请在新窗口中完成付款后点击此处')
    }
  } catch (error) {
    console.error('查询支付状态失败:', error)
    ElMessage.error('查询支付状态失败')
  } finally {
    checking.value = false
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
  color: var(--brand-primary, #4a6cf7);
  font-weight: 700;
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

.qr-code-section {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.qr-code-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #303133;
}

.qr-image {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}

.qr-hint {
  margin-top: 12px;
  color: #909399;
  font-size: 13px;
}

.qr-amount {
  margin: 8px 0 16px;
  color: var(--brand-primary, #4a6cf7);
  font-size: 18px;
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
