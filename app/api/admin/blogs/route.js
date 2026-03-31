import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const kv = Redis.fromEnv()
const KV_KEY = 'fitzone_blogs'

const SEED_POSTS = [
  {
    id: '1',
    title: { ar: '١٠ أخطاء شائعة في التغذية تمنعك من خسارة الوزن', en: '10 Common Nutrition Mistakes Preventing Weight Loss' },
    excerpt: { ar: 'اكتشف الأخطاء التي يرتكبها معظم الناس عند محاولة إنقاص الوزن وكيف تتجنبها.', en: 'Discover the mistakes most people make when trying to lose weight and how to avoid them.' },
    category: 'nutrition',
    readTime: { ar: '٥ دقائق', en: '5 min read' },
    date: '2024-03-15',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop',
    featured: true,
    content: {
      ar: `هل تبذل جهداً كبيراً في حميتك الغذائية ولكن لا ترى النتائج المرجوة؟ قد تكون ترتكب أحد هذه الأخطاء الشائعة.

## ١. تخطي وجبة الإفطار
يعتقد الكثيرون أن تخطي الإفطار يساعد في خسارة الوزن، لكن العكس صحيح.

## ٢. عدم شرب كمية كافية من الماء
الماء ضروري لعملية الأيض وحرق الدهون. اشرب على الأقل ٨ أكواب يومياً.

## ٣. الاعتماد على الأطعمة "قليلة الدهون"
كثير من الأطعمة المصنفة "قليلة الدهون" تحتوي على سكر مضاف.

## ٤. عدم حساب السعرات الحرارية
تتبع ما تأكله لتفهم استهلاكك الفعلي.

## ٥. إهمال البروتين
البروتين يزيد الشعور بالشبع ويساعد في بناء العضلات.`,
      en: `Are you putting in effort with your diet but not seeing results? You might be making one of these common mistakes.

## 1. Skipping Breakfast
Many believe skipping breakfast helps with weight loss, but the opposite is true.

## 2. Not Drinking Enough Water
Water is essential for metabolism and fat burning. Drink at least 8 glasses daily.

## 3. Relying on "Low-Fat" Foods
Many "low-fat" foods contain added sugar to compensate for flavor.

## 4. Not Counting Calories
Track what you eat to understand your actual consumption.

## 5. Neglecting Protein
Protein increases feelings of fullness and helps build muscle.`,
    },
  },
  {
    id: '2',
    title: { ar: 'أفضل ٥ تمارين لحرق الدهون في المنزل', en: 'Top 5 Fat-Burning Home Exercises' },
    excerpt: { ar: 'تمارين فعالة يمكنك ممارستها في المنزل بدون معدات لحرق الدهون.', en: 'Effective exercises you can do at home without equipment to burn fat.' },
    category: 'workout',
    readTime: { ar: '٧ دقائق', en: '7 min read' },
    date: '2024-03-12',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop',
    featured: true,
    content: {
      ar: 'هذه التمارين الخمسة هي الأفضل لحرق الدهون في المنزل دون الحاجة لمعدات.',
      en: 'These five exercises are the best for burning fat at home without any equipment.',
    },
  },
  {
    id: '3',
    title: { ar: 'كيف تبني عادات صحية تدوم مدى الحياة', en: 'How to Build Healthy Habits That Last a Lifetime' },
    excerpt: { ar: 'دليل عملي لبناء عادات صحية مستدامة تصبح جزءاً من حياتك اليومية.', en: 'A practical guide to building sustainable healthy habits that become part of your daily life.' },
    category: 'lifestyle',
    readTime: { ar: '٦ دقائق', en: '6 min read' },
    date: '2024-03-10',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=500&fit=crop',
    featured: true,
    content: {
      ar: 'بناء العادات الصحية يتطلب الاتساق والصبر. ابدأ بخطوات صغيرة وزد تدريجياً.',
      en: 'Building healthy habits requires consistency and patience. Start small and gradually increase.',
    },
  },
]

async function getBlogs() {
  try {
    const data = await kv.get(KV_KEY)
    if (!data) {
      // Seed on first load
      await kv.set(KV_KEY, JSON.stringify(SEED_POSTS))
      return SEED_POSTS
    }
    return typeof data === 'string' ? JSON.parse(data) : data
  } catch {
    return SEED_POSTS
  }
}

export async function GET() {
  const posts = await getBlogs()
  return NextResponse.json(posts)
}

export async function POST(request) {
  try {
    const post = await request.json()
    const posts = await getBlogs()

    if (post.id) {
      // Update existing
      const idx = posts.findIndex(p => p.id === post.id)
      if (idx >= 0) posts[idx] = post
      else posts.unshift(post)
    } else {
      // Create new — generate id
      post.id = Date.now().toString()
      posts.unshift(post)
    }

    await kv.set(KV_KEY, JSON.stringify(posts))
    return NextResponse.json({ ok: true, id: post.id })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const posts = await getBlogs()
    const filtered = posts.filter(p => p.id !== id)
    await kv.set(KV_KEY, JSON.stringify(filtered))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
