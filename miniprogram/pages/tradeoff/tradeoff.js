const { StorageService, uid } = require('../../utils/storage.js')

const app = getApp()

Page({
  data: {
    theme: 'light',
    tradeoffs: [],
    showForm: false,
    formStep: 0,
    longGoal: '',
    shortGain: '',
    longReward: '',
    requirementsText: '',
    sacrificesText: '',
  },

  onLoad() {
    this.setData({ theme: app.getTheme() })
    this.loadTradeoffs()
  },

  onShow() {
    this.setData({ theme: app.getTheme() })
    this.loadTradeoffs()
  },

  async loadTradeoffs() {
    const tradeoffs = await StorageService.getTradeoffs()
    this.setData({ tradeoffs: tradeoffs.reverse() })
  },

  openForm() {
    this.setData({
      showForm: true,
      formStep: 0,
      longGoal: '',
      shortGain: '',
      longReward: '',
      requirementsText: '',
      sacrificesText: '',
    })
  },

  closeForm() {
    this.setData({ showForm: false })
  },

  nextStep() {
    this.setData({ formStep: this.data.formStep + 1 })
  },

  prevStep() {
    this.setData({ formStep: this.data.formStep - 1 })
  },

  onLongGoalInput(e) {
    this.setData({ longGoal: e.detail.value })
  },

  onShortGainInput(e) {
    this.setData({ shortGain: e.detail.value })
  },

  onLongRewardInput(e) {
    this.setData({ longReward: e.detail.value })
  },

  onRequirementsInput(e) {
    this.setData({ requirementsText: e.detail.value })
  },

  onSacrificesInput(e) {
    this.setData({ sacrificesText: e.detail.value })
  },

  async saveTradeoff() {
    const note = {
      id: uid(),
      timestamp: Date.now(),
      longGoal: this.data.longGoal,
      requirements: this.data.requirementsText.split('\n').filter((s) => s.trim()),
      sacrifices: this.data.sacrificesText.split('\n').filter((s) => s.trim()),
      shortGain: this.data.shortGain,
      longReward: this.data.longReward,
    }
    await StorageService.addTradeoff(note)
    wx.showToast({ title: '已保存', icon: 'success' })
    this.setData({ showForm: false })
    this.loadTradeoffs()
  },

  async deleteTradeoff(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这份权衡笔记吗？',
      success: async (res) => {
        if (res.confirm) {
          await StorageService.deleteTradeoff(id)
          this.loadTradeoffs()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      },
    })
  },
})
