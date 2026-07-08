import type { TriggerType, TradeoffNote, EventRecord } from "./types";
import { TRIGGER_LABELS } from "./types";

// 本地 AI 引擎：基于上下文关键词 + 话术模板，温和包容、正向激励、不批判
// 设计原则：先共情 → 再理性 → 后赋能

interface AIContext {
  trigger?: TriggerType | "none";
  recentRestrain?: EventRecord[]; // 最近的克制记录
  tradeoffs?: TradeoffNote[]; // 权衡笔记
  turn?: number; // 对话轮次
}

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ===== 共情开场 =====
const EMPATHY_OPENERS: Record<string, string[]> = {
  anxiety: [
    "我感受到你现在的焦虑了，那种胸口发紧、脑子嗡嗡的感觉，确实很难受。",
    "焦虑来了的时候，整个人像被按了快进键，你想停都停不下来，对吧。",
  ],
  loneliness: [
    "夜深了，孤独感会放大很多倍，你此刻的难受我懂。",
    "一个人面对空荡的房间，那种想找点什么的念头，其实是想被陪伴。",
  ],
  fatigue: [
    "你已经很累了，身体在喊停，可脑子还在惯性里转，这种矛盾很折磨人。",
    "疲惫的时候，本能会想找最快的方式给自己充点电，这不是你的错。",
  ],
  boredom: [
    "无聊的间隙里，那种想抓住点什么的冲动，其实是在寻找一点点刺激感。",
    "我懂，闲下来的时候反而最难熬，因为大脑不喜欢空白。",
  ],
  stress: [
    "压力积压到现在，你想找个出口释放一下，这是很自然的反应。",
    "高压之下，本能会推你去做点'立刻见效'的事来缓解，我理解。",
  ],
  craving: [
    "欲望这会儿上来了，它来得很猛，让你觉得非做不可——但那只是感觉，不是事实。",
    "这股冲动现在看起来很大，其实它像浪，会涨也会退，我们等它退一退。",
  ],
  other: [
    "谢谢你愿意停下来和我说说话，能意识到'我快失控了'本身就是一种清醒。",
    "此刻你愿意按下那个按钮求助，说明你的理智还在场，这很重要。",
  ],
  none: [
    "我在的，慢慢说，不着急。",
    "你愿意来这里，已经是在为自己做选择了。",
  ],
};

// ===== 理性引导 =====
const RATIONAL_LINES: string[] = [
  "冲动它不是你，它只是经过你的一阵情绪。你不必跟着它跑，看着它来，也能看着它走。",
  "有句话说，欲望的峰值通常只能维持十几分钟。我们不用对抗它，只要让它过去。",
  "想一下：十分钟后、一小时后、明天的你，会怎么看此刻的这个选择？",
  "短暂的快感是借来的，要连本带利还回去；而你坚持下来的每一秒，都是真正存进自己账户里的。",
  "你不是'坏'，你只是在被本能牵着走。把它看清，它就松手了一半。",
];

// ===== 赋能收尾 =====
const EMPOWER_LINES: string[] = [
  "你曾经做到过，这次也可以。哪怕只是再等五分钟，也是一次胜利。",
  "我陪你，但你才是真正做决定的那个人。我相信你能选对自己真正想要的。",
  "就算这次没扛住，也没关系——自控不是一次定输赢，是反复练习。你愿意复盘，就已经在进步了。",
  "深呼吸，把注意力放到呼吸上。你比你以为的更有力量。",
];

// ===== 失控后的接纳 =====
const RELAPSE_LINES: string[] = [
  "嗯，这次没扛住。先别责怪自己，自责不会让你变强，只会把下一次推得更远。",
  "发生了就发生了。我们看看是什么把你推到这一步的，下次提前识破它。",
  "你不是失败，你只是还在练习的路上。所有高手都是从'没扛住'里学出来的。",
];

// ===== 生成对话回复 =====
export function generateAIReply(
  userText: string,
  context: AIContext = {},
): string {
  const trigger = context.trigger || "none";
  const turn = context.turn || 0;
  const text = userText.toLowerCase();

  // 关键词：用户提到放纵/已经做了
  if (/已经|做了|没忍住|失败了|放弃了|破戒|又来|完了/.test(text)) {
    return pick(RELAPSE_LINES) + " 你愿意告诉我，刚才是哪一刻最扛不住吗？";
  }

  // 关键词：用户表达想克制/在坚持
  if (/忍住|坚持|克制|撑|不想|试试|怎么办|帮我/.test(text)) {
    if (context.recentRestrain && context.recentRestrain.length > 0) {
      const last = context.recentRestrain[0];
      const tail = last.outcomeNote ? `（你当时记下：${last.outcomeNote}）` : "";
      return `你之前在「${TRIGGER_LABELS[last.trigger] || "相似场景"}」里也撑过来了${tail}。那份成就感是真的，这次也能拿回来。` + pick(EMPOWER_LINES);
    }
    return pick(RATIONAL_LINES) + " " + pick(EMPOWER_LINES);
  }

  // 关键词：提到目标/权衡
  if (/目标|想要|长期|权衡|未来/.test(text) && context.tradeoffs && context.tradeoffs.length > 0) {
    const t = context.tradeoffs[0];
    return `你还记得自己写下的吗——你真正想要的是「${t.longGoal}」。${t.shortGain} 只是一瞬，而「${t.longReward}」是你一直想要的。这一刻，你正在选哪一个？`;
  }

  // 按轮次分层
  if (turn === 0) {
    return pick(EMPATHY_OPENERS[trigger] || EMPATHY_OPENERS.none);
  }
  if (turn === 1) {
    return pick(RATIONAL_LINES);
  }
  if (turn === 2) {
    if (context.recentRestrain && context.recentRestrain.length > 0) {
      const last = context.recentRestrain[0];
      return `其实你不是第一次面对这个了。上次「${TRIGGER_LABELS[last.trigger] || "相似场景"}」来袭时，你选择了克制，事后你写下：${last.outcomeNote || "感觉很好"}。那个你，此刻也在。`;
    }
    return pick(EMPOWER_LINES);
  }
  // 后续轮次随机
  return pick([...RATIONAL_LINES, ...EMPOWER_LINES]);
}

// ===== 得失权衡引导话术 =====
export const TRADEOFF_GUIDE = {
  goal: [
    "好，我们一起来梳理。先告诉我：抛开此刻的冲动，你内心里长期真正想达成的是什么？",
    "想象一年后的自己，你最希望那时的你拥有什么状态？把它写下来。",
  ],
  requirements: [
    "要走到那个目标，你觉得需要具备哪些条件？（比如精力、自律、健康、时间）一条一条写就好。",
    "实现它不是凭运气，是靠一些日常的积累。你觉得哪些是'必备'的？",
  ],
  sacrifices: [
    "现在反过来想：有哪些短暂的享乐，正在悄悄拿走你走到目标需要的条件？",
    "诚实地列出来——不用评判自己，只是看清。哪些'短期快感'是你愿意主动放下的？",
  ],
  summary: [
    "很好，清单已经生成。每次冲动来时，回到这张清单前看一眼：这一次，你换的是片刻快感，还是那个长期的你？",
  ],
};

export function pickGuide(stage: keyof typeof TRADEOFF_GUIDE): string {
  return pick(TRADEOFF_GUIDE[stage]);
}

// ===== 复盘总结生成 =====
export function generateReviewSummary(
  events: EventRecord[],
  tradeoffs: TradeoffNote[],
): string {
  const restrains = events.filter((e) => e.type === "restrain");
  if (restrains.length === 0) {
    return "你还没有克制记录。第一次总是最难的，但当你做到的那一刻，你会知道这一切都值得。";
  }
  const triggerCount = new Map<TriggerType, number>();
  restrains.forEach((e) => triggerCount.set(e.trigger, (triggerCount.get(e.trigger) || 0) + 1));
  const topTrigger = Array.from(triggerCount.entries()).sort((a, b) => b[1] - a[1])[0];
  const parts: string[] = [];
  parts.push(`你已经成功克制了 ${restrains.length} 次。`);
  if (topTrigger) {
    parts.push(`其中在「${TRIGGER_LABELS[topTrigger[0]]}」的场景里，你扛过来了 ${topTrigger[1]} 次——这是你最常面对、也最常战胜的对手。`);
  }
  if (tradeoffs.length > 0) {
    parts.push(`你为自己写下过 ${tradeoffs.length} 份得失权衡，那些都是你清醒时刻的选择。`);
  }
  parts.push("每一次克制都不容易，但每一次克制都在重塑你。你不是在'忍'，你是在'选'。继续。");
  return parts.join(" ");
}

// ===== 每日温和提醒 =====
export const DAILY_QUOTES: string[] = [
  "你不需要消灭欲望，只需要看见它，然后选择不跟它走。",
  "理智不是天生的，是一次次在冲动前停下来的练习。",
  "今晚的你，会比昨晚的你更有力量一点。",
  "短暂的快感会过去，但你坚持下来的样子会留下。",
  "温柔对待自己，但别放过每一次成长的机会。",
  "你不是在和欲望打仗，你是在把方向盘抢回自己手里。",
];

export function dailyQuote(): string {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_QUOTES[day % DAILY_QUOTES.length];
}
