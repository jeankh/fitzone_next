'use client'
import { motion } from 'framer-motion'
import { Clock, ArrowLeft, ArrowRight, Tag, Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLanguage } from '../context/LanguageContext'
import { BLOG_POSTS } from '../lib/blog-posts'

export default function BlogPage({ initialPosts }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [posts, setPosts] = useState(initialPosts || BLOG_POSTS)
  const { lang, t } = useLanguage()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (!initialPosts) {
      fetch('/api/admin/blogs')
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setPosts(data) })
        .catch((e) => console.error('Failed to load blogs:', e))
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
    if (debouncedQuery === '') return matchesCategory
    const q = debouncedQuery.toLowerCase()
    const titleEn  = (typeof post.title   === 'object' ? post.title?.en   : post.title   || '').toLowerCase()
    const titleAr  = (typeof post.title   === 'object' ? post.title?.ar   : '').toLowerCase()
    const excEn    = (typeof post.excerpt === 'object' ? post.excerpt?.en : post.excerpt || '').toLowerCase()
    const excAr    = (typeof post.excerpt === 'object' ? post.excerpt?.ar : '').toLowerCase()
    const bodyEn = (typeof post.content === 'object' ? post.content?.en : post.content || '').toLowerCase()
    const bodyAr = (typeof post.content === 'object' ? post.content?.ar : '').toLowerCase()
    const matchesSearch = titleEn.includes(q) || titleAr.includes(q) || excEn.includes(q) || excAr.includes(q) || bodyEn.includes(q) || bodyAr.includes(q)
    return matchesCategory && matchesSearch
  })

  const isFiltering = debouncedQuery !== '' || activeCategory !== 'all'
  const featuredPosts = isFiltering ? [] : posts.filter(post => post.featured)
  const regularPosts  = isFiltering
    ? filteredPosts
    : filteredPosts.filter(post => !post.featured)

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
              onPaste={(e) => { setTimeout(() => setSearchQuery(e.target.value), 0) }}
              onInput={(e) => setSearchQuery(e.target.value)}
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
        {activeCategory === 'all' && debouncedQuery === '' && (
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
                  <div className={`overflow-hidden ${index === 0 ? 'h-64 lg:h-80' : 'h-48'}`}>
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title[lang]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center">
                        <span className="text-5xl opacity-30">💪</span>
                      </div>
                    )}
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
          {activeCategory === 'all' && debouncedQuery === '' && (
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
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title[lang]}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center">
                          <span className="text-4xl opacity-30">💪</span>
                        </div>
                      )}
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

      </div>
    </div>
  )
}
