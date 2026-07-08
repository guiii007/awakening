const { StorageService } = require('../../utils/storage.js')
const { TRIGGER_LABELS, TRIGGER_COLORS } = require('../../utils/types.js')

const app = getApp()

Page({
  data: {
    theme: 'light',
    stats: {
      totalRestrain: 0,
      totalRelapse: 0,
      successRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      dailyQuoteCount: 0,
      triggerDistribution: [],
      trend30: [],
    },
    events: [],
    expandedEventId: null,
    maxTrend: 1,
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
    const [events, stats] = await Promise.all([
      StorageService.getEvents(),
      StorageService.getStats(),
    ])

    const maxTrend = Math.max(1, ...stats.trend30.map((t) => Math.max(t.restrain, t.relapse)))

    this.setData({
      events: events.reverse(),
      stats,
      maxTrend,
    })
  },

  toggleExpand(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      expandedEventId: this.data.expandedEventId === id ? null : id,
    })
  },
})
