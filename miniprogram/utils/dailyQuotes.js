const QUOTES = [
  {
    id: '1',
    imagePrompt: 'Serene mountain landscape at sunrise with misty valleys and golden light',
    title: '山高水长',
    quote: '人生不是一条直线，而是一座需要攀登的山。每一步都算数，即使走得慢。',
    author: '山中哲人',
    category: 'nature',
  },
  {
    id: '2',
    imagePrompt: 'Gentle ocean waves at sunset with soft orange and pink sky',
    title: '心若止水',
    quote: '情绪像海浪一样来来去去，而你是那片承载一切的海洋。',
    author: '海的女儿',
    category: 'nature',
  },
  {
    id: '3',
    imagePrompt: 'Ancient philosopher sitting under an olive tree in Greece',
    title: '自知者明',
    quote: '认识你自己，是一切智慧的开始。',
    author: '苏格拉底',
    category: 'philosophy',
  },
  {
    id: '4',
    imagePrompt: 'Buddha meditating under a bodhi tree with soft sunlight filtering through leaves',
    title: '正念常在',
    quote: '当下的觉察，是通往自由的钥匙。不要追逐过去，也不要担忧未来。',
    author: '佛陀',
    category: 'philosophy',
  },
  {
    id: '5',
    imagePrompt: 'Majestic eagle soaring in the blue sky with clouds',
    title: '展翅高飞',
    quote: '你比自己想象的更强大。那些看似无法跨越的障碍，只是成长的阶梯。',
    author: '佚名',
    category: 'inspiration',
  },
  {
    id: '6',
    imagePrompt: 'Lotus flower emerging from muddy water with dewdrops',
    title: '出淤泥而不染',
    quote: '即使身处困境，你也可以选择保持内心的纯净与高贵。',
    author: '周敦颐',
    category: 'inspiration',
  },
  {
    id: '7',
    imagePrompt: 'Warm cozy interior with fireplace and books in winter',
    title: '温暖于心',
    quote: '善待自己不是放纵，而是像对待你最爱的人一样对待自己。',
    author: '温暖的人',
    category: 'warmth',
  },
  {
    id: '8',
    imagePrompt: 'Child smiling with butterfly on finger in a flower field',
    title: '初心不改',
    quote: '保持一颗童心，对世界充满好奇，对自己充满善意。',
    author: '佚名',
    category: 'warmth',
  },
  {
    id: '9',
    imagePrompt: 'Albert Einstein writing equations on a chalkboard with focused expression',
    title: '思考的力量',
    quote: '理智不是压抑情感，而是给情感一个清晰的方向。',
    author: '爱因斯坦',
    category: 'science',
  },
  {
    id: '10',
    imagePrompt: 'Beautiful forest path with sunlight streaming through trees',
    title: '路在脚下',
    quote: '重要的不是目的地，而是沿途的风景和看风景的心情。',
    author: '佚名',
    category: 'nature',
  },
  {
    id: '11',
    imagePrompt: 'Moonlit night with stars and calm lake reflection',
    title: '静思冥想',
    quote: '在喧嚣中保持宁静，在混乱中找到秩序。',
    author: '佚名',
    category: 'nature',
  },
  {
    id: '12',
    imagePrompt: 'Ancient Chinese calligraphy with bamboo painting',
    title: '宁静致远',
    quote: '静以修身，俭以养德。非淡泊无以明志，非宁静无以致远。',
    author: '诸葛亮',
    category: 'philosophy',
  },
  {
    id: '13',
    imagePrompt: 'Martin Luther King giving speech with powerful expression',
    title: '信念的力量',
    quote: '不要让昨天的失望，毁掉今天的希望。',
    author: '马丁·路德·金',
    category: 'inspiration',
  },
  {
    id: '14',
    imagePrompt: 'Two hands holding each other with gentle touch',
    title: '人与人',
    quote: '我们都是彼此的镜子，通过理解他人，更好地理解自己。',
    author: '佚名',
    category: 'warmth',
  },
  {
    id: '15',
    imagePrompt: 'Scientist looking through microscope at beautiful cellular structures',
    title: '微观世界',
    quote: '在最微小的事物中，蕴含着最伟大的真理。',
    author: '佚名',
    category: 'science',
  },
]

function getRandomQuote() {
  const idx = Math.floor(Math.random() * QUOTES.length)
  return QUOTES[idx]
}

function getImageUrl(prompt) {
  const pixelPrompt = `${prompt}, pixel art style, 8-bit retro game aesthetic, nostalgic, cute, warm colors, pixelated, low resolution, retro graphics`
  const encoded = encodeURIComponent(pixelPrompt)
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encoded}&image_size=landscape_16_9`
}

module.exports = {
  QUOTES,
  getRandomQuote,
  getImageUrl,
}
