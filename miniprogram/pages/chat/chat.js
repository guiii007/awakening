const { StorageService, uid } = require('../../utils/storage.js')
const { streamChat, PERSONALITIES } = require('../../utils/deepseek.js')

const app = getApp()

Page({
  data: {
    theme: 'light',
    trigger: 'none',
    personality: 'empathy',
    personalities: PERSONALITIES,
    messages: [],
    inputText: '',
    isLoading: false,
    sessionId: '',
    scrollTop: 0,
  },

  onLoad(options) {
    this.setData({
      theme: app.getTheme(),
      trigger: options.trigger || 'none',
    })
    this.initSession()
  },

  onShow() {
    this.setData({ theme: app.getTheme() })
  },

  async initSession() {
    const sessionId = uid()
    this.setData({ sessionId })
    
    // 添加欢迎消息
    const welcomeMsg = {
      id: uid(),
      role: 'ai',
      content: '嗨，我是小醒。想聊聊此刻的感受吗？不用急，慢慢说。',
      timestamp: Date.now(),
    }
    this.setData({ messages: [welcomeMsg] })
  },

  selectPersonality(e) {
    const personality = e.currentTarget.dataset.value
    this.setData({ personality })
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  async sendMessage() {
    const text = this.data.inputText.trim()
    if (!text || this.data.isLoading) return

    const userMsg = {
      id: uid(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    const messages = [...this.data.messages, userMsg]
    this.setData({
      messages,
      inputText: '',
      isLoading: true,
    })

    this.scrollToBottom()

    // 获取上下文
    const [events, tradeoffs] = await Promise.all([
      StorageService.getEvents(),
      StorageService.getTradeoffs(),
    ])

    const recentRestrain = events.filter((e) => e.type === 'restrain').slice(-3).reverse()

    // AI 回复
    const aiMsgId = uid()
    const aiMsg = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      timestamp: Date.now(),
    }
    this.setData({ messages: [...this.data.messages, aiMsg] })

    streamChat(
      messages,
      this.data.personality,
      {
        trigger: this.data.trigger,
        recentRestrain,
        tradeoffs: tradeoffs.slice(-3),
      },
      {
        onChunk: (chunk) => {
          const msgs = this.data.messages
          const idx = msgs.findIndex((m) => m.id === aiMsgId)
          if (idx >= 0) {
            msgs[idx].content += chunk
            this.setData({ messages: [...msgs] })
            this.scrollToBottom()
          }
        },
        onDone: (full) => {
          this.setData({ isLoading: false })
          this.saveSession()
        },
        onError: (err) => {
          console.error('AI 对话错误', err)
          this.setData({ isLoading: false })
        },
      }
    )
  },

  scrollToBottom() {
    setTimeout(() => {
      this.setData({ scrollTop: 99999 })
    }, 100)
  },

  async saveSession() {
    const session = {
      id: this.data.sessionId,
      timestamp: Date.now(),
      trigger: this.data.trigger,
      messages: this.data.messages,
    }
    await StorageService.addDialog(session)
  },

  goBack() {
    wx.navigateBack()
  },
})
