<template>
  <div class="seckill-list-page">
    <el-card>
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>⚡ 秒杀专区</h2>
        <p class="subtitle">限时特惠，先到先得</p>
      </div>

      <!-- 秒杀商品列表 -->
      <div v-loading="loading" class="seckill-grid">
        <el-row :gutter="20">
          <el-col
            v-for="product in productList"
            :key="product.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <el-card class="seckill-card" shadow="hover">
              <!-- 倒计时标签 -->
              <div class="time-badge">
                <template v-if="getSeckillStatus(product) === 'not_started'">
                  <el-tag type="info">即将开始</el-tag>
                  <span class="countdown">{{ getCountdown(product.startTime) }}</span>
                </template>
                <template v-else-if="getSeckillStatus(product) === 'ongoing'">
                  <el-tag type="danger">进行中</el-tag>
                  <span class="countdown">剩余 {{ getCountdown(product.endTime) }}</span>
                </template>
                <template v-else>
                  <el-tag type="info">已结束</el-tag>
                </template>
              </div>

              <!-- 商品图片 -->
              <div class="product-image" @click="goToDetail(product.id)">
                <el-image
                  :src="getFirstImage(product.pictures)"
                  fit="cover"
                  style="width: 100%; height: 200px"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              
              <!-- 商品信息 -->
              <div class="product-info">
                <h3 class="product-title" @click="goToDetail(product.id)">
                  {{ product.title }}
                </h3>
                
                <div class="price-section">
                  <div class="price-row">
                    <span class="seckill-price">¥{{ product.seckillListPrice }}</span>
                    <span class="original-price">¥{{ product.listPrice }}</span>
                  </div>
                  <div class="discount">
                    <el-tag size="small" type="danger">
                      {{ getDiscount(product.listPrice, product.seckillListPrice) }}折
                    </el-tag>
                  </div>
                </div>

                <div class="product-meta">
                  <span class="sales">已售 {{ product.sales }}</span>
                  <span class="brand">{{ product.brandName }}</span>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                  <el-button
                    v-if="getSeckillStatus(product) === 'ongoing' && product.url"
                    type="danger"
                    style="width: 100%"
                    @click="goToSeckillDetail(product.id)"
                  >
                    立即秒杀
                  </el-button>
                  <el-button
                    v-else
                    disabled
                    style="width: 100%"
                  >
                    {{ getStatusText(product) }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 空状态 -->
        <el-empty v-if="!loading && productList.length === 0" description="暂无秒杀商品" />
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchSeckillList"
          @current-change="fetchSeckillList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import { getSeckillSpuList } from '@/api/seckill'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const productList = ref([])

// 分页参数
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 定时器
let timer = null

// 获取秒杀商品列表
const fetchSeckillList = async () => {
  loading.value = true
  try {
    const res = await getSeckillSpuList({
      page: page.value,
      pageSize: pageSize.value
    })
    
    productList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取秒杀商品列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 获取秒杀状态
const getSeckillStatus = (product) => {
  const now = new Date().getTime()
  const startTime = new Date(product.startTime).getTime()
  const endTime = new Date(product.endTime).getTime()
  
  if (now < startTime) {
    return 'not_started'
  } else if (now >= startTime && now <= endTime) {
    return 'ongoing'
  } else {
    return 'ended'
  }
}

// 获取状态文本
const getStatusText = (product) => {
  const status = getSeckillStatus(product)
  if (status === 'not_started') return '即将开始'
  if (status === 'ended') return '已结束'
  return '查看详情'
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

// 获取第一张图片
const getFirstImage = (pictures) => {
  if (!pictures) return ''
  try {
    const arr = JSON.parse(pictures)
    return arr[0] || ''
  } catch {
    return pictures
  }
}

// 跳转到秒杀详情
const goToSeckillDetail = (spuId) => {
  router.push(`/seckill/${spuId}`)
}

// 跳转到普通商品详情
const goToDetail = (spuId) => {
  router.push(`/product/${spuId}`)
}

// 启动倒计时更新
const startCountdown = () => {
  timer = setInterval(() => {
    // 强制更新视图
    productList.value = [...productList.value]
  }, 1000)
}

onMounted(() => {
  fetchSeckillList()
  startCountdown()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.seckill-list-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f56c6c;
}

.page-header h2 {
  font-size: 32px;
  color: #f56c6c;
  margin: 0 0 10px 0;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.seckill-grid {
  min-height: 400px;
}

.seckill-card {
  margin-bottom: 20px;
  position: relative;
  transition: transform 0.3s;
}

.seckill-card:hover {
  transform: translateY(-5px);
}

.time-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 5px 10px;
  border-radius: 4px;
}

.countdown {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.product-info {
  padding: 10px 0;
}

.product-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  height: 42px;
  cursor: pointer;
}

.product-title:hover {
  color: #409eff;
}

.price-section {
  margin-bottom: 10px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 5px;
}

.seckill-price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: 600;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  margin-top: 15px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
