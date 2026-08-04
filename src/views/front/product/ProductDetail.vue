<template>
  <div class="product-detail-page" v-loading="loading">
    <el-card v-if="product">
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
            <span class="label">价格：</span>
            <span class="price">¥{{ product.listPrice }}</span>
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
            <span class="label">销量：</span>
            <span>{{ product.sales }}</span>
          </div>

          <div class="info-item">
            <span class="label">标签：</span>
            <el-tag v-for="tag in tagList" :key="tag" size="small">{{ tag }}</el-tag>
          </div>

          <div class="action-buttons">
            <el-button type="primary" size="large" :disabled="btnLocked" @click="withLock(handleAddToCart)()">
              加入购物车
            </el-button>
            <el-button type="danger" size="large" :disabled="btnLocked" @click="withLock(handleBuyNow)()">
              立即购买
            </el-button>
            <el-button size="large" @click="handleAddToCompare">
              <el-icon><DataAnalysis /></el-icon>
              加入对比
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
            :class="{ selected: selectedSku?.id === sku.id, 'sold-out': isSoldOut(sku) }"
            @click="!isSoldOut(sku) && selectSku(sku)"
          >
            <div class="sku-info">
              <p class="sku-title">{{ sku.title }}</p>
              <p class="sku-price">¥{{ sku.price }}</p>
              <p class="sku-stock">{{ isSoldOut(sku) ? '已售罄' : `库存：${sku.stock}` }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品详情 -->
      <div class="detail-section">
        <h3>商品详情</h3>
        <div class="detail-content" v-html="pageDetail"></div>
      </div>

      <!-- 相关商品推荐（AI more_like_this） -->
      <div v-if="relatedProducts.length > 0" class="related-section">
        <h3>看了又看</h3>
        <el-row :gutter="16">
          <el-col
            v-for="item in relatedProducts"
            :key="item.spuId"
            :xs="12"
            :sm="8"
            :md="6"
          >
            <div class="related-card-wrapper" @click="goToProduct(item.spuId)">
              <el-card class="related-card" shadow="hover">
                <el-image
                  :src="item.picture || 'https://via.placeholder.com/160'"
                  fit="cover"
                  class="related-image"
                  :preview-src-list="[]"
                />
                <div class="related-info">
                  <div class="related-name">{{ item.name }}</div>
                  <div class="related-price">¥{{ item.listPrice }}</div>
                  <div class="related-meta">
                    <el-tag size="small" type="info" v-if="item.brandName">{{ item.brandName }}</el-tag>
                  </div>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Picture, DataAnalysis } from '@element-plus/icons-vue'
import { useClickLock } from '@/composables/useClickLock'
import { getFrontSpuDetail, getFrontSpuPageDetail, getFrontSkuList } from '@/api/spu'
import { getRelatedProducts } from '@/api/search'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/store/cart'
import { useFrontUserStore } from '@/store/frontUser'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useFrontUserStore()
const { locked: btnLocked, withLock } = useClickLock()

const loading = ref(false)
const product = ref(null)
const pageDetail = ref('')
const skuList = ref([])
const selectedSku = ref(null)
const currentImage = ref('')
const relatedProducts = ref([])

// 图片列表（相对路径补全为绝对路径）
const fixImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return window.location.origin + '/' + url.replace(/^\//, '')
}
const imageList = computed(() => {
  if (!product.value?.pictures) return []
  try {
    return JSON.parse(product.value.pictures).map(fixImageUrl)
  } catch {
    return []
  }
})

// 标签列表
const tagList = computed(() => {
  if (!product.value?.tags) return []
  return product.value.tags.split(',').filter(tag => tag.trim())
})

// 获取商品详情
const fetchProductDetail = async () => {
  const spuId = route.params.id
  loading.value = true
  
  try {
    // 获取基本信息
    const detailRes = await getFrontSpuDetail(spuId)
    product.value = detailRes.data
    
    // 设置默认图片
    if (imageList.value.length > 0) {
      currentImage.value = imageList.value[0]
    }

    // 获取详情页
    const pageRes = await getFrontSpuPageDetail(spuId)
    pageDetail.value = pageRes.data.detail || ''

    // 获取SKU列表
    const skuRes = await getFrontSkuList(spuId)
    skuList.value = skuRes.data || []
    
    // 默认选中第一个SKU
    if (skuList.value.length > 0) {
      selectedSku.value = skuList.value[0]
    }
  } catch (error) {
    ElMessage.error('获取商品详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }

  // 异步加载相关推荐（不阻塞主流程）
  fetchRelatedProducts(spuId)
}

// 获取相关商品推荐
const fetchRelatedProducts = async (spuId) => {
  try {
    const res = await getRelatedProducts(spuId)
    relatedProducts.value = res.data || []
  } catch {
    // 静默失败，不影响主流程
  }
}

// 选择SKU
const selectSku = (sku) => {
  selectedSku.value = sku
  // 如果 SKU 有专属图片则切换主图，否则保持 SPU 图片
  try {
    const pics = JSON.parse(sku.pictures || '[]')
    if (pics.length > 0) {
      currentImage.value = fixImageUrl(pics[0])
    } else if (imageList.value.length > 0) {
      currentImage.value = imageList.value[0]
    }
  } catch {
    if (imageList.value.length > 0) currentImage.value = imageList.value[0]
  }
}

// SKU 库存是否售罄
const isSoldOut = (sku) => (sku.stock ?? 0) <= 0

// 解析 SKU 的 pictures JSON 取首图
const getSkuFirstPic = (sku) => {
  if (!sku?.pictures) return ''
  try {
    const pics = JSON.parse(sku.pictures)
    return pics.length > 0 ? fixImageUrl(pics[0]) : ''
  } catch { return '' }
}

// 加入购物车
const handleAddToCart = async () => {
  if (!selectedSku.value) {
    ElMessage.warning('请选择商品规格')
    return
  }
  
  // 检查是否登录
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/user/login')
    return
  }
  
  try {
    await cartStore.addToCart({
      skuId: selectedSku.value.id,
      title: selectedSku.value.title || product.value.title,
      mainPicture: getSkuFirstPic(selectedSku.value) || (imageList.value[0] || ''),
      price: selectedSku.value.price,
      quantity: 1
    })
  } catch (error) {
    ElMessage.error('添加购物车失败')
  }
}

// 跳转商品详情
const goToProduct = (spuId) => {
  window.location.href = '/product/' + spuId
}

// 立即购买
const handleBuyNow = async () => {
  if (!selectedSku.value) {
    ElMessage.warning('请选择商品规格')
    return
  }

  // 检查是否登录
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/user/login')
    return
  }

  // 先加入购物车，然后跳转到结算页
  try {
    const result = await cartStore.addToCart({
      skuId: selectedSku.value.id,
      title: selectedSku.value.title || product.value.title,
      mainPicture: getSkuFirstPic(selectedSku.value) || (imageList.value[0] || ''),
      price: selectedSku.value.price,
      quantity: 1
    })

    if (result) {
      // 购物车按 ID 倒序排列，最新添加的在第一位
      const newItem = cartStore.cartItems[0]
      if (newItem) {
        router.push({
          path: '/order/settle',
          query: { cartIds: newItem.id }
        })
      }
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 添加到 AI 对比
const handleAddToCompare = () => {
  // 通过事件总线或 provide/inject 传递
  // 这里使用 window 上的全局方法
  if (window.floatingAI?.addToCompare) {
    window.floatingAI.addToCompare({
      spuId: product.value.id,
      name: product.value.title,
      listPrice: product.value.listPrice,
      picture: imageList.value[0] || ''
    })
  } else {
    ElMessage.info('请先登录后使用 AI 对比功能')
  }
}

onMounted(() => {
  fetchProductDetail()
})

watch(() => route.params.id, (newId) => {
  if (newId) fetchProductDetail()
})
</script>

<style scoped>
.product-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.product-main {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.product-gallery {
  flex: 0 0 450px;
}

@media (max-width: 767px) {
  .product-main {
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
  }

  .product-gallery {
    flex: none;
    width: 100%;
  }

  .main-image {
    height: 300px;
  }

  .product-title {
    font-size: 18px;
  }

  .price {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .sku-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
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
  border-color: #409eff;
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
  border-top: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: 600;
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
  display: flex;
  gap: 15px;
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
  border-color: #409eff;
}

.sku-item.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.sku-item.sold-out {
  opacity: 0.45;
  cursor: not-allowed;
  border-color: #e4e7ed;
  background-color: #f5f5f5;
}

.sku-item.sold-out:hover {
  border-color: #e4e7ed;
}

.sku-title {
  font-size: 14px;
  margin: 0 0 10px 0;
}

.sku-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: 600;
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

/* 相关商品推荐 */
.related-section {
  padding-top: 30px;
  margin-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.related-section h3 {
  margin-bottom: 16px;
  font-size: 18px;
  color: #303133;
}

.related-card-wrapper {
  cursor: pointer;
  margin-bottom: 12px;
}

.related-card {
  transition: transform 0.2s;
}

.related-card-wrapper:hover .related-card {
  transform: translateY(-2px);
}

.related-image {
  width: 100%;
  height: 160px;
  border-radius: 4px;
}

.related-info {
  padding: 8px 0 0;
  text-align: center;
}

.related-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
}

.related-price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 6px;
}

.related-meta {
  display: flex;
  justify-content: center;
}
</style>
