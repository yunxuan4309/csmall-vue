<template>
  <div class="order-settle-page" v-loading="loading">
    <el-card class="settle-container">
      <template #header>
        <h3>确认订单</h3>
      </template>

      <!-- 收货地址 -->
      <div class="address-section">
        <h4>收货地址</h4>
        <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="联系人" prop="contactName">
                <el-input v-model="addressForm.contactName" placeholder="请输入联系人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="手机号" prop="mobilePhone">
                <el-input v-model="addressForm.mobilePhone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="固定电话" prop="telephone">
                <el-input v-model="addressForm.telephone" placeholder="可选" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="省" prop="provinceName">
                <el-input v-model="addressForm.provinceName" placeholder="如：北京市" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="市" prop="cityName">
                <el-input v-model="addressForm.cityName" placeholder="如：市辖区" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="区" prop="districtName">
                <el-input v-model="addressForm.districtName" placeholder="如：海淀区" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="街道" prop="streetName">
                <el-input v-model="addressForm.streetName" placeholder="如：中关村街道" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="详细地址" prop="detailedAddress">
            <el-input v-model="addressForm.detailedAddress" type="textarea" :rows="2" placeholder="请输入详细地址" />
          </el-form-item>

          <el-form-item label="标签">
            <el-radio-group v-model="addressForm.tag">
              <el-radio label="家">家</el-radio>
              <el-radio label="公司">公司</el-radio>
              <el-radio label="学校">学校</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 商品清单 -->
      <div class="goods-section">
        <h4>商品清单</h4>
        <div class="goods-list">
          <div v-for="item in orderItems" :key="item.skuId" class="goods-item">
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

      <!-- 支付方式 -->
      <div class="payment-section">
        <h4>支付方式</h4>
        <el-radio-group v-model="paymentType">
          <el-radio :label="1">微信支付</el-radio>
          <el-radio :label="2">支付宝</el-radio>
          <el-radio :label="0">银联</el-radio>
        </el-radio-group>
      </div>

      <!-- 金额明细 -->
      <div class="amount-section">
        <div class="amount-row">
          <span>商品总额</span>
          <span>¥{{ totalPrice }}</span>
        </div>
        <div class="amount-row">
          <span>运费</span>
          <span>¥{{ freight.toFixed(2) }}</span>
        </div>
        <div class="amount-row">
          <span>优惠</span>
          <span>-¥{{ discount.toFixed(2) }}</span>
        </div>
        <el-divider />
        <div class="amount-row total">
          <span>实付金额</span>
          <span class="price">¥{{ actualPay }}</span>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <el-button size="large" @click="$router.back()">返回</el-button>
        <el-button 
          type="primary" 
          size="large" 
          :loading="submitting"
          @click="handleSubmitOrder"
        >
          提交订单
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/store/cart'
import { createOrder } from '@/api/order'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)
const submitting = ref(false)
const addressFormRef = ref(null)

// 收货地址表单
const addressForm = ref({
  contactName: '',
  mobilePhone: '',
  telephone: '',
  provinceCode: '',
  provinceName: '',
  cityCode: '',
  cityName: '',
  districtCode: '',
  districtName: '',
  streetCode: '',
  streetName: '',
  detailedAddress: '',
  tag: '家'
})

// 表单验证规则
const addressRules = {
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  mobilePhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  provinceName: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  cityName: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  districtName: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  streetName: [{ required: true, message: '请输入街道', trigger: 'blur' }],
  detailedAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 订单商品列表
const orderItems = ref([])

// 支付方式
const paymentType = ref(1)

// 运费和优惠
const freight = ref(0)
const discount = ref(0)

// 解析规格JSON
const parseSpecs = (dataStr) => {
  try {
    const specs = JSON.parse(dataStr)
    return specs.map(s => `${s.name}:${s.value}`).join(', ')
  } catch {
    return dataStr
  }
}

// 商品总价
const totalPrice = computed(() => {
  return orderItems.value
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)
})

// 实付金额
const actualPay = computed(() => {
  return (parseFloat(totalPrice.value) + freight.value - discount.value).toFixed(2)
})

// 提交订单
const handleSubmitOrder = async () => {
  if (!addressFormRef.value) return
  
  await addressFormRef.value.validate(async (valid) => {
    if (valid) {
      if (orderItems.value.length === 0) {
        ElMessage.warning('请选择商品')
        return
      }

      submitting.value = true
      try {
        const orderData = {
          ...addressForm.value,
          paymentType: paymentType.value,
          amountOfOriginalPrice: parseFloat(totalPrice.value),
          amountOfFreight: freight.value,
          amountOfDiscount: discount.value,
          orderItems: orderItems.value.map(item => ({
            skuId: item.skuId,
            title: item.title,
            barCode: item.barCode || '',
            data: item.data || '[]',
            mainPicture: item.mainPicture,
            price: item.price,
            quantity: item.quantity
          }))
        }

        const res = await createOrder(orderData)
        
        ElMessage.success('订单提交成功')
        
        // 跳转到订单详情或支付页面
        setTimeout(() => {
          router.replace({
            path: '/order/detail',
            query: { id: res.data.id }
          })
        }, 1500)
      } catch (error) {
        console.error('下单失败:', error)
        ElMessage.error(error.message || '下单失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 加载数据
onMounted(async () => {
  loading.value = true
  try {
    // 从购物车获取选中商品
    const cartIds = route.query.cartIds?.split(',') || []
    
    if (cartIds.length > 0) {
      // 获取购物车列表并筛选选中的商品
      await cartStore.fetchCartList()
      orderItems.value = cartStore.cartItems.filter(
        item => cartIds.includes(String(item.id))
      )
      
      if (orderItems.value.length === 0) {
        ElMessage.warning('未找到选中的商品')
        router.back()
        return
      }
    } else {
      ElMessage.warning('请选择要结算的商品')
      router.back()
      return
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.order-settle-page {
  max-width: 1200px;
  margin: 0 auto;
}

.settle-container {
  margin-bottom: 20px;
}

.settle-container h3 {
  margin: 0;
  font-size: 20px;
}

.address-section,
.goods-section,
.payment-section,
.amount-section {
  margin-bottom: 30px;
}

.address-section h4,
.goods-section h4,
.payment-section h4 {
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

.payment-section {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.amount-section {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.amount-row.total {
  font-size: 18px;
  font-weight: 600;
}

.amount-row.total .price {
  font-size: 24px;
  color: #f56c6c;
}

.submit-section {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
