import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref([])
  const menuList = ref([])

  const setPermissions = (perms) => {
    permissions.value = perms
  }

  const setMenuList = (menus) => {
    menuList.value = menus
  }

  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }

  return {
    permissions,
    menuList,
    setPermissions,
    setMenuList,
    hasPermission
  }
})
