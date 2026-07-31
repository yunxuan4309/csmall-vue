import { ref } from 'vue'

/**
 * 防连点组合函数：点击后 lockMs 毫秒内锁定，防止重复触发
 * @param {number} lockMs - 锁定时间（毫秒），默认 500
 * @returns {{ locked: Ref<boolean>, withLock: (fn: Function) => Function }}
 */
export function useClickLock(lockMs = 500) {
  const locked = ref(false)

  function withLock(fn) {
    return async (...args) => {
      if (locked.value) return
      locked.value = true
      try {
        return await fn(...args)
      } finally {
        setTimeout(() => { locked.value = false }, lockMs)
      }
    }
  }

  return { locked, withLock }
}
