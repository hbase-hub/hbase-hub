import { Input, Segmented, Typography } from 'antd'
import type { Category } from '../types'

const { Text } = Typography

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
  const options = [
    { label: '全部', value: 'all' },
    ...ordered.map((c) => ({ label: c.label, value: c.id })),
  ]

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 0',
        marginBottom: 24,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Input.Search
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="搜索标题、简介或标签…"
            allowClear
            enterButton={false}
            style={{ maxWidth: 480, flex: 1, minWidth: 240 }}
          />
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            匹配 <Text strong>{matchCount}</Text> / {totalCount}
          </Text>
        </div>
        <Segmented
          options={options}
          value={activeCategory}
          onChange={(v) => onCategoryChange(v as string | 'all')}
          size="middle"
        />
      </div>
    </div>
  )
}
