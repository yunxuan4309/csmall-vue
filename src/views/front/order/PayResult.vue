<template>
  <div class="pay-result-page">
    <el-card class="result-container card-clean">
      <div class="result-content" v-loading="checking">
        <div v-if="paySuccess">
          <el-result icon="success" title="支付成功" sub-title="订单已支付成功，您可以返回查看订单详情">
            <template #extra>
              <el-button type="primary" @click="goToOrders">查看订单</el-button>
              <el-button @click="$router.push('/')">返回首页</el-button>
            </template>
          </el-result>
        </div>
        <div v-else>
          <el-result icon="info" title="支付结果查询中">
            <template #extra>
              <el-button @click="checkPayStatus">重新查询</el-button>
              <el-button type="primary" @click="goToOrders">查看订单列表</el-button>
            </template>
          </el-result>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { queryPayment } from '@/api/order'

const route = useRoute()
const router = useRouter()

const checking = ref(true)
const paySuccess = ref(false)

const checkPayStatus = async () => {
  checking.value = true
  try {
    // 从支付宝 return-url 参数中获取 out_trade_no（订单SN），然后查支付状态
    // 支付宝 return-url 会附带 out_trade_no 参数
    const outTradeNo = route.query.out_trade_no
    if (!outTradeNo) {
      ElMessage.warning('未找到订单信息，请从订单列表查看支付结果')
      checking.value = false
      return
    }
    // 注意：queryPayment 接口用 orderId，但 return-url 只带有 out_trade_no (订单SN)
    // 目前简单处理：提示用户手动确认
    ElMessage.info('请返回支付页面，点击"查询支付结果"按钮确认')
    checking.value = false
  } catch (error) {
    console.error('查询支付结果失败:', error)
    checking.value = false
  }
}

const goToOrders = () => {
  router.push('/order/list')
}

onMounted(() => {
  checkPayStatus()
})
</script>

<style scoped>
.pay-result-page {
  max-width: 600px;
  margin: 40px auto;
}

.result-content {
  min-height: 200px;
}
</style>
