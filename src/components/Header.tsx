import type { LoadState } from '../lib/useHubIndex'

interface HeaderProps {
  topicCount: number
  categoryCount: number
  state: LoadState
  updatedAt: string | null
}

export function Header({ topicCount, categoryCount, state, updatedAt }: HeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-hbase-950 via-hbase-900 to-hbase-800 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a
            href="https://github.com/hbase-hub"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-medium text-hbase-100 ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
          >
            <GitHubIcon className="h-4 w-4" />
            hbase-hub
          </a>
          <span className="rounded-full bg-white/10 px-3 py-1 text-hbase-100 ring-1 ring-white/20">
            38 个知识点 · 8 个分类 · 逐帧动画讲解
          </span>
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          HBase 动画演示
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-hbase-100 sm:text-lg">
          以交互式动画拆解 HBase 核心原理：从架构总览、存储引擎、读写路径，
          到 Region 管理、协处理器与运维调优。每个知识点一个独立可部署的演示。
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <StatChip label="知识点" value={topicCount} />
          <StatChip label="分类" value={categoryCount} />
          {updatedAt && (
            <span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-hbase-100 ring-1 ring-white/20">
              索引更新于 {updatedAt}
            </span>
          )}
          {state === 'fallback' && (
            <span className="rounded-lg bg-amber-400/20 px-3 py-2 text-xs font-medium text-amber-200 ring-1 ring-amber-300/40">
              离线模式：实时索引获取失败，正在使用本地副本
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2 rounded-lg bg-white/10 px-4 py-2 ring-1 ring-white/20 backdrop-blur">
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-hbase-100">{label}</span>
    </div>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
