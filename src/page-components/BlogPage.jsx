'use client'
import { motion } from 'framer-motion'
import { Clock, ArrowLeft, ArrowRight, Tag, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '../context/LanguageContext'

const blogPosts = [
  {
    id: 1,
    title: { ar: '١٠ أخطاء شائعة في التغذية تمنعك من خسارة الوزن', en: '10 Common Nutrition Mistakes Preventing Weight Loss' },
    excerpt: { ar: 'اكتشف الأخطاء التي يرتكبها معظم الناس عند محاولة إنقاص الوزن وكيف تتجنبها للحصول على نتائج أفضل.', en: 'Discover the mistakes most people make when trying to lose weight and how to avoid them for better results.' },
    category: 'nutrition',
    readTime: { ar: '٥ دقائق', en: '5 min read' },
    date: { ar: '١٥ مارس ٢٠٢٤', en: 'Mar 15, 2024' },
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop',
    featured: true,
  },
  {
    id: 2,
    title: { ar: 'أفضل ٥ تمارين لحرق الدهون في المنزل', en: 'Top 5 Fat-Burning Home Exercises' },
    excerpt: { ar: 'تمارين فعالة يمكنك ممارستها في المنزل بدون معدات لحرق الدهون وبناء اللياقة البدنية.', en: 'Effective exercises you can do at home without equipment to burn fat and build fitness.' },
    category: 'workout',
    readTime: { ar: '٧ دقائق', en: '7 min read' },
    date: { ar: '١٢ مارس ٢٠٢٤', en: 'Mar 12, 2024' },
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop',
    featured: true,
  },
  {
    id: 3,
    title: { ar: 'كيف تبني عادات صحية تدوم مدى الحياة', en: 'How to Build Healthy Habits That Last a Lifetime' },
    excerpt: { ar: 'دليل عملي لبناء عادات صحية مستدامة تصبح جزءاً من حياتك اليومية بدون مجهود.', en: 'A practical guide to building sustainable healthy habits that become part of your daily life effortlessly.' },
    category: 'lifestyle',
    readTime: { ar: '٦ دقائق', en: '6 min read' },
    date: { ar: '١٠ مارس ٢٠٢٤', en: 'Mar 10, 2024' },
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=500&fit=crop',
    featured: true,
  },
  {
    id: 4,
    title: { ar: 'البروتين: كم تحتاج يومياً لبناء العضلات؟', en: 'Protein: How Much Do You Need Daily to Build Muscle?' },
    excerpt: { ar: 'حساب احتياجك اليومي من البروتين بناءً على وزنك وأهدافك الرياضية.', en: 'Calculate your daily protein needs based on your weight and fitness goals.' },
    category: 'nutrition',
    readTime: { ar: '٤ دقائق', en: '4 min read' },
    date: { ar: '٨ مارس ٢٠٢٤', en: 'Mar 8, 2024' },
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&h=500&fit=crop',
  },
  {
    id: 5,
    title: { ar: 'روتين التمارين المثالي للمبتدئين', en: 'The Perfect Workout Routine for Beginners' },
    excerpt: { ar: 'خطة تمارين أسبوعية مصممة خصيصاً للمبتدئين لبناء أساس قوي.', en: 'A weekly workout plan designed specifically for beginners to build a strong foundation.' },
    category: 'workout',
    readTime: { ar: '٨ دقائق', en: '8 min read' },
    date: { ar: '٥ مارس ٢٠٢٤', en: 'Mar 5, 2024' },
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
  },
  {
    id: 6,
    title: { ar: 'أهمية النوم في رحلة اللياقة البدنية', en: 'The Importance of Sleep in Your Fitness Journey' },
    excerpt: { ar: 'لماذا النوم الجيد أساسي للتعافي وبناء العضلات وخسارة الدهون.', en: 'Why good sleep is essential for recovery, muscle building, and fat loss.' },
    category: 'lifestyle',
    readTime: { ar: '٥ دقائق', en: '5 min read' },
    date: { ar: '٢ مارس ٢٠٢٤', en: 'Mar 2, 2024' },
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=500&fit=crop',
  },
  {
    id: 7,
    title: { ar: 'وجبات صحية سريعة التحضير للمشغولين', en: 'Quick Healthy Meals for Busy People' },
    excerpt: { ar: '١٠ وصفات صحية يمكن تحضيرها في أقل من ١٥ دقيقة للأشخاص المشغولين.', en: '10 healthy recipes you can prepare in under 15 minutes for busy people.' },
    category: 'nutrition',
    readTime: { ar: '٦ دقائق', en: '6 min read' },
    date: { ar: '٢٨ فبراير ٢٠٢٤', en: 'Feb 28, 2024' },
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=500&fit=crop',
  },
  {
    id: 8,
    title: { ar: 'كيف تتغلب على ثبات الوزن', en: 'How to Overcome a Weight Loss Plateau' },
    excerpt: { ar: 'استراتيجيات فعالة لكسر حاجز ثبات الوزن والاستمرار في التقدم.', en: 'Effective strategies to break through weight loss plateaus and keep progressing.' },
    category: 'nutrition',
    readTime: { ar: '٧ دقائق', en: '7 min read' },
    date: { ar: '٢٥ فبراير ٢٠٢٤', en: 'Feb 25, 2024' },
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=500&fit=crop',
  },
  {
    id: 9,
    title: { ar: 'تمارين الإطالة: لماذا هي مهمة؟', en: 'Stretching Exercises: Why Are They Important?' },
    excerpt: { ar: 'فوائد تمارين الإطالة للتعافي وتجنب الإصابات وتحسين المرونة.', en: 'Benefits of stretching for recovery, injury prevention, and improved flexibility.' },
    category: 'workout',
    readTime: { ar: '٤ دقائق', en: '4 min read' },
    date: { ar: '٢٢ فبراير ٢٠٢٤', en: 'Feb 22, 2024' },
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
  },
]

export default function BlogPage({ initialPosts }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState(initialPosts || blogPosts)
  const { lang, t } = useLanguage()

  useEffect(() => {
    if (!initialPosts) {
      fetch('/api/admin/blogs')
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setPosts(data) })
        .catch(() => {})
    }
  }, [initialPosts])

  const categories = [
    { id: 'all',       label: t('blogPage.all'),       count: posts.length },
    { id: 'nutrition', label: t('blogPage.nutrition'), count: posts.filter(p => p.category === 'nutrition').length },
    { id: 'workout',   label: t('blogPage.workout'),   count: posts.filter(p => p.category === 'workout').length },
    { id: 'lifestyle', label: t('blogPage.lifestyle'), count: posts.filter(p => p.category === 'lifestyle').length },
  ]

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory
    const matchesSearch = post.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt[lang].toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && (searchQuery === '' || matchesSearch)
  })

  const featuredPosts = posts.filter(post => post.featured)
  const regularPosts = filteredPosts.filter(post => !post.featured || activeCategory !== 'all')

  const getCategoryLabel = (catId) => categories.find(c => c.id === catId)?.label || catId

  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-accent-green/10 border border-accent-green/20 px-5 py-2 rounded-full mb-6">
            <span className="text-lg">📝</span>
            <span className="text-accent-green text-sm font-semibold">{t('blogPage.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            {t('blogPage.title')}
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {t('blogPage.subtitle')}
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-text-muted ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('blogPage.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-surface border border-border rounded-xl py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-brand text-white'
                    : 'bg-surface border border-border text-text-secondary hover:border-brand/30'
                }`}
              >
                {cat.label}
                <span className="mx-1 opacity-60">({cat.count})</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Featured Posts (only on 'all' category) */}
        {activeCategory === 'all' && searchQuery === '' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-6">{t('blogPage.featured')}</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className={`group bg-surface border border-border rounded-3xl overflow-hidden hover:border-brand/30 transition-all ${
                    index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`overflow-hidden ${
                    index === 0 ? 'h-64 lg:h-80' : 'h-48'
                  }`}>
                    <img
                      src={post.image}
                      alt={post.title[lang]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-brand/10 text-brand text-xs font-semibold px-3 py-1 rounded-lg">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-text-muted text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime[lang]}
                      </span>
                    </div>
                    <h3 className={`text-white font-bold mb-2 group-hover:text-brand transition-colors ${
                      index === 0 ? 'text-2xl' : 'text-lg'
                    }`}>
                      {post.title[lang]}
                    </h3>
                    <p className="text-text-secondary text-sm line-clamp-2">{post.excerpt[lang]}</p>
                    <div className="flex items-center gap-2 mt-4 text-brand text-sm font-medium">
                      <span>{t('blogPage.readMore')}</span>
                      <Arrow size={16} className={`transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {activeCategory === 'all' && searchQuery === '' && (
            <h2 className="text-2xl font-bold mb-6">{t('blogPage.allArticles')}</h2>
          )}

          {regularPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    href={`/blog/${post.id}`}
                    className="group block bg-surface border border-border rounded-2xl overflow-hidden hover:border-brand/30 hover:-translate-y-1 transition-all"
                  >
                    {/* Image */}
                    <div className="h-40 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title[lang]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-brand/10 text-brand text-xs font-semibold px-2 py-0.5 rounded">
                          {getCategoryLabel(post.category)}
                        </span>
                        <span className="text-text-muted text-xs">{post.date[lang]}</span>
                      </div>
                      <h3 className="text-white font-bold mb-2 group-hover:text-brand transition-colors line-clamp-2">
                        {post.title[lang]}
                      </h3>
                      <p className="text-text-secondary text-sm line-clamp-2 mb-3">{post.excerpt[lang]}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted text-xs flex items-center gap-1">
                          <Clock size={12} />
                          {post.readTime[lang]}
                        </span>
                        <span className="text-brand text-sm font-medium flex items-center gap-1">
                          {t('blogPage.read')}
                          <Arrow size={14} className={`transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold mb-2">{t('blogPage.noResults')}</h3>
              <p className="text-text-secondary">{t('blogPage.noResultsDesc')}</p>
            </div>
          )}
        </motion.div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-gradient-to-r from-brand/15 to-brand/5 border border-brand/20 rounded-3xl p-8 lg:p-12 text-center"
        >
          <span className="text-4xl mb-4 block">📬</span>
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">{t('blogPage.newsletter')}</h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            {t('blogPage.newsletterDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={t('blogPage.emailPlaceholder')}
              className="flex-1 bg-surface border border-border rounded-xl py-3 px-4 text-white placeholder:text-text-muted focus:outline-none focus:border-brand/50"
            />
            <button className="bg-brand text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors">
              {t('blogPage.subscribe')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
