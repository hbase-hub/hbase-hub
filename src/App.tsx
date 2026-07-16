import { useMemo, useState } from 'react'
import { Layout, Spin, Empty, Button, Typography, Row, Col } from 'antd'
import { Header } from './components/Header'
import { Toolbar } from './components/Toolbar'
import { CategorySection } from './components/CategorySection'
import { TopicCard } from './components/TopicCard'
import { useHubIndex } from './lib/useHubIndex'

const { Content } = Layout
const { Text, Link: AntLink, Title } = Typography

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
      const haystack = [t.title, t.summary, t.slug, t.tags.join(' '), prereqTitles]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [data.topics, activeCategory, query, topicsByNumber])

  const updatedAt = state === 'success' && data.updatedAt ? data.updatedAt : null

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header
        topicCount={data.topics.length}
        categoryCount={data.categories.length}
        state={state}
        updatedAt={updatedAt}
      />

      <Content style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px', width: '100%' }}>
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '96px 0' }}>
            <Spin tip="加载知识点索引…" />
          </div>
        )}

        {state !== 'loading' && filtered.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '96px 0' }}>
            <Empty description="没有匹配的知识点" />
            <Button
              type="primary"
              style={{ marginTop: 16 }}
              onClick={() => {
                setQuery('')
                setActiveCategory('all')
              }}
            >
              清除筛选
            </Button>
          </div>
        )}

        {state !== 'loading' && filtered.length > 0 && activeCategory !== 'all' && (
          <CategorySection
            category={orderedCategories.find((c) => c.id === activeCategory)!}
            topics={filtered}
          />
        )}

        {state !== 'loading' && filtered.length > 0 && activeCategory === 'all' && (
          <div>
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
          <section style={{ marginTop: 48, borderTop: '1px solid #e2e8f0', paddingTop: 32 }}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <Title level={3} style={{ margin: 0 }}>
                搜索结果
              </Title>
              <Text type="secondary">{filtered.length}</Text>
            </div>
            <Row gutter={[16, 16]}>
              {filtered.map((t) => (
                <Col key={t.id} xs={24} sm={12} lg={8} xl={6}>
                  <TopicCard topic={t} />
                </Col>
              ))}
            </Row>
          </section>
        )}
      </Content>

      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          background: '#fff',
          textAlign: 'center',
          padding: '32px 24px',
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          HBase 动画演示导航 · 数据源{' '}
          <AntLink href="https://github.com/hbase-hub/hbase-index" target="_blank" rel="noreferrer">
            hbase-index
          </AntLink>
          {' · 由 '}
          <AntLink href="https://github.com/hbase-hub" target="_blank" rel="noreferrer">
            hbase-hub
          </AntLink>
          {' 组织维护'}
        </Text>
      </footer>
    </Layout>
  )
}
