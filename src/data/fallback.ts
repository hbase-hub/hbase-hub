import type { HubIndex, Difficulty } from '../types'

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '深入',
}

// antd Tag 预设色名
export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: 'green',
  intermediate: 'gold',
  advanced: 'red',
}

// 当运行时 fetch hbase-index 失败时使用，保证页面不白屏。
// 仅含分类摘要（与 hbase-index/index.json 保持一致），topics 为空。
export const FALLBACK_INDEX: HubIndex = {
  version: 0,
  updatedAt: 'fallback',
  categories: [
    { id: 'architecture', label: '架构总览', description: 'HBase 整体架构与核心组件角色', order: 1 },
    { id: 'data-model', label: '数据模型', description: 'Namespace / Table / CF / RowKey / Cell 多维数据模型', order: 2 },
    { id: 'storage-engine', label: '存储引擎', description: 'LSM-Tree / MemStore / WAL / HFile / Compaction 存储底座', order: 3 },
    { id: 'region', label: 'Region 管理', description: 'Region 分配 / 分裂 / 合并 / 负载均衡 / 定位', order: 4 },
    { id: 'io-path', label: '读写路径', description: '写路径 / 读路径 / MVCC / Scan 端到端流程', order: 5 },
    { id: 'coprocessor', label: '协处理器与高级特性', description: 'Observer / Endpoint / BulkLoad / 二级索引', order: 6 },
    { id: 'client', label: '客户端与 API', description: 'Java 客户端 / Shell / REST / Thrift / 连接池', order: 7 },
    { id: 'ops', label: '运维与调优', description: '宕机恢复 / 快照 / 复制 / 分裂策略 / JVM 调优', order: 8 },
  ],
  topics: [],
}
