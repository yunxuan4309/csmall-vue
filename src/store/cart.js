import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])
  const totalCount = ref(0)
  const totalPrice = ref(0)

  const addToCart = (item) => {
    // TODO: 实现添加到购物车逻辑
  }

  const removeFromCart = (itemId) => {
    // TODO: 实现从购物车移除逻辑
  }

  const clearCart = () => {
    cartItems.value = []
    totalCount.value = 0
    totalPrice.value = 0
  }

  return {
    cartItems,
    totalCount,
    totalPrice,
    addToCart,
    removeFromCart,
    clearCart
  }
})
