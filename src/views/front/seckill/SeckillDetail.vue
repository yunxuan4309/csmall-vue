<template>
  <div class="seckill-detail-page" v-loading="loading">
    <el-card v-if="product">
      <!-- 秒杀状态提示 -->
      <el-alert
        v-if="seckillStatus === 'not_started'"
        title="秒杀尚未开始"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          距离开始还有：<span class="countdown-highlight">{{ getCountdown(product.startTime) }}</span>
        </template>
      </el-alert>
      
      <el-alert
        v-else-if="seckillStatus === 'ongoing'"
        title="秒杀进行中"
        type="success"
        :closable="false"
        show-icon
      >
        <template #default>
          距离结束还有：<span class="countdown-highlight">{{ getCountdown(product.endTime) }}</span>
        </template>
      </el-alert>
      
      <el-alert
        v-else
        title="秒杀已结束"
        type="warning"
        :closable="false"
        show-icon
      />

      <!-- 商品信息区 -->
      <div class="product-main">
        <!-- 左侧图片 -->
        <div class="product-gallery">
          <div class="main-image">
            <el-image
              :src="currentImage"
              fit="contain"
              style="width: 100%; height: 400px"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          
          <div class="thumbnail-list">
            <div
              v-for="(img, index) in imageList"
              :key="index"
              class="thumbnail"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <el-image :src="img" fit="cover" style="width: 100%; height: 100%" />
            </div>
          </div>
        </div>

        <!-- 右侧信息 -->
        <div class="product-info">
          <h1 class="product-title">{{ product.title }}</h1>
          <p class="product-subtitle">{{ product.description }}</p>

          <div class="price-section">
            <div class="price-row">
              <span class="label">秒杀价：</span>
              <span class="seckill-price">¥{{ product.seckillListPrice }}</span>
            </div>
            <div class="original-price-row">
              <span class="label">原价：</span>
              <span class="original-price">¥{{ product.listPrice }}</span>
              <el-tag size="small" type="danger">
                {{ getDiscount(product.listPrice, product.seckillListPrice) }}折
              </el-tag>
            </div>
          </div>

          <div class="info-item">
            <span class="label">品牌：</span>
            <span>{{ product.brandName }}</span>
          </div>

          <div class="info-item">
            <span class="label">分类：</span>
            <span>{{ product.categoryName }}</span>
          </div>

          <div class="info-item">
            <span class="label">库存：</span>
            <span>{{ product.stock }} {{ product.unit }}</span>
          </div>

          <div class="info-item">
            <span class="label">时间：</span>
            <span>{{ product.startTime }} 至 {{ product.endTime }}</span>
          </div>

          <!-- 秒杀按钮 -->
          <div class="action-buttons">
            <el-button
              v-if="seckillStatus === 'ongoing' && product.url"
              type="danger"
              size="large"
              @click="showOrderDialog = true"
            >
              立即秒杀
            </el-button>
            <el-button
              v-else
              disabled
              size="large"
            >
              {{ seckillStatus === 'not_started' ? '等待开始' : '已结束' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- SKU选择 -->
      <div v-if="skuList.length > 0" class="sku-section">
        <h3>选择规格</h3>
        <div class="sku-list">
          <div
            v-for="sku in skuList"
            :key="sku.id"
            class="sku-item"
            :class="{ selected: selectedSku?.id === sku.id }"
            @click="selectSku(sku)"
          >
            <div class="sku-info">
              <p class="sku-title">{{ sku.title }}</p>
              <p class="sku-price">
                <span class="seckill-price">¥{{ sku.seckillPrice }}</span>
                <span class="original-price">¥{{ sku.price }}</span>
              </p>
              <p class="sku-stock">库存：{{ sku.stock }} | 限购：{{ sku.seckillLimit }}件</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品详情 -->
      <div class="detail-section">
        <h3>商品详情</h3>
        <div class="detail-content" v-html="pageDetail"></div>
      </div>
    </el-card>

    <!-- 提交订单对话框 -->
    <el-dialog
      v-model="showOrderDialog"
      title="确认秒杀订单"
      width="600px"
    >
      <el-form
        ref="orderFormRef"
        :model="orderForm"
        :rules="orderRules"
        label-width="100px"
      >
        <!-- 收货人信息 -->
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="orderForm.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="mobilePhone">
          <el-input v-model="orderForm.mobilePhone" placeholder="请输入11位手机号" />
        </el-form-item>

        <el-form-item label="固定电话" prop="telephone">
          <el-input v-model="orderForm.telephone" placeholder="选填" />
        </el-form-item>

        <!-- 地址信息 -->
        <el-form-item label="省份" prop="provinceName">
          <el-input v-model="orderForm.provinceName" placeholder="如：北京市" />
        </el-form-item>
        <el-form-item label="省份代码" prop="provinceCode">
          <el-input v-model="orderForm.provinceCode" placeholder="如：110000" />
        </el-form-item>

        <el-form-item label="城市" prop="cityName">
          <el-input v-model="orderForm.cityName" placeholder="如：市辖区" />
        </el-form-item>
        <el-form-item label="城市代码" prop="cityCode">
          <el-input v-model="orderForm.cityCode" placeholder="如：110100" />
        </el-form-item>

        <el-form-item label="区县" prop="districtName">
          <el-input v-model="orderForm.districtName" placeholder="如：海淀区" />
        </el-form-item>
        <el-form-item label="区县代码" prop="districtCode">
          <el-input v-model="orderForm.districtCode" placeholder="如：110103" />
        </el-form-item>

        <el-form-item label="街道" prop="streetName">
          <el-input v-model="orderForm.streetName" placeholder="请输入街道名称" />
        </el-form-item>
        <el-form-item label="街道代码" prop="streetCode">
          <el-input v-model="orderForm.streetCode" placeholder="请输入街道代码" />
        </el-form-item>

        <el-form-item label="详细地址" prop="detailedAddress">
          <el-input
            v-model="orderForm.detailedAddress"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
          />
        </el-form-item>

        <el-form-item label="地址标签" prop="tag">
          <el-input v-model="orderForm.tag" placeholder="如：公司、家" />
        </el-form-item>

        <!-- 支付信息 -->
        <el-form-item label="支付方式" prop="paymentType">
          <el-radio-group v-model="orderForm.paymentType">
            <el-radio :label="0">银联</el-radio>
            <el-radio :label="1">微信</el-radio>
            <el-radio :label="2">支付宝</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 订单金额 -->
        <el-form-item label="购买数量" prop="quantity">
          <el-input-number
            v-model="orderForm.quantity"
            :min="1"
            :max="selectedSku?.seckillLimit || 1"
          />
        </el-form-item>

        <el-form-item label="商品总价">
          <span class="price-highlight">
            ¥{{ (selectedSku?.seckillPrice * orderForm.quantity).toFixed(2) }}
          </span>
        </el-form-item>

        <el-form-item label="运费">
          <span>¥{{ orderForm.amountOfFreight.toFixed(2) }}</span>
        </el-form-item>

        <el-form-item label="优惠金额">
          <span class="discount">-¥{{ orderForm.amountOfDiscount.toFixed(2) }}</span>
        </el-form-item>

        <el-form-item label="实付金额">
          <span class="total-price">
            ¥{{ calculateActualPay().toFixed(2) }}
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showOrderDialog = false">取消</el-button>
        <el-button type="danger" @click="submitOrder" :loading="submitting">
          确认提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import {
  getSeckillSpuDetail,
  getSeckillSpuPageDetail,
  getSeckillSkuList,
  submitSeckillOrder
} from '@/api/seckill'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const product = ref(null)
const pageDetail = ref('')
const skuList = ref([])
const selectedSku = ref(null)
const currentImage = ref('')
const showOrderDialog = ref(false)
const seckillStatus = ref('not_started')

// 倒计时定时器
let timer = null

// 订单表单
const orderFormRef = ref(null)
const orderForm = ref({
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
  tag: '',
  paymentType: 1,
  amountOfOriginalPrice: 0,
  amountOfFreight: 0,
  amountOfDiscount: 0,
  amountOfActualPay: 0,
  quantity: 1
})

// 表单验证规则
const orderRules = {
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 4, message: '长度在 2 到 4 个字符', trigger: 'blur' }
  ],
  mobilePhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
  ],
  provinceName: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  provinceCode: [{ required: true, message: '请输入省份代码', trigger: 'blur' }],
  cityName: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  cityCode: [{ required: true, message: '请输入城市代码', trigger: 'blur' }],
  districtName: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  districtCode: [{ required: true, message: '请输入区县代码', trigger: 'blur' }],
  streetName: [{ required: true, message: '请输入街道', trigger: 'blur' }],
  streetCode: [{ required: true, message: '请输入街道代码', trigger: 'blur' }],
  detailedAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 图片列表
const imageList = computed(() => {
  if (!product.value?.pictures) return []
  try {
    return JSON.parse(product.value.pictures)
  } catch {
    return []
  }
})

// 获取商品详情
const fetchProductDetail = async () => {
  const spuId = route.params.id
  loading.value = true
  
  try {
    // 获取基本信息
    const detailRes = await getSeckillSpuDetail(spuId)
    product.value = detailRes.data
    
    // 设置默认图片
    if (imageList.value.length > 0) {
      currentImage.value = imageList.value[0]
    }

    // 更新秒杀状态
    updateSeckillStatus()

    // 获取详情页
    const pageRes = await getSeckillSpuPageDetail(spuId)
    pageDetail.value = pageRes.data.detail || ''

    // 获取SKU列表
    const skuRes = await getSeckillSkuList(spuId)
    skuList.value = skuRes.data || []
    
    // 默认选中第一个SKU
    if (skuList.value.length > 0) {
      selectedSku.value = skuList.value[0]
      initOrderForm()
    }
  } catch (error) {
    ElMessage.error('获取商品详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 更新秒杀状态
const updateSeckillStatus = () => {
  if (!product.value) return
  
  const now = new Date().getTime()
  const startTime = new Date(product.value.startTime).getTime()
  const endTime = new Date(product.value.endTime).getTime()
  
  if (now < startTime) {
    seckillStatus.value = 'not_started'
  } else if (now >= startTime && now <= endTime) {
    seckillStatus.value = 'ongoing'
  } else {
    seckillStatus.value = 'ended'
  }
}

// 初始化订单表单
const initOrderForm = () => {
  if (!selectedSku.value) return
  
  orderForm.value.amountOfOriginalPrice = selectedSku.value.price * orderForm.value.quantity
  orderForm.value.amountOfFreight = 0 // 根据实际情况设置
  orderForm.value.amountOfDiscount = (selectedSku.value.price - selectedSku.value.seckillPrice) * orderForm.value.quantity
}

// 计算实付金额
const calculateActualPay = () => {
  return orderForm.value.amountOfOriginalPrice + 
         orderForm.value.amountOfFreight - 
         orderForm.value.amountOfDiscount
}

// 选择SKU
const selectSku = (sku) => {
  selectedSku.value = sku
  initOrderForm()
}

// 计算倒计时
const getCountdown = (targetTime) => {
  const now = new Date().getTime()
  const target = new Date(targetTime).getTime()
  const diff = target - now
  
  if (diff <= 0) {
    return '00:00:00'
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 计算折扣
const getDiscount = (originalPrice, seckillPrice) => {
  if (!originalPrice || !seckillPrice) return 0
  const discount = (seckillPrice / originalPrice) * 10
  return discount.toFixed(1)
}

// 提交订单
const submitOrder = async () => {
  if (!orderFormRef.value) return
  
  await orderFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    if (!selectedSku.value) {
      ElMessage.warning('请选择商品规格')
      return
    }

    if (!product.value?.url) {
      ElMessage.error('秒杀链接无效')
      return
    }

    submitting.value = true
    
    try {
      // 构造订单项
      const orderData = {
        ...orderForm.value,
        amountOfActualPay: calculateActualPay(),
        'seckillOrderItemAddDTO.skuId': selectedSku.value.id,
        'seckillOrderItemAddDTO.title': selectedSku.value.title,
        'seckillOrderItemAddDTO.barCode': selectedSku.value.barCode,
        'seckillOrderItemAddDTO.data': selectedSku.value.specifications,
        'seckillOrderItemAddDTO.mainPicture': imageList.value[0] || '',
        'seckillOrderItemAddDTO.price': selectedSku.value.seckillPrice,
        'seckillOrderItemAddDTO.quantity': orderForm.value.quantity
      }

      // 提取随机码
      const randCode = product.value.url.replace('/seckill/', '')
      
      const res = await submitSeckillOrder(randCode, orderData)
      
      ElMessage.success('秒杀成功！订单号：' + res.data.sn)
      showOrderDialog.value = false
      
      // 跳转到订单详情页或订单列表
      setTimeout(() => {
        router.push('/order')
      }, 1500)
    } catch (error) {
      ElMessage.error(error.message || '秒杀失败，请重试')
      console.error(error)
    } finally {
      submitting.value = false
    }
  })
}

// 启动倒计时更新
const startCountdown = () => {
  timer = setInterval(() => {
    updateSeckillStatus()
    // 强制更新视图
    if (product.value) {
      product.value = { ...product.value }
    }
  }, 1000)
}

onMounted(() => {
  fetchProductDetail()
  startCountdown()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.seckill-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.countdown-highlight {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.product-main {
  display: flex;
  gap: 40px;
  margin-top: 20px;
  margin-bottom: 40px;
}

.product-gallery {
  flex: 0 0 450px;
}

.main-image {
  width: 100%;
  height: 400px;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 50px;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border: 2px solid #e4e7ed;
  cursor: pointer;
  transition: border-color 0.3s;
}

.thumbnail:hover,
.thumbnail.active {
  border-color: #f56c6c;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.product-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0 0 20px 0;
}

.price-section {
  padding: 20px 0;
  border-top: 2px solid #f56c6c;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.price-row,
.original-price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.seckill-price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: 600;
}

.original-price {
  font-size: 16px;
  color: #909399;
  text-decoration: line-through;
}

.label {
  display: inline-block;
  width: 80px;
  color: #909399;
  font-size: 14px;
}

.info-item {
  margin-bottom: 15px;
  font-size: 14px;
}

.action-buttons {
  margin-top: 30px;
}

.sku-section {
  margin: 40px 0;
  padding-top: 30px;
  border-top: 1px solid #e4e7ed;
}

.sku-section h3 {
  margin-bottom: 20px;
}

.sku-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.sku-item {
  padding: 15px;
  border: 2px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.sku-item:hover {
  border-color: #f56c6c;
}

.sku-item.selected {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.sku-title {
  font-size: 14px;
  margin: 0 0 10px 0;
}

.sku-price {
  margin: 0 0 5px 0;
}

.sku-stock {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.detail-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e4e7ed;
}

.detail-section h3 {
  margin-bottom: 20px;
}

.detail-content {
  line-height: 1.8;
}

.detail-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.price-highlight {
  font-size: 18px;
  color: #f56c6c;
  font-weight: 600;
}

.discount {
  color: #67c23a;
}

.total-price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: 600;
}
</style>
