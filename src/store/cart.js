import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCartList, addToCart as apiAddToCart, updateCartQuantity as apiUpdateCartQuantity, deleteCartItem as apiDeleteCartItem, clearCart as apiClearCart } from '@/api/cart'
import { ElMessage } from 'element-plus'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])
  const totalCount = ref(0)
  const totalPrice = ref(0)
  const selectedIds = ref([])

  /**
   * 获取购物车列表
   */
  const fetchCartList = async () => {
    try {
      const res = await getCartList()
      cartItems.value = res.data.list || []
      totalCount.value = res.data.total || 0
      // 默认全选
      selectedIds.value = cartItems.value.map(item => item.id)
      calculateTotal()
      return cartItems.value
    } catch (error) {
      console.error('获取购物车失败:', error)
      throw error
    }
  }

  /**
   * 添加到购物车
   */
  const addToCart = async (data) => {
    try {
      await apiAddToCart(data)
      ElMessage.success('已加入购物车')
      // 刷新购物车列表
      await fetchCartList()
      return true
    } catch (error) {
      console.error('添加购物车失败:', error)
      throw error
    }
  }

  /**
   * 更新购物车商品数量
   */
  const updateQuantity = async (id, quantity) => {
    try {
      await apiUpdateCartQuantity({ id, quantity })
      // 更新本地数据
      const item = cartItems.value.find(item => item.id === id)
      if (item) {
        item.quantity = quantity
        calculateTotal()
      }
      return true
    } catch (error) {
      console.error('更新数量失败:', error)
      throw error
    }
  }

  /**
   * 删除购物车商品
   */
  const removeFromCart = async (ids) => {
    try {
      await apiDeleteCartItem(ids)
      ElMessage.success('删除成功')
      // 从本地移除
      const idArray = Array.isArray(ids) ? ids : [ids]
      cartItems.value = cartItems.value.filter(item => !idArray.includes(item.id))
      selectedIds.value = selectedIds.value.filter(id => !idArray.includes(id))
      calculateTotal()
      return true
    } catch (error) {
      console.error('删除失败:', error)
      throw error
    }
  }

  /**
   * 清空购物车
   */
  const clearCart = async () => {
    try {
      await apiClearCart()
      ElMessage.success('购物车已清空')
      cartItems.value = []
      selectedIds.value = []
      totalCount.value = 0
      totalPrice.value = 0
      return true
    } catch (error) {
      console.error('清空购物车失败:', error)
      throw error
    }
  }

  /**
   * 切换选中状态
   */
  const toggleSelect = (id) => {
    const index = selectedIds.value.indexOf(id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    } else {
      selectedIds.value.push(id)
    }
    calculateTotal()
  }

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (selectedIds.value.length === cartItems.value.length) {
      selectedIds.value = []
    } else {
      selectedIds.value = cartItems.value.map(item => item.id)
    }
    calculateTotal()
  }

  /**
   * 计算总价
   */
  const calculateTotal = () => {
    const selectedItems = cartItems.value.filter(item => selectedIds.value.includes(item.id))
    totalPrice.value = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    totalCount.value = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  /**
   * 获取选中的商品
   */
  const getSelectedItems = computed(() => {
    return cartItems.value.filter(item => selectedIds.value.includes(item.id))
  })

  /**
   * 是否全选
   */
  const isAllSelected = computed(() => {
    return cartItems.value.length > 0 && selectedIds.value.length === cartItems.value.length
  })

  return {
    cartItems,
    totalCount,
    totalPrice,
    selectedIds,
    fetchCartList,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleSelect,
    toggleSelectAll,
    getSelectedItems,
    isAllSelected
  }
})
