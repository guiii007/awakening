const app = getApp()

const ALTERNATIVES = [
  {
    id: 1,
    category: '身体动起来',
    icon: '🏃',
    color: '#8FA89B',
    items: [
      { title: '5 分钟拉伸', desc: '站起来活动一下身体，打断久坐的循环', duration: '5 分钟' },
      { title: '10 个深蹲', desc: '身体动起来，念头就会变', duration: '2 分钟' },
      { title: '出去走一圈', desc: '换个环境，大脑就会重新启动', duration: '10 分钟' },
      { title: '一杯冷水', desc: '冰水洗脸也可以，物理降温=心理降温', duration: '1 分钟' },
    ],
  },
  {
    id: 2,
    category: '转移注意力',
    icon: '🎨',
    color: '#9B8FA8',
    items: [
      { title: '整理房间 5 分钟', desc: '动手做一件小事，给大脑换个档位', duration: '5 分钟' },
      { title: '听一首喜欢的歌', desc: '完整地听完，不做别的', duration: '4 分钟' },
      { title: '写点什么', desc: '随便写，把脑子里的东西倒出来', duration: '10 分钟' },
      { title: '刷一会儿猫视频', desc: '允许自己放松，但换一种方式', duration: '10 分钟' },
    ],
  },
  {
    id: 3,
    category: '平静下来',
    icon: '🧘',
    color: '#D4B896',
    items: [
      { title: '4-7-8 呼吸', desc: '吸气 4 秒·屏息 7 秒·呼气 8 秒，做 3 轮', duration: '3 分钟' },
      { title: '身体扫描', desc: '从脚到头，感受身体的每一个部位', duration: '10 分钟' },
      { title: '数数', desc: '从 100 倒着数到 1，数错了重来', duration: '5 分钟' },
      { title: '看窗外', desc: '就只是看看远处，让眼睛休息', duration: '5 分钟' },
    ],
  },
  {
    id: 4,
    category: '联系他人',
    icon: '💬',
    color: '#E8B4A0',
    items: [
      { title: '给朋友发条消息', desc: '不用多说，打个招呼就行', duration: '2 分钟' },
      { title: '给家人打个电话', desc: '听听熟悉的声音', duration: '10 分钟' },
      { title: '找 AI 聊聊', desc: '把心里的话说出来', duration: '不限' },
    ],
  },
]

Page({
  data: {
    theme: 'light',
    alternatives: ALTERNATIVES,
  },

  onLoad() {
    this.setData({ theme: app.getTheme() })
  },

  onShow() {
    this.setData({ theme: app.getTheme() })
  },

  tryItem(e) {
    const title = e.currentTarget.dataset.title
    wx.showToast({
      title: `试试「${title}」`,
      icon: 'none',
    })
  },

  goToChat() {
    wx.navigateTo({ url: '/pages/chat/chat' })
  },
})
