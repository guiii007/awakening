import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL, DEEPSEEK_MODEL, ALIYUN_API_KEY, ALIYUN_IMAGE_API_URL, ALIYUN_IMAGE_MODEL } from "@/lib/config";

export interface DailyQuote {
  id: string;
  imagePrompt: string;
  title: string;
  quote: string;
  author: string;
  category: string;
}

// 作为兜底的静态日签（AI 生成失败时使用）
const FALLBACK_QUOTES: DailyQuote[] = [
  {
    id: "fb1",
    imagePrompt: "Serene mountain landscape at sunrise with misty valleys and golden light",
    title: "山高水长",
    quote: "人生不是一条直线，而是一座需要攀登的山。每一步都算数，即使走得慢。",
    author: "山中哲人",
    category: "nature",
  },
  {
    id: "fb2",
    imagePrompt: "Gentle ocean waves at sunset with soft orange and pink sky",
    title: "心若止水",
    quote: "情绪像海浪一样来来去去，而你是那片承载一切的海洋。",
    author: "海的女儿",
    category: "nature",
  },
  {
    id: "fb3",
    imagePrompt: "Lotus flower emerging from muddy water with dewdrops",
    title: "出淤泥而不染",
    quote: "即使身处困境，你也可以选择保持内心的纯净与高贵。",
    author: "周敦颐",
    category: "inspiration",
  },
  {
    id: "fb4",
    imagePrompt: "Beautiful forest path with sunlight streaming through trees",
    title: "路在脚下",
    quote: "重要的不是目的地，而是沿途的风景和看风景的心情。",
    author: "佚名",
    category: "nature",
  },
  {
    id: "fb5",
    imagePrompt: "Moonlit night with stars and calm lake reflection",
    title: "静思冥想",
    quote: "在喧嚣中保持宁静，在混乱中找到秩序。",
    author: "佚名",
    category: "philosophy",
  },
];

function getFallbackQuote(): DailyQuote {
  const idx = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[idx];
}

// 用 DeepSeek AI 生成日签内容
export async function generateAIQuote(): Promise<DailyQuote> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "system",
            content: `你是一款叫「觉醒」的自控力训练 App 的日签生成器。每次用户抽取日签时，你需要生成一段温暖的、与自控、觉察、成长相关的短句。

要求：
- 每次生成的内容必须不同，要丰富多样
- 可以涉及自然、哲学、生活感悟、内心成长等主题
- 配文要温暖有力量，不要说教
- 标题用 2-4 个汉字
- 配文 1-2 句话，30-60 字
- 作者可以是一位与主题相关的名人（真实存在的），或写"佚名"
- image_prompt 用英文描述一个与主题相关的画面，适合生成像素风格插画

必须严格按以下 JSON 格式返回，不要加任何其他文字：
{"title":"标题","quote":"配文","author":"作者","category":"分类","image_prompt":"英文画面描述"}`,
          },
          {
            role: "user",
            content: `请生成一张新的日签。主题随机，风格多样，不要重复之前的内容。随机种子：${Date.now()}`,
          },
        ],
        temperature: 1.2,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("空响应");

    // 尝试从返回内容中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("格式解析失败");

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      id: `ai-${Date.now()}`,
      title: parsed.title || "日签",
      quote: parsed.quote || "",
      author: parsed.author || "佚名",
      category: parsed.category || "inspiration",
      imagePrompt: parsed.image_prompt || "Peaceful nature scene with warm light",
    };
  } catch (e) {
    console.warn("AI 日签生成失败，使用兜底内容:", e);
    return getFallbackQuote();
  }
}

export async function generateImageUrl(prompt: string): Promise<string> {
  const pixelPrompt = `${prompt}, pixel art style, 8-bit retro game aesthetic, nostalgic, cute, warm colors, pixelated, low resolution, retro graphics`;

  if (!ALIYUN_API_KEY) {
    throw new Error("阿里云 API Key 未配置");
  }

  try {
    // 万相2.6 同步调用
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(ALIYUN_IMAGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ALIYUN_API_KEY}`,
      },
      body: JSON.stringify({
        model: ALIYUN_IMAGE_MODEL,
        input: {
          messages: [
            {
              role: "user",
              content: [
                { text: pixelPrompt },
              ],
            },
          ],
        },
        parameters: {
          size: "1920*1080",
          n: 1,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`万相图片生成失败: ${res.status} ${errText}`);
    }

    const data = await res.json();

    // wan2.6 同步返回格式
    const imageUrl = data.output?.results?.[0]?.url
      || data.output?.results?.[0]?.b64_image;

    if (!imageUrl) {
      // 可能是异步返回，需要轮询
      const taskId = data.output?.task_id;
      if (taskId) {
        return await pollTaskResult(taskId);
      }
      throw new Error("万相返回空图片 URL");
    }

    return imageUrl;
  } catch (e) {
    console.warn("万相图片生成异常:", e);
    throw e;
  }
}

// 异步轮询任务结果
async function pollTaskResult(taskId: string): Promise<string> {
  const pollUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
  const maxAttempts = 30;
  const interval = 3000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, interval));

    const res = await fetch(pollUrl, {
      headers: {
        Authorization: `Bearer ${ALIYUN_API_KEY}`,
      },
    });

    if (!res.ok) continue;

    const data = await res.json();
    const status = data.output?.task_status;

    if (status === "SUCCEEDED") {
      const imageUrl = data.output?.results?.[0]?.url
        || data.output?.results?.[0]?.b64_image;
      if (imageUrl) return imageUrl;
      throw new Error("万相任务成功但无图片 URL");
    }

    if (status === "FAILED") {
      throw new Error(`万相任务失败: ${data.output?.message || "未知错误"}`);
    }
    // PENDING / RUNNING 继续轮询
  }

  throw new Error("万相图片生成超时");
}
