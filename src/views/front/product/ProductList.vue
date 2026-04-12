<template>
  <div class="product-list-page">
    <el-card>
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>🛍️ 商品列表</h2>
        <p class="subtitle">精选好物，品质保证</p>
      </div>

      <!-- 分类选择 -->
      <div class="category-filter">
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
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <el-card class="product-card" shadow="hover" @click="goToDetail(product.id)">
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
                  <span class="price">¥{{ product.listPrice }}</span>
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
        <el-empty v-if="!loading && productList.length === 0" description="请选择左侧商品分类查看商品">
          <template #image>
            <el-icon :size="100" color="#909399"><ShoppingBag /></el-icon>
          </template>
          <template #description>
            <p style="color: #909399; margin-top: 10px;">👈 请从上方分类选择器中选择一个分类</p>
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Picture, ShoppingBag } from '@element-plus/icons-vue'
import { getFrontSpuList } from '@/api/spu'
import { getFrontCategoryTree } from '@/api/category'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const productList = ref([])
const categoryTree = ref([])
const selectedCategory = ref([])

// 分页参数
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取分类树
const fetchCategoryTree = async () => {
  try {
    const res = await getFrontCategoryTree()
    categoryTree.value = res.data.categories || []
    
    // console.log('📂 分类树数据:', categoryTree.value)
    
    // 打印服装鞋帽分类的详细信息
    // const clothingCategory = categoryTree.value.find(cat => cat.id === 3)
    // if (clothingCategory) {
    //   console.log('👔 服装鞋帽分类详情:', clothingCategory)
    //   console.log('👔 子分类列表:', clothingCategory.childrens)
    // }
    
    // 如果路由中有 categoryId，优先使用路由参数
    if (route.query.categoryId) {
      const targetCategoryId = parseInt(route.query.categoryId)
      // console.log('🎯 路由参数指定的分类ID:', targetCategoryId)
      
      // 在分类树中查找该分类的完整路径
      const categoryPath = findCategoryPathById(categoryTree.value, targetCategoryId)
      if (categoryPath) {
        selectedCategory.value = categoryPath
        // console.log('✅ 找到分类路径:', categoryPath)
        await fetchProductList()
      } else {
        console.warn('⚠️ 未找到分类ID对应的路径:', targetCategoryId)
      }
    } else {
      // 默认不自动选择分类，让用户自己选择
      // console.log('ℹ️ 无路由参数，等待用户选择分类')
    }
  } catch (error) {
    console.error('获取分类树失败:', error)
  }
}

// 根据分类ID查找完整路径
const findCategoryPathById = (categories, targetId, path = []) => {
  for (const category of categories) {
    const currentPath = [...path, category.id]
    
    // 找到目标分类
    if (category.id === targetId) {
      return currentPath
    }
    
    // 递归搜索子分类
    if (category.childrens && category.childrens.length > 0) {
      const result = findCategoryPathById(category.childrens, targetId, currentPath)
      if (result) return result
    }
  }
  return null
}

// 查找最深层级的分类（递归）
const findDeepestCategory = (category) => {
  // 如果没有子分类，返回当前分类
  if (!category.childrens || category.childrens.length === 0) {
    return category
  }
  
  // 递归查找所有子分类中最深的
  let deepest = category
  for (const child of category.childrens) {
    const childDeepest = findDeepestCategory(child)
    // 比较深度（这里简化处理，直接取最后一个有子分类的）
    if (childDeepest) {
      deepest = childDeepest
    }
  }
  return deepest
}

// 构建分类路径（从根到目标分类的ID数组）
const buildCategoryPath = (category, targetId, path = []) => {
  const newPath = [...path, category.id]
  
  // 如果当前分类就是目标，返回路径
  if (category.id === targetId) {
    return newPath
  }
  
  // 递归搜索子分类
  if (category.childrens && category.childrens.length > 0) {
    for (const child of category.childrens) {
      const result = buildCategoryPath(child, targetId, newPath)
      if (result) return result
    }
  }
  
  return null
}

// 获取商品列表
const fetchProductList = async () => {
  loading.value = true
  try {
    let res
    
    // 如果选择了分类，按分类查询；否则查询所有商品
    if (selectedCategory.value && selectedCategory.value.length > 0) {
      const categoryId = selectedCategory.value[selectedCategory.value.length - 1]
      // console.log('🔍 当前选择的分类路径:', selectedCategory.value)
      // console.log('🔍 最终使用的分类ID:', categoryId)
      
      res = await getFrontSpuList(categoryId, {
        page: page.value,
        pageSize: pageSize.value
      })
      
      // console.log('✅ 获取到的商品数量:', res.data.list?.length || 0)
      // if (res.data.list && res.data.list.length > 0) {
      //   console.log('📦 第一个商品的完整数据:', res.data.list[0])
      //   console.log('📦 所有字段名:', Object.keys(res.data.list[0]))
      // }
      
      // 打印完整的响应数据结构
      // console.log('🔍 完整响应数据:', res.data)
    } else {
      // TODO: 这里需要后端提供一个获取所有商品的接口
      // 暂时使用第一个分类或者显示提示
      ElMessage.info('请选择商品分类查看商品')
      productList.value = []
      total.value = 0
      loading.value = false
      return
    }
    
    productList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    ElMessage.error('获取商品列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 清除分类选择
const clearCategory = () => {
  selectedCategory.value = []
  page.value = 1
  fetchProductList()
}

// 分类变化
const handleCategoryChange = (value) => {
  // console.log('👆 分类选择器变化 - 原始值:', value)
  // console.log('👆 分类选择器变化 - 类型:', Array.isArray(value) ? 'Array' : typeof value)
  
  // 确保 value 是数组
  if (!Array.isArray(value)) {
    console.warn('⚠️ 分类选择器返回的不是数组:', value)
    return
  }
  
  page.value = 1
  fetchProductList()
}

// 跳转到商品详情
const goToDetail = (spuId) => {
  router.push(`/product/${spuId}`)
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

onMounted(() => {
  fetchCategoryTree()
  // 不在这里重复处理路由参数，统一在 fetchCategoryTree 中处理
})
</script>

<style scoped>
.product-list-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #409eff;
}

.page-header h2 {
  font-size: 32px;
  color: #303133;
  margin: 0 0 10px 0;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
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
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
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
  margin: 0 0 8px 0;
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
  color: #909399;
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

.price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: 600;
}

.sales {
  font-size: 12px;
  color: #909399;
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
</style>
