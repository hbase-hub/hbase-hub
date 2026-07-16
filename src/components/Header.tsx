import type { ReactNode } from 'react'
import { Typography } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import type { LoadState } from '../lib/useHubIndex'
import { HERO_GRADIENT } from '../styles/theme'

const { Title } = Typography

interface HeaderProps {
  topicCount: number
  categoryCount: number
  state: LoadState
  updatedAt: string | null
}

const chipStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#e6fffa',
  borderRadius: 8,
}

export function Header({ topicCount, categoryCount, state, updatedAt }: HeaderProps) {
  return (
    <header
      style={{
        background: HERO_GRADIENT,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.12,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '64px 24px 56px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 24 }}>
          <a
            href="https://github.com/hbase-hub"
            target="_blank"
            rel="noreferrer noopener"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, ...chipStyle }}
          >
            <GithubOutlined /> hbase-hub
          </a>
          <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 13, ...chipStyle }}>
            38 个知识点 · 8 个分类 · 逐帧动画讲解
          </span>
        </div>

        <Title level={1} style={{ color: '#fff', marginTop: 0, fontSize: 44, fontWeight: 800 }}>
          HBase 动画演示
        </Title>
        <p style={{ maxWidth: 760, fontSize: 16, lineHeight: 1.8, color: '#e6fffa', margin: 0 }}>
          以交互式动画拆解 HBase 核心原理：从架构总览、存储引擎、读写路径，到 Region 管理、协处理器与运维调优。每个知识点一个独立可部署的演示。
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32, alignItems: 'center' }}>
          <StatChip value={topicCount} label="知识点" />
          <StatChip value={categoryCount} label="分类" />
          {updatedAt && <Chip>索引更新于 {updatedAt}</Chip>}
          {state === 'fallback' && (
            <span
              style={{
                background: 'rgba(251,191,36,0.2)',
                color: '#fde68a',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                border: '1px solid rgba(251,191,36,0.4)',
              }}
            >
              离线模式：实时索引获取失败，正在使用本地副本
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

function StatChip({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '8px 16px', ...chipStyle }}>
      <span style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: 12, color: '#e6fffa' }}>{label}</span>
    </div>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return <span style={{ padding: '8px 12px', fontSize: 12, ...chipStyle }}>{children}</span>
}
