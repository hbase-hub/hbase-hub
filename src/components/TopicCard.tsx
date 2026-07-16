import { Card, Tag, Typography, Button } from 'antd'
import { PlayCircleOutlined, GithubOutlined } from '@ant-design/icons'
import type { Topic } from '../types'
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '../data/fallback'

const { Title, Paragraph, Text } = Typography

interface TopicCardProps {
  topic: Topic
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Card
      hoverable
      onClick={() => window.open(topic.demoUrl, '_blank', 'noreferrer')}
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 16 } }}
      style={{ height: '100%', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Tag color="#0a7c5a" style={{ margin: 0, fontFamily: 'monospace', fontWeight: 700 }}>
            #{String(topic.number).padStart(2, '0')}
          </Tag>
          {topic.deprecated && <Tag style={{ margin: 0 }}>已归档</Tag>}
        </div>
        <Tag color={DIFFICULTY_COLOR[topic.difficulty]} style={{ margin: 0 }}>
          {DIFFICULTY_LABEL[topic.difficulty]}
        </Tag>
      </div>

      <Title level={5} style={{ marginTop: 4, marginBottom: 4 }}>
        {topic.title}
      </Title>
      <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ marginBottom: 8, fontSize: 13, flex: 1 }}>
        {topic.summary}
      </Paragraph>

      {topic.tags.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {topic.tags.slice(0, 4).map((t) => (
            <Tag key={t} style={{ marginInlineEnd: 4, fontFamily: 'monospace', fontSize: 11 }}>
              {t}
            </Tag>
          ))}
          {topic.tags.length > 4 && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              +{topic.tags.length - 4}
            </Text>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
        <Button
          type="primary"
          size="small"
          block
          icon={<PlayCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            window.open(topic.demoUrl, '_blank', 'noreferrer')
          }}
        >
          在线演示
        </Button>
        <Button
          size="small"
          icon={<GithubOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            window.open(topic.repoUrl, '_blank', 'noreferrer')
          }}
        >
          源码
        </Button>
      </div>
    </Card>
  )
}
