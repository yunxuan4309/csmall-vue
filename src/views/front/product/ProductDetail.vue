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
            <el-button type="primary" size="large" @click="handleAddToCart">
              加入购物车
            </el-button>
            <el-button type="danger" size="large" @click="handleBuyNow">
              立即购买
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
              <p class="sku-price">¥{{ sku.price }}</p>
              <p class="sku-stock">库存：{{ sku.stock }}</p>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import { getFrontSpuDetail, getFrontSpuPageDetail, getFrontSkuList } from '@/api/spu'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/store/cart'
import { useFrontUserStore } from '@/store/frontUser'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useFrontUserStore()

const loading = ref(false)
const product = ref(null)
const pageDetail = ref('')
const skuList = ref([])
const selectedSku = ref(null)
const currentImage = ref('')

// 图片列表
const imageList = computed(() => {
  if (!product.value?.pictures) return []
  try {
    return JSON.parse(product.value.pictures)
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
}

// 选择SKU
const selectSku = (sku) => {
  selectedSku.value = sku
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
      mainPicture: selectedSku.value.mainPicture || (imageList.value[0] || ''),
      price: selectedSku.value.price,
      quantity: 1
    })
  } catch (error) {
    ElMessage.error('添加购物车失败')
  }
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
      mainPicture: selectedSku.value.mainPicture || (imageList.value[0] || ''),
      price: selectedSku.value.price,
      quantity: 1
    })
    
    if (result) {
      // 获取刚添加的商品ID（最后一个）
      const newItem = cartStore.cartItems[cartStore.cartItems.length - 1]
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

onMounted(() => {
  fetchProductDetail()
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
</style>
