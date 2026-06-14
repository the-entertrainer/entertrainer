import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    isOpened: false
  }),
  actions: {
    open() {
      this.isOpened = true
    },
    close() {
      this.isOpened = false
    },
    toggle() {
      this.isOpened = !this.isOpened
    }
  }
})
