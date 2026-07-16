import type { Topic } from '../types'
import { DIFFICULTY_LABEL, DIFFICULTY_STYLE } from '../data/fallback'

interface TopicCardProps {
  topic: Topic
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <a
      href={topic.demoUrl}
      target="_blank"
      rel="noreferrer noopener"
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-card transition duration-200 hover:-translate-y-1 hover:border-hbase-300 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-hbase-50 px-2 py-0.5 font-mono text-xs font-bold text-hbase-700 ring-1 ring-hbase-200">
            #{String(topic.number).padStart(2, '0')}
          </span>
          {topic.deprecated && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              已归档
            </span>
          )}
        </div>
        <span
          className={
            'rounded-md px-2 py-0.5 text-[11px] font-semibold ' +
            DIFFICULTY_STYLE[topic.difficulty]
          }
        >
          {DIFFICULTY_LABEL[topic.difficulty]}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900 transition group-hover:text-hbase-700">
        {topic.title}
      </h3>

      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
        {topic.summary}
      </p>

      {topic.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topic.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500"
            >
              {t}
            </span>
          ))}
          {topic.tags.length > 4 && (
            <span className="px-1 text-[11px] text-slate-400">
              +{topic.tags.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-hbase-600 px-3 py-1.5 text-xs font-semibold text-white transition group-hover:bg-hbase-700">
          <PlayIcon className="h-3.5 w-3.5" />
          在线演示
        </span>
        <span
          role="link"
          tabIndex={-1}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            window.open(topic.repoUrl, '_blank', 'noreferrer')
          }}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
        >
          源码
        </span>
      </div>
    </a>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M6 4.5v11a.5.5 0 0 0 .76.43l9-5.5a.5.5 0 0 0 0-.86l-9-5.5A.5.5 0 0 0 6 4.5Z" />
    </svg>
  )
}
