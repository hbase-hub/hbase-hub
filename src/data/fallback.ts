import type { HubIndex, Difficulty } from '../types'

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '深入',
}

export const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  beginner: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  intermediate: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  advanced: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

// 当运行时 fetch hbase-index 失败时使用，保证页面不白屏。
// 仅含分类与标题摘要，按钮链接按命名规则兜底生成。
export const FALLBACK_INDEX: HubIndex = {
  version: 0,
  updatedAt: 'fallback',
  categories: [
    { id: 'architecture', label: '架构总览', description: 'HBase 整体架构与核心组件角色', order: 1 },
    { id: 'data-model', label: '数据模型', description: '表、RowKey、列族与版本', order: 2 },
    { id: 'storage-engine', label: '存储引擎', description: 'MemStore、HFile、WAL 与 BlockCache', order: 3 },
    { id: 'region', label: 'Region 管理', description: 'Region 分裂、合并与负载均衡', order: 4 },
    { id: 'read-write', label: '读写路径', description: '读写链路、MVCC 与 Scan', order: 5 },
    { id: 'coprocessor', label: '协处理器与高级特性', description: 'Observer、Endpoint 与二级索引', order: 6 },
    { id: 'client', label: '客户端与 API', description: '连接、过滤与 BulkLoad', order: 7 },
    { id: 'ops', label: '运维与调优', description: '监控、诊断与性能优化', order: 8 },
  ],
  topics: [],
}
