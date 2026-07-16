import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { Toolbar } from './components/Toolbar'
import { CategorySection } from './components/CategorySection'
import { TopicCard } from './components/TopicCard'
import { useHubIndex } from './lib/useHubIndex'

export default function App() {
  const { data, state } = useHubIndex()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all')

  const orderedCategories = useMemo(
    () => [...data.categories].sort((a, b) => a.order - b.order),
    [data.categories],
  )

  const topicsByNumber = useMemo(() => {
    const m = new Map<number, string>()
    for (const t of data.topics) m.set(t.number, t.title)
    return m
  }, [data.topics])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.topics.filter((t) => {
      if (activeCategory !== 'all' && t.category !== activeCategory) return false
      if (!q) return true
      const prereqTitles = t.prerequisites.map((n) => topicsByNumber.get(n) ?? '').join(' ')
      const haystack = [
        t.title,
        t.summary,
        t.slug,
        t.tags.join(' '),
        prereqTitles,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [data.topics, activeCategory, query, topicsByNumber])

  const updatedAt = state === 'success' && data.updatedAt ? data.updatedAt : null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        topicCount={data.topics.length}
        categoryCount={data.categories.length}
        state={state}
        updatedAt={updatedAt}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Toolbar
          query={query}
          onQueryChange={setQuery}
          categories={data.categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          matchCount={filtered.length}
          totalCount={data.topics.length}
        />

        {state === 'loading' && (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Spinner /> <span className="ml-3 text-sm">加载知识点索引…</span>
          </div>
        )}

        {state !== 'loading' && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <p className="text-sm">没有匹配的知识点。</p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setActiveCategory('all')
              }}
              className="mt-3 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300"
            >
              清除筛选
            </button>
          </div>
        )}

        {state !== 'loading' && filtered.length > 0 && activeCategory !== 'all' && (
          <CategorySection
            category={orderedCategories.find((c) => c.id === activeCategory)!}
            topics={filtered}
          />
        )}

        {state !== 'loading' && filtered.length > 0 && activeCategory === 'all' && (
          <div className="space-y-12">
            {orderedCategories.map((c) => (
              <CategorySection
                key={c.id}
                category={c}
                topics={filtered.filter((t) => t.category === c.id)}
              />
            ))}
          </div>
        )}

        {state !== 'loading' && query.trim() !== '' && filtered.length > 0 && (
          <section className="mt-12 border-t border-slate-200 pt-8">
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-xl font-bold text-slate-900">搜索结果</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                {filtered.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((t) => (
                <TopicCard key={t.id} topic={t} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-xs text-slate-400">
          <p>
            HBase 动画演示导航 · 数据源{' '}
            <a
              href="https://github.com/hbase-hub/hbase-index"
              target="_blank"
              rel="noreferrer noopener"
              className="text-hbase-600 hover:underline"
            >
              hbase-index
            </a>{' '}
            · 由{' '}
            <a
              href="https://github.com/hbase-hub"
              target="_blank"
              rel="noreferrer noopener"
              className="text-hbase-600 hover:underline"
            >
              hbase-hub
            </a>{' '}
            组织维护
          </p>
        </div>
      </footer>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-hbase-500" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
