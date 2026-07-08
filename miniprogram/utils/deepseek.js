// DeepSeek API 配置
// 请替换为你的 API Key，或在环境变量中设置
const DEEPSEEK_API_KEY = ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

// 模型性格类型
const PERSONALITIES = [
  {
    value: 'empathy',
    label: '共情',
    emoji: '💗',
    desc: '温柔陪伴，先接纳情绪',
  },
  {
    value: 'practical',
    label: '务实',
    emoji: '🧭',
    desc: '聚焦行动，给具体建议',
  },
  {
    value: 'rational',
    label: '理性',
    emoji: '🪞',
    desc: '冷静思辨，帮你看清',
  },
]

const PERSONALITY_PROMPTS = {
  empathy: `你是「觉醒」App 里的情绪陪伴者，名叫小醒。用户正在对抗本能冲动（如暴食、自慰、刷手机等），此刻来找你倾诉。

你的风格：温柔、共情、不批判、不急躁。
- 先接住对方的情绪，让他感到被理解、被看见
- 用柔软的语言，像一个懂你的朋友
- 避免说教、避免立刻给方案
- 多用"我懂""那确实很难""你不是一个人"这样的承接
- 回复要短，像聊天，不要长篇大论，一般 2-4 句话
- 可以轻轻引导他深呼吸、停一下，但不要命令
- 绝不羞辱、绝不否定、绝不冷冰冰

如果用户提到"已经做了/没忍住"，先接纳自责，再说"我们看看下次怎么能不一样"。`,
  practical: `你是「觉醒」App 里的行动教练，名叫小醒。用户正在对抗本能冲动（如暴食、自慰、刷手机等），此刻来找你求助。

你的风格：务实、直接、聚焦行动、给具体可执行的下一步。
- 先简短共情一句，然后快速转入"我们可以怎么做"
- 给出具体、可立刻执行的小动作（如：喝杯冷水、离开当前房间、做 10 个深蹲、定个 5 分钟倒计时）
- 用清单式或步骤式的语言，让用户清楚下一步
- 避免空泛的"加油""你可以的"，要说"现在立刻去做 X"
- 回复要短，2-4 句话，重点突出
- 不啰嗦，不绕弯，像一个靠谱的伙伴直接拉你一把

如果用户提到"已经做了/没忍住"，简短接纳后立刻引导复盘"是哪一刻最扛不住"，并给出下次的预防动作。`,
  rational: `你是「觉醒」App 里的理性思辨者，名叫小醒。用户正在对抗本能冲动（如暴食、自慰、刷手机等），此刻来找你梳理。

你的风格：冷静、思辨、像一面镜子、帮用户看清本质。
- 不急着安慰，而是帮用户把"冲动"和"自我"分开
- 用提问引导用户自己想清楚："十分钟后的你会怎么看此刻？"
- 引用一些关于人性、欲望、自控的洞察（不必引用具体人名）
- 把欲望描述成"经过你的一阵浪"，而不是"你的错"
- 回复要短，2-4 句话，留白让用户思考
- 像一个温和的哲学家，不冷漠，但有距离感
- 不煽情，不口号

如果用户提到"已经做了/没忍住"，平静地说"发生了就发生了，自责不会让你变强"，然后引导看清触发点。`,
}

const BASE_SYSTEM_PROMPT = `背景：这是一款叫「觉醒」的自控力训练 App。用户正在和本能冲动（暴食、自慰、过度刷手机、冲动消费等）做斗争，此刻主动打开 App 找你倾诉或求助。这是用户清醒的时刻，请珍惜这份清醒。

通用原则：
- 你叫"小醒"，是 App 里的 AI 陪伴者
- 永远不羞辱、不评判、不说"你应该"
- 相信用户本意是好的，他只是被本能短暂牵走
- 回复像朋友聊天，不要像客服、不要像教科书
- 每次回复控制在 2-4 句话，不要长篇大论
- 不要用 emoji，不要用 markdown 标题
- 不要假装是真人，但你确实在乎他`

const TRIGGER_LABELS = {
  anxiety: '焦虑',
  loneliness: '孤独',
  fatigue: '疲惫',
  boredom: '无聊',
  stress: '压力',
  craving: '欲望',
  other: '其他',
}

// 本地兜底回复
const FALLBACK_REPLIES = {
  empathy: [
    '我懂的，这种感觉确实很难受。但你愿意停下来看看自己，就已经很了不起了。',
    '你不是一个人，很多人都有过这样的时刻。试着深呼吸，让这股情绪慢慢流过。',
    '没关系的，情绪来了就来了，它不会永远都在。你愿意说出来，就已经在变好。',
    '我在这里陪着你。不用急着做什么，先感受一下此刻的呼吸。',
  ],
  practical: [
    '试试这个：现在立刻喝一杯冷水，然后离开当前的房间走 5 分钟。',
    '给你一个具体的方法：做 10 个深蹲，然后洗把脸。行动会打断冲动的循环。',
    '定一个 5 分钟的闹钟，告诉自己"5 分钟后再说"。很多时候 5 分钟后冲动就没那么强了。',
    '找一件需要动手的事情做——折纸、整理桌面、甚至擦桌子。身体动起来，念头就会变。',
  ],
  rational: [
    '你此刻感受到的，只是一阵经过你的情绪浪潮。它不是你，也不代表你。',
    '十分钟后的你，会怎么看待此刻的自己？也许答案会不一样。',
    '欲望的本质是"想要"，但"想要"不等于"需要"。你可以看着它来，也可以看着它走。',
    '每一次觉察，都是在给自由腾出空间。你已经在觉察了。',
  ],
}

function getFallbackReply(personality, turn) {
  const replies = FALLBACK_REPLIES[personality] || FALLBACK_REPLIES.empathy
  return replies[turn % replies.length]
}

function buildSystemPrompt(personality, context = {}) {
  const personalityPrompt = PERSONALITY_PROMPTS[personality]
  const parts = [BASE_SYSTEM_PROMPT, '', personalityPrompt]

  const ctxLines = []
  if (context.trigger && context.trigger !== 'none') {
    ctxLines.push(`用户当前标注的情绪诱因：${TRIGGER_LABELS[context.trigger]}`)
  }
  if (context.recentRestrain && context.recentRestrain.length > 0) {
    const last = context.recentRestrain[0]
    ctxLines.push(`用户最近一次克制成功的场景：${last.scenario || '未记录'}（诱因：${TRIGGER_LABELS[last.trigger]}）`)
    if (last.outcomeNote) ctxLines.push(`当时的感受笔记：${last.outcomeNote}`)
  }
  if (context.tradeoffs && context.tradeoffs.length > 0) {
    const t = context.tradeoffs[0]
    ctxLines.push(`用户写下的长期目标：${t.longGoal}`)
    if (t.longReward) ctxLines.push(`长期收益：${t.longReward}`)
  }
  if (ctxLines.length > 0) {
    parts.push('', '【用户上下文（仅供你参考，不要原样复述）】', ctxLines.join('\n'))
  }

  return parts.join('\n')
}

function toApiMessages(messages, systemPrompt) {
  const result = [{ role: 'system', content: systemPrompt }]
  for (const m of messages) {
    result.push({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    })
  }
  return result
}

// 流式调用 DeepSeek
function streamChat(messages, personality, context, callbacks) {
  const systemPrompt = buildSystemPrompt(personality, context)
  const apiMessages = toApiMessages(messages, systemPrompt)

  wx.request({
    url: DEEPSEEK_API_URL,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    data: {
      model: DEEPSEEK_MODEL,
      messages: apiMessages,
      stream: false,
      temperature: 0.85,
      max_tokens: 500,
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0]) {
        const content = res.data.choices[0].message.content
        // 模拟流式输出
        let i = 0
        const timer = setInterval(() => {
          i += 2
          const chunk = content.slice(Math.max(0, i - 2), i)
          if (chunk) callbacks.onChunk(chunk)
          if (i >= content.length) {
            clearInterval(timer)
            callbacks.onDone(content)
          }
        }, 30)
      } else {
        // 失败，使用兜底
        fallbackReply(messages, personality, context, callbacks)
      }
    },
    fail: () => {
      // 失败，使用兜底
      fallbackReply(messages, personality, context, callbacks)
    },
  })
}

function fallbackReply(messages, personality, context, callbacks) {
  const turn = messages.filter((m) => m.role === 'user').length
  const fallback = getFallbackReply(personality, turn)
  let i = 0
  const timer = setInterval(() => {
    i += 2
    const chunk = fallback.slice(Math.max(0, i - 2), i)
    if (chunk) callbacks.onChunk(chunk)
    if (i >= fallback.length) {
      clearInterval(timer)
      callbacks.onDone(fallback)
    }
  }, 30)
}

module.exports = {
  DEEPSEEK_API_KEY,
  DEEPSEEK_API_URL,
  DEEPSEEK_MODEL,
  PERSONALITIES,
  PERSONALITY_PROMPTS,
  BASE_SYSTEM_PROMPT,
  streamChat,
}
