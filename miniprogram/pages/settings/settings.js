const { StorageService } = require('../../utils/storage.js')

const app = getApp()

Page({
  data: {
    theme: 'light',
    progress: {
      dailyQuoteCount: 0,
      totalRestrain: 0,
      totalRelapse: 0,
    },
  },

  onLoad() {
    this.setData({ theme: app.getTheme() })
    this.loadData()
  },

  onShow() {
    this.setData({ theme: app.getTheme() })
    this.loadData()
  },

  async loadData() {
    const progress = await StorageService.getProgress()
    this.setData({ progress })
  },

  toggleTheme() {
    const newTheme = app.toggleTheme()
    this.setData({ theme: newTheme })
  },

  async exportData() {
    const data = await StorageService.exportData()
    wx.setClipboardData({
      data,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
        })
      },
    })
  },

  resetData() {
    wx.showModal({
      title: '确认重置',
      content: '确定要清空所有数据吗？此操作不可撤销。',
      confirmText: '确认重置',
      confirmColor: '#DD9A82',
      success: async (res) => {
        if (res.confirm) {
          await StorageService.resetData()
          wx.showToast({
            title: '已重置',
            icon: 'success',
          })
          this.loadData()
        }
      },
    })
  },

  goToAlternatives() {
    wx.navigateTo({ url: '/pages/alternatives/alternatives' })
  },

  goToReview() {
    wx.navigateTo({ url: '/pages/review/review' })
  },
})
