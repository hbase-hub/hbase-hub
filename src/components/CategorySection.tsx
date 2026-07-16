import { Row, Col, Tag, Typography } from 'antd'
import type { Category, Topic } from '../types'
import { TopicCard } from './TopicCard'

const { Title, Paragraph } = Typography

interface CategorySectionProps {
  category: Category
  topics: Topic[]
}

export function CategorySection({ category, topics }: CategorySectionProps) {
  if (topics.length === 0) return null
  return (
    <section id={`category-${category.id}`} style={{ scrollMarginTop: 140 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <Title level={3} style={{ margin: 0 }}>
          {category.label}
        </Title>
        <Tag color="green" style={{ margin: 0 }}>
          {topics.length} 个知识点
        </Tag>
      </div>
      {category.description && (
        <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 16 }}>
          {category.description}
        </Paragraph>
      )}
      <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
        {topics.map((t) => (
          <Col key={t.id} xs={24} sm={12} lg={8} xl={6}>
            <TopicCard topic={t} />
          </Col>
        ))}
      </Row>
    </section>
  )
}
