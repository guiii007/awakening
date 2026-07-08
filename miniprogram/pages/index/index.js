const { StorageService } = require('../../utils/storage.js')
const { getRandomQuote, getImageUrl } = require('../../utils/dailyQuotes.js')

const app = getApp()

Page({
  data: {
    theme: 'light',
    greeting: '',
    todayRestrain: 0,
    progress: {
      currentStreak: 0,
      totalRestrain: 0,
      totalRelapse: 0,
    },
    stats: {
      successRate: 0,
      totalRestrain: 0,
      totalRelapse: 0,
    },
    recentTradeoff: null,
    showQuote: false,
    quoteLoading: false,
    currentQuote: null,
    quoteImageUrl: '',
    events: [],
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
    try {
      const [events, tradeoffs, progress, stats] = await Promise.all([
        StorageService.getEvents(),
        StorageService.getTradeoffs(),
        StorageService.getProgress(),
        StorageService.getStats(),
      ])

      const today = new Date().toDateString()
      const todayRestrain = events.filter(
        (e) => e.type === 'restrain' && new Date(e.timestamp).toDateString() === today
      ).length

      const recentTradeoff = tradeoffs.length > 0 ? tradeoffs[tradeoffs.length - 1] : null

      this.setData({
        events,
        progress,
        stats,
        todayRestrain,
        recentTradeoff,
        greeting: this.getGreeting(),
      })
    } catch (e) {
      console.error('加载数据失败', e)
    }
  },

  getGreeting() {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了'
    if (hour < 12) return '早安'
    if (hour < 18) return '午安'
    return '晚上好'
  },

  goToRescue() {
    wx.switchTab({ url: '/pages/rescue/rescue' })
  },

  goToTradeoff() {
    wx.switchTab({ url: '/pages/tradeoff/tradeoff' })
  },

  goToStats() {
    wx.switchTab({ url: '/pages/stats/stats' })
  },

  goToChat() {
    wx.navigateTo({ url: '/pages/chat/chat' })
  },

  goToReview() {
    wx.navigateTo({ url: '/pages/review/review' })
  },

  async openQuote() {
    this.setData({ quoteLoading: true })
    const quote = getRandomQuote()
    const imageUrl = getImageUrl(quote.imagePrompt)
    await StorageService.incrementDailyQuoteCount()
    
    setTimeout(() => {
      this.setData({
        currentQuote: quote,
        quoteImageUrl: imageUrl,
        showQuote: true,
        quoteLoading: false,
      })
    }, 300)
  },

  closeQuote() {
    this.setData({ showQuote: false })
  },

  async refreshQuote() {
    if (this.data.quoteLoading) return
    this.setData({ quoteLoading: true })
    const quote = getRandomQuote()
    const imageUrl = getImageUrl(quote.imagePrompt)
    
    setTimeout(() => {
      this.setData({
        currentQuote: quote,
        quoteImageUrl: imageUrl,
        quoteLoading: false,
      })
    }, 300)
  },

  toggleTheme() {
    const newTheme = app.toggleTheme()
    this.setData({ theme: newTheme })
  },
})
