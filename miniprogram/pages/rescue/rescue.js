const { StorageService, uid } = require('../../utils/storage.js')
const { TRIGGER_OPTIONS } = require('../../utils/types.js')

const app = getApp()

const BREATHING_PHASES = [
  { label: '吸气', duration: 4000, scale: 1.4, color: '#8FA89B' },
  { label: '屏息', duration: 7000, scale: 1.4, color: '#9B8FA8' },
  { label: '呼气', duration: 8000, scale: 1, color: '#E8B4A0' },
]

const CELEBRATION_TYPES = {
  success: {
    title: '克制成功！',
    subtitle: '又一次选择了更好的自己',
    bgGradient: 'linear-gradient(135deg, rgba(143, 168, 155, 0.15) 0%, rgba(155, 143, 168, 0.1) 100%)',
    emoji: '🎉',
  },
  comfort: {
    title: '没关系的',
    subtitle: '每一次觉察都是在积蓄力量',
    bgGradient: 'linear-gradient(135deg, rgba(232, 180, 160, 0.15) 0%, rgba(212, 184, 150, 0.1) 100%)',
    emoji: '💗',
  },
}

Page({
  data: {
    theme: 'light',
    step: 0, // 0: 选诱因, 1: 呼吸, 2: AI 对话, 3: 结果
    selectedTrigger: 'other',
    triggerOptions: TRIGGER_OPTIONS,
    breathingPhase: 0,
    breathingText: '',
    breathCount: 0,
    totalBreaths: 3,
    breathingActive: false,
    showCelebration: false,
    celebrationType: 'success',
    scenario: '',
    outcomeNote: '',
    eventType: 'restrain',
  },

  onLoad() {
    this.setData({ theme: app.getTheme() })
  },

  onShow() {
    this.setData({ theme: app.getTheme() })
  },

  selectTrigger(e) {
    const trigger = e.currentTarget.dataset.trigger
    this.setData({ selectedTrigger: trigger })
  },

  startBreathing() {
    this.setData({ step: 1, breathingActive: true, breathCount: 0 })
    this.startBreathCycle()
  },

  startBreathCycle() {
    if (this.data.breathCount >= this.data.totalBreaths) {
      this.finishBreathing()
      return
    }

    let phaseIndex = 0
    const runPhase = () => {
      if (!this.data.breathingActive) return
      if (phaseIndex >= BREATHING_PHASES.length) {
        this.setData({ breathCount: this.data.breathCount + 1 })
        phaseIndex = 0
        if (this.data.breathCount >= this.data.totalBreaths) {
          this.finishBreathing()
          return
        }
      }
      const phase = BREATHING_PHASES[phaseIndex]
      this.setData({
        breathingPhase: phaseIndex,
        breathingText: phase.label,
      })
      phaseIndex++
      setTimeout(runPhase, phase.duration)
    }
    runPhase()
  },

  finishBreathing() {
    this.setData({ breathingActive: false, step: 2 })
  },

  goToChat() {
    wx.navigateTo({
      url: `/pages/chat/chat?trigger=${this.data.selectedTrigger}`,
    })
  },

  goToReview() {
    wx.navigateTo({ url: '/pages/review/review' })
  },

  showResult(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      eventType: type,
      showCelebration: true,
      celebrationType: type === 'restrain' ? 'success' : 'comfort',
    })
  },

  saveEvent() {
    const event = {
      id: uid(),
      timestamp: Date.now(),
      type: this.data.eventType,
      trigger: this.data.selectedTrigger,
      scenario: this.data.scenario || '未记录',
      outcomeNote: this.data.outcomeNote || '',
    }
    StorageService.addEvent(event).then(() => {
      wx.showToast({
        title: '已记录',
        icon: 'success',
      })
      this.setData({ showCelebration: false, step: 0 })
      wx.switchTab({ url: '/pages/index/index' })
    })
  },

  closeCelebration() {
    this.setData({ showCelebration: false })
  },

  onScenarioInput(e) {
    this.setData({ scenario: e.detail.value })
  },

  onOutcomeInput(e) {
    this.setData({ outcomeNote: e.detail.value })
  },

  backToStart() {
    this.setData({
      step: 0,
      breathingActive: false,
      breathCount: 0,
    })
  },
})
