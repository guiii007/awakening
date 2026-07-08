const { StorageService } = require('../../utils/storage.js')
const { TRIGGER_LABELS } = require('../../utils/types.js')

const app = getApp()

Page({
  data: {
    theme: 'light',
    events: [],
    tradeoffs: [],
    activeTab: 'events',
    expandedId: null,
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
    const [events, tradeoffs] = await Promise.all([
      StorageService.getEvents(),
      StorageService.getTradeoffs(),
    ])

    this.setData({
      events: events.reverse(),
      tradeoffs: tradeoffs.reverse(),
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  toggleExpand(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      expandedId: this.data.expandedId === id ? null : id,
    })
  },

  goToTradeoff() {
    wx.switchTab({ url: '/pages/tradeoff/tradeoff' })
  },

  goToChat() {
    wx.navigateTo({ url: '/pages/chat/chat' })
  },
})
