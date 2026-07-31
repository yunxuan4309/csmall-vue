<template>
  <div class="product-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-header-top">
        <h2 class="page-title">
          <template v-if="searchKeyword">搜索 "{{ searchKeyword }}"</template>
          <template v-else>商品列表</template>
        </h2>
        <el-button v-if="searchKeyword" size="small" @click="backToProductList">
          <el-icon><ArrowLeft /></el-icon>
          返回商品列表
        </el-button>
      </div>
      <p class="page-subtitle" v-if="aiExplanation">{{ aiExplanation }}</p>
      <p class="page-subtitle" v-else-if="!searchKeyword">精选好物，品质保证</p>
    </div>

    <!-- 分类选择（仅在非搜索模式下显示） -->
    <div class="category-filter" v-if="!searchKeyword">
      <el-cascader
        v-model="selectedCategory"
        :options="categoryTree"
        :props="{ value: 'id', label: 'name', children: 'childrens' }"
        placeholder="请选择商品分类（可选）"
        clearable
        @change="handleCategoryChange"
      />
      <el-button
        v-if="selectedCategory && selectedCategory.length > 0"
        type="info"
        size="small"
        @click="clearCategory"
      >
        查看全部
      </el-button>
    </div>

    <!-- 商品列表 -->
    <div v-loading="loading" element-loading-text="正在加载商品..." class="product-grid">
      <el-row :gutter="20">
        <el-col
          v-for="product in productList"
          :key="product.id"
          :xs="12"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card class="product-card" shadow="never" @click="goToDetail(product.id)">
            <div class="product-image">
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

            <div class="product-info">
              <h3 class="product-title">{{ product.title }}</h3>
              <p class="product-desc">{{ product.description }}</p>

              <div class="product-meta">
                <span class="price-brand">¥{{ product.listPrice }}</span>
                <span class="sales">已售 {{ product.sales }}</span>
              </div>

              <div class="product-tags">
                <el-tag v-if="product.newArrival" size="small" type="danger">新品</el-tag>
                <el-tag v-if="product.recommend" size="small" type="warning">推荐</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <el-empty v-if="!loading && productList.length === 0" description="暂无商品">
        <template #image>
          <el-icon :size="100" color="#909399"><ShoppingBag /></el-icon>
        </template>
        <template #description>
          <p style="color: #909399; margin-top: 10px;">该分类下暂无商品，请选择其他分类</p>
        </template>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchProductList"
        @current-change="fetchProductList"
      />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'ProductList' })
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Picture, ShoppingBag, ArrowLeft } from '@element-plus/icons-vue'
import { getFrontSpuList, getFrontAllSpuList } from '@/api/spu'
import { getFrontCategoryTree } from '@/api/category'
import { searchProducts } from '@/api/search'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const productList = ref([])
const categoryTree = ref([])
const selectedCategory = ref([])
const searchKeyword = ref('')
const aiExplanation = ref('')

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索缓存：避免离开再回来重新调慢速 AI 搜索
const searchCache = new Map()
const cacheKey = () => `${searchKeyword.value}_${page.value}_${pageSize.value}`

const fetchCategoryTree = async () => {
  try {
    const res = await getFrontCategoryTree()
    categoryTree.value = res.data.categories || []

    if (route.query.categoryId) {
      const targetCategoryId = parseInt(route.query.categoryId)
      const categoryPath = findCategoryPathById(categoryTree.value, targetCategoryId)
      if (categoryPath) {
        selectedCategory.value = categoryPath
        await fetchProductList()
      } else {
        await selectFirstCategory()
      }
    } else {
      await selectFirstCategory()
    }
  } catch (error) {
    console.error('获取分类树失败:', error)
  }
}

const selectFirstCategory = async () => {
  if (categoryTree.value.length > 0) {
    const firstCategory = categoryTree.value[0]
    const categoryPath = getFirstLeafCategoryPath(firstCategory)
    if (categoryPath) {
      selectedCategory.value = categoryPath
      await fetchProductList()
    }
  }
}

const getFirstLeafCategoryPath = (category, path = []) => {
  const currentPath = [...path, category.id]
  if (!category.childrens || category.childrens.length === 0) {
    return currentPath
  }
  return getFirstLeafCategoryPath(category.childrens[0], currentPath)
}

const findCategoryPathById = (categories, targetId, path = []) => {
  for (const category of categories) {
    const currentPath = [...path, category.id]
    if (category.id === targetId) {
      return currentPath
    }
    if (category.childrens && category.childrens.length > 0) {
      const result = findCategoryPathById(category.childrens, targetId, currentPath)
      if (result) return result
    }
  }
  return null
}

const fetchProductList = async () => {
  loading.value = true
  try {
    // AI 语义搜索模式
    if (searchKeyword.value) {
      const key = cacheKey()
      const cached = searchCache.get(key)
      if (cached) {
        productList.value = cached.products
        aiExplanation.value = cached.aiExplanation
        total.value = cached.total
        loading.value = false
        return
      }
      const res = await searchProducts(searchKeyword.value, page.value, pageSize.value)
      const products = (res.data?.products || []).map(p => ({
        id: p.spuId,
        title: p.title || p.name,
        description: p.categoryName || '',
        listPrice: p.listPrice,
        pictures: p.picture ? JSON.stringify([p.picture]) : '[]',
        sales: p.sales || 0,
        newArrival: false,
        recommend: false
      }))
      const result = {
        products,
        aiExplanation: res.data?.aiExplanation || '',
        total: Number(res.data?.totalCount) || 0
      }
      searchCache.set(key, result)
      productList.value = result.products
      aiExplanation.value = result.aiExplanation
      total.value = result.total
      loading.value = false
      return
    }

    // 分类浏览模式
    aiExplanation.value = ''
    if (selectedCategory.value && selectedCategory.value.length > 0) {
      const categoryId = selectedCategory.value[selectedCategory.value.length - 1]
      const res = await getFrontSpuList(categoryId, {
        page: page.value,
        pageSize: pageSize.value
      })
      productList.value = res.data.list || []
      total.value = Number(res.data.total) || 0
    } else {
      // 无分类筛选 → 显示全部商品
      const res = await getFrontAllSpuList({
        page: page.value,
        pageSize: pageSize.value
      })
      productList.value = res.data.list || []
      total.value = Number(res.data.total) || 0
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const clearCategory = () => {
  selectedCategory.value = []
  searchKeyword.value = ''
  aiExplanation.value = ''
  page.value = 1
  selectFirstCategory()
}

const backToProductList = () => {
  searchKeyword.value = ''
  aiExplanation.value = ''
  page.value = 1
  router.replace({ path: '/products' })
  // keep-alive 缓存组件不会触发 onMounted，手动拉分类列表
  if (categoryTree.value.length === 0) {
    fetchCategoryTree()
  } else {
    selectFirstCategory()
  }
}

const handleCategoryChange = (value) => {
  if (!Array.isArray(value)) {
    console.warn('⚠️ 分类选择器返回的不是数组:', value)
    return
  }
  searchKeyword.value = ''
  aiExplanation.value = ''
  page.value = 1
  fetchProductList()
}

const goToDetail = (spuId) => {
  router.push(`/product/${spuId}`)
}

const getFirstImage = (pictures) => {
  if (!pictures) return ''
  let url
  try {
    const arr = JSON.parse(pictures)
    url = arr[0] || ''
  } catch {
    url = pictures
  }
  if (!url) return ''
  if (!url.startsWith('http')) {
    url = window.location.origin + '/' + url.replace(/^\//, '')
  }
  return url
}

// 监听路由 query.keyword 变化
watch(() => route.query.keyword, (newKw) => {
  if (newKw) {
    searchKeyword.value = newKw
    selectedCategory.value = []
    page.value = 1
    fetchProductList()
  }
}, { immediate: true })

onMounted(() => {
  // 非搜索模式：加载分类树。搜索模式由 watch immediate 处理，避免重复调用
  if (!route.query.keyword) {
    fetchCategoryTree()
  }
})
</script>

<style scoped>
.product-list-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--brand-border, #e2e8f0);
}

.page-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-grid {
  min-height: 400px;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: var(--radius-md, 10px);
  border: 1px solid var(--brand-border, #e2e8f0);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.04));
  transition: all var(--transition-fast, 0.2s);
  overflow: hidden;
}

.product-card:hover {
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.06));
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: var(--radius-md, 10px) var(--radius-md, 10px) 0 0;
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
  padding: 12px 0 0 0;
}

.product-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--brand-text, #1e293b);
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  height: 42px;
}

.product-desc {
  font-size: 12px;
  color: var(--brand-text-secondary, #64748b);
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.sales {
  font-size: 12px;
  color: var(--brand-text-muted, #94a3b8);
}

.product-tags {
  display: flex;
  gap: 5px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 767px) {
  .category-filter {
    flex-wrap: wrap;
  }
  .category-filter .el-cascader {
    width: 100%;
  }
  .category-filter .el-button {
    width: 100%;
    margin-top: 8px;
  }
  .product-card {
    margin-bottom: 10px;
  }
}
</style>
