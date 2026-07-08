const { TRIGGER_LABELS } = require('./types.js')
const KEYS = {
  events: 'awakening_events',
  tradeoffs: 'awakening_tradeoffs',
  dialogs: 'awakening_dialogs',
  progress: 'awakening_progress',
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysAgoKey(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return todayKey(d)
}

const DEFAULT_PROGRESS = {
  totalRestrain: 0,
  totalRelapse: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastEventDate: null,
  dailyQuoteCount: 0,
}

function getStorage(key) {
  return new Promise((resolve) => {
    wx.getStorage({
      key,
      success: (res) => resolve(res.data),
      fail: () => resolve(null),
    })
  })
}

function setStorage(key, data) {
  return new Promise((resolve) => {
    wx.setStorage({
      key,
      data,
      success: () => resolve(),
      fail: () => resolve(),
    })
  })
}

const StorageService = {
  async init() {
    // 小程序存储自动初始化
  },

  isEncrypted() {
    return false
  },

  async getEvents() {
    const raw = await getStorage(KEYS.events)
    return raw || []
  },

  async addEvent(event) {
    const list = await this.getEvents()
    list.push(event)
    await setStorage(KEYS.events, list)
    await this.recomputeProgress(event)
  },

  async getTradeoffs() {
    const raw = await getStorage(KEYS.tradeoffs)
    return raw || []
  },

  async addTradeoff(note) {
    const list = await this.getTradeoffs()
    list.push(note)
    await setStorage(KEYS.tradeoffs, list)
  },

  async deleteTradeoff(id) {
    const list = (await this.getTradeoffs()).filter((t) => t.id !== id)
    await setStorage(KEYS.tradeoffs, list)
  },

  async getDialogs() {
    const raw = await getStorage(KEYS.dialogs)
    return raw || []
  },

  async addDialog(session) {
    const list = await this.getDialogs()
    const idx = list.findIndex((d) => d.id === session.id)
    if (idx >= 0) list[idx] = session
    else list.push(session)
    await setStorage(KEYS.dialogs, list)
  },

  async getProgress() {
    const raw = await getStorage(KEYS.progress)
    return raw || { ...DEFAULT_PROGRESS }
  },

  async setProgress(p) {
    await setStorage(KEYS.progress, p)
  },

  async recomputeProgress(event) {
    const p = await this.getProgress()
    if (event.type === 'restrain') {
      p.totalRestrain += 1
      const today = todayKey()
      if (p.lastEventDate !== today) {
        const yesterday = daysAgoKey(1)
        if (p.lastEventDate === yesterday || p.lastEventDate === null) {
          p.currentStreak += 1
        } else {
          p.currentStreak = 1
        }
        p.lastEventDate = today
      }
      if (p.currentStreak > p.bestStreak) p.bestStreak = p.currentStreak
    } else {
      p.totalRelapse += 1
      p.currentStreak = 0
      p.lastEventDate = todayKey()
    }
    await this.setProgress(p)
  },

  async incrementDailyQuoteCount() {
    const p = await this.getProgress()
    p.dailyQuoteCount = (p.dailyQuoteCount || 0) + 1
    await this.setProgress(p)
  },

  async getStats() {
    const [events, progress] = await Promise.all([this.getEvents(), this.getProgress()])
    const successRate = Math.round((progress.totalRestrain / (progress.totalRestrain + progress.totalRelapse || 1)) * 100) || 0

    const triggerMap = new Map()
    events.forEach((e) => triggerMap.set(e.trigger, (triggerMap.get(e.trigger) || 0) + 1))
    const triggerDistribution = Array.from(triggerMap.entries())
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)

    const trend30 = []
    for (let i = 29; i >= 0; i--) {
      const key = daysAgoKey(i)
      trend30.push({ date: key.slice(5), restrain: 0, relapse: 0 })
    }
    events.forEach((e) => {
      const key = todayKey(new Date(e.timestamp)).slice(5)
      const item = trend30.find((t) => t.date === key)
      if (item) {
        if (e.type === 'restrain') item.restrain += 1
        else item.relapse += 1
      }
    })

    return {
      totalRestrain: progress.totalRestrain,
      totalRelapse: progress.totalRelapse,
      successRate,
      currentStreak: progress.currentStreak,
      bestStreak: progress.bestStreak,
      dailyQuoteCount: progress.dailyQuoteCount || 0,
      triggerDistribution,
      trend30,
    }
  },

  async exportData() {
    const [events, tradeoffs, dialogs, progress] = await Promise.all([
      this.getEvents(),
      this.getTradeoffs(),
      this.getDialogs(),
      this.getProgress(),
    ])
    return JSON.stringify(
      { events, tradeoffs, dialogs, progress, exportedAt: Date.now() },
      null,
      2,
    )
  },

  async resetData() {
    await Promise.all([
      setStorage(KEYS.events, []),
      setStorage(KEYS.tradeoffs, []),
      setStorage(KEYS.dialogs, []),
      setStorage(KEYS.progress, { ...DEFAULT_PROGRESS }),
    ])
  },
}

module.exports = {
  StorageService,
  uid,
  todayKey,
  daysAgoKey,
}
