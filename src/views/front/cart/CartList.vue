<template>
  <div class="cart-page">
    <el-card v-if="cartStore.cartItems.length > 0" class="cart-container">
      <template #header>
        <div class="cart-header">
          <h3>购物车 ({{ cartStore.cartItems.length }})</h3>
          <el-button type="danger" link @click="handleClearCart">清空购物车</el-button>
        </div>
      </template>

      <!-- 购物车列表 -->
      <div class="cart-list">
        <div 
          v-for="item in cartStore.cartItems" 
          :key="item.id" 
          class="cart-item"
          :class="{ selected: cartStore.selectedIds.includes(item.id) }"
        >
          <!-- 选择框 -->
          <el-checkbox 
            :model-value="cartStore.selectedIds.includes(item.id)"
            @change="() => cartStore.toggleSelect(item.id)"
          />

          <!-- 商品图片 -->
          <el-image 
            :src="item.mainPicture || 'https://via.placeholder.com/100'" 
            fit="cover"
            class="item-image"
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>

          <!-- 商品信息 -->
          <div class="item-info">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-specs" v-if="item.data">
              {{ parseSpecs(item.data) }}
            </div>
            <div class="item-price">¥{{ item.price }}</div>
          </div>

          <!-- 数量控制 -->
          <div class="item-quantity">
            <el-input-number 
              v-model="item.quantity" 
              :min="1" 
              :max="99"
              size="small"
              @change="(val) => handleQuantityChange(item.id, val)"
            />
          </div>

          <!-- 小计 -->
          <div class="item-subtotal">
            ¥{{ (item.price * item.quantity).toFixed(2) }}
          </div>

          <!-- 删除按钮 -->
          <el-button 
            type="danger" 
            link 
            @click="handleDeleteItem(item.id)"
          >
            删除
          </el-button>
        </div>
      </div>

      <!-- 底部结算栏 -->
      <div class="cart-footer">
        <div class="footer-left">
          <el-checkbox 
            :model-value="cartStore.isAllSelected"
            @change="cartStore.toggleSelectAll"
          >
            全选
          </el-checkbox>
          <span class="selected-count">已选 {{ cartStore.selectedIds.length }} 件</span>
        </div>
        <div class="footer-right">
          <div class="total-price">
            合计：<span class="price">¥{{ cartStore.totalPrice }}</span>
          </div>
          <el-button 
            type="primary" 
            size="large"
            :disabled="cartStore.selectedIds.length === 0"
            @click="handleCheckout"
          >
            去结算 ({{ cartStore.selectedIds.length }})
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 空购物车 -->
    <el-empty v-else description="购物车空空如也">
      <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/store/cart'

const router = useRouter()
const cartStore = useCartStore()

// 解析规格JSON
const parseSpecs = (dataStr) => {
  try {
    const specs = JSON.parse(dataStr)
    return specs.map(s => `${s.name}:${s.value}`).join(', ')
  } catch {
    return dataStr
  }
}

// 处理数量变化
const handleQuantityChange = async (id, quantity) => {
  try {
    await cartStore.updateQuantity(id, quantity)
  } catch (error) {
    ElMessage.error('更新数量失败')
  }
}

// 删除单个商品
const handleDeleteItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cartStore.removeFromCart(id)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 清空购物车
const handleClearCart = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cartStore.clearCart()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败')
    }
  }
}

// 去结算
const handleCheckout = () => {
  if (cartStore.selectedIds.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  
  // 跳转到订单确认页，传递选中的购物车ID
  router.push({
    path: '/order/settle',
    query: { cartIds: cartStore.selectedIds.join(',') }
  })
}

// 加载购物车数据
onMounted(async () => {
  try {
    await cartStore.fetchCartList()
  } catch (error) {
    console.error('加载购物车失败:', error)
    if (error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
      ElMessage.error('后端服务未启动，请检查网关服务（端口10087）和OMS服务是否运行')
    } else {
      ElMessage.error('加载购物车失败')
    }
  }
})
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
}

.cart-container {
  margin-bottom: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-header h3 {
  margin: 0;
  font-size: 18px;
}

.cart-list {
  min-height: 200px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s;
}

.cart-item:hover {
  background-color: #f5f7fa;
}

.cart-item.selected {
  background-color: #ecf5ff;
}

.item-image {
  width: 100px;
  height: 100px;
  margin: 0 20px;
  border-radius: 4px;
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

.item-info {
  flex: 1;
  margin: 0 20px;
}

.item-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-specs {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.item-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: 600;
}

.item-quantity {
  margin: 0 20px;
}

.item-subtotal {
  width: 120px;
  text-align: right;
  font-size: 18px;
  color: #f56c6c;
  font-weight: 600;
  margin-right: 20px;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.selected-count {
  color: #909399;
  font-size: 14px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-price {
  font-size: 16px;
  color: #303133;
}

.total-price .price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: 600;
}
</style>
