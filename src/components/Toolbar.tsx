import type { Category } from '../types'

interface ToolbarProps {
  query: string
  onQueryChange: (v: string) => void
  categories: Category[]
  activeCategory: string | 'all'
  onCategoryChange: (v: string | 'all') => void
  matchCount: number
  totalCount: number
}

export function Toolbar({
  query,
  onQueryChange,
  categories,
  activeCategory,
  onCategoryChange,
  matchCount,
  totalCount,
}: ToolbarProps) {
  const ordered = [...categories].sort((a, b) => a.order - b.order)
  return (
    <div className="sticky top-0 z-20 -mx-6 mb-2 border-b border-slate-200 bg-white/85 px-6 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="搜索标题、简介或标签…"
              aria-label="搜索知识点"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-hbase-500 focus:ring-2 focus:ring-hbase-200"
            />
          </div>
          <div className="hidden whitespace-nowrap text-xs text-slate-500 sm:block">
            匹配 <span className="font-semibold text-slate-700">{matchCount}</span> /{' '}
            {totalCount}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CategoryTab
            active={activeCategory === 'all'}
            onClick={() => onCategoryChange('all')}
            label="全部"
          />
          {ordered.map((c) => (
            <CategoryTab
              key={c.id}
              active={activeCategory === c.id}
              onClick={() => onCategoryChange(c.id)}
              label={c.label}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryTab({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-full px-3 py-1 text-xs font-medium transition ' +
        (active
          ? 'bg-hbase-600 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
      }
    >
      {label}
    </button>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="m18 18-4-4m1-5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
