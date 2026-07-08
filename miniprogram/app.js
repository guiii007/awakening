const { StorageService } = require('./utils/storage.js')

App({
  globalData: {
    theme: 'light',
    loaded: false,
  },

  onLaunch() {
    // 初始化数据
    StorageService.init().then(() => {
      this.globalData.loaded = true
    })
  },

  //  主题相关
  setTheme(theme) {
    this.globalData.theme = theme
    wx.setStorageSync('awakening_theme', theme)
  },

  getTheme() {
    if (!this.globalData.theme) {
      this.globalData.theme = wx.getStorageSync('awakening_theme') || 'light'
    }
    return this.globalData.theme
  },

  toggleTheme() {
    const newTheme = this.globalData.theme === 'light' ? 'dark' : 'light'
    this.setTheme(newTheme)
    return newTheme
  },
})
