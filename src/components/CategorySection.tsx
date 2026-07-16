import type { Category, Topic } from '../types'
import { TopicCard } from './TopicCard'

interface CategorySectionProps {
  category: Category
  topics: Topic[]
}

export function CategorySection({ category, topics }: CategorySectionProps) {
  if (topics.length === 0) return null
  return (
    <section className="scroll-mt-32" id={`category-${category.id}`}>
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-xl font-bold text-slate-900">{category.label}</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {topics.length} 个知识点
        </span>
      </div>
      {category.description && (
        <p className="mb-4 -mt-2 text-sm text-slate-500">{category.description}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {topics.map((t) => (
          <TopicCard key={t.id} topic={t} />
        ))}
      </div>
    </section>
  )
}
