import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCategoryStore = defineStore('category', () => {
  const categoryList = ref([])
  const categoryTree = ref([])

  const setCategoryList = (list) => {
    categoryList.value = list
  }

  const setCategoryTree = (tree) => {
    categoryTree.value = tree
  }

  const clearCategory = () => {
    categoryList.value = []
    categoryTree.value = []
  }

  return {
    categoryList,
    categoryTree,
    setCategoryList,
    setCategoryTree,
    clearCategory
  }
})
