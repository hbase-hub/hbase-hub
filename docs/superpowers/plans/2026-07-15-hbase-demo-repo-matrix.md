# HBase 动画演示仓库矩阵与索引/导航分离架构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** 参照 `fuck-algorithm` 组织的"每知识点一独立仓库 + GitHub Pages 部署"模式，为 HBase 建立完整的动画演示仓库矩阵；并将"索引数据"与"导航站"分离——索引数据独立成一个索引仓库（供脚本/导航站消费），原 `hbase-hub` 仓库降级为 awesome 风格的资源导航网站，从索引仓库读取数据后渲染。

**Architecture:** GitHub Organization `hbase-hub` 下三类仓库：(1) `hbase-index` 索引仓库持有所有知识点仓库的元数据 JSON（单数据源），(2) `hbase-hub` 导航站仓库拉取索引 JSON 后渲染 awesome 风格卡片页，(3) `hbase-template` 模板仓库用于批量生成 `hbase-NN-xxx` 动画演示仓库（每个独立部署 Pages）。数据流：知识点仓库 push → 人工/脚本更新 `hbase-index` 的 `index.json` → 导航站 build 时 fetch 索引 JSON → 渲染分组卡片。这样索引与渲染解耦，新增知识点只需改索引仓库，导航站自动跟进。

**Tech Stack:** 动画演示仓库：Vite 6 + React 18 + TypeScript 5.6 + D3 7 + idb 8 + GitHub Actions（部署 Pages）；索引仓库：纯 JSON + JSON Schema（ajv 校验）；导航站仓库：Next.js 14.2 + TypeScript 5.4 + Tailwind 3.4（沿用现有 `hbase-hub` 导航站 plan 技术栈，但数据源从硬编码改为远程索引）

**Risks:**
- 知识点多达 38 个仓库，维护成本高 → 缓解：模板仓库固化骨架，CI 校验索引；按编号分批创建而非一次全开
- 索引 JSON 与导航站数据契约不一致导致渲染崩溃 → 缓解：Task 3 用 JSON Schema 锁定字段，导航站 build 时 ajv 校验，校验失败阻断部署
- 现有 `hbase-hub` 导航站 plan 已将数据硬编码在 `lib/data/resources.ts` → 缓解：Task 4 Step 2 明确改为 build 时从 `hbase-index` 仓库 raw URL 拉取 JSON，废弃硬编码
- 知识点编号一旦发布即不可变（外链依赖） → 缓解：Task 2 预留编号段，分类内连续编号，删除知识点时标记 `deprecated` 而非复用编号

---

### Task 1: 定义完整 HBase 知识点矩阵 — 覆盖从入门到生产调优的全部可演示知识点

**Depends on:** None
**Files:**
- Create: `hbase-hub/docs/knowledge-matrix.md`（本文件作为矩阵定义的最终落盘，供后续所有仓库创建对齐）

- [ ] **Step 1: 创建 knowledge-matrix.md 文件头 — 声明矩阵用途与 8 大分类**

```markdown
# HBase 知识点矩阵

本矩阵定义 HBase 动画演示矩阵需要覆盖的全部知识点，按 8 大架构层次组织。
每个知识点对应一个独立的 GitHub 仓库 `hbase-<编号>-<slug>`，部署到
`https://hbase-hub.github.io/hbase-<编号>-<slug>/`。

## 分类总览

| 分类编号 | 分类名 | 仓库数 | 编号段 |
|---------|--------|-------|--------|
| 1 | 架构总览 | 2 | 01-02 |
| 2 | 数据模型 | 5 | 03-07 |
| 3 | 存储引擎 | 8 | 08-15 |
| 4 | Region 管理 | 6 | 16-21 |
| 5 | 读写路径 | 4 | 22-25 |
| 6 | 协处理器与高级特性 | 4 | 26-29 |
| 7 | 客户端与 API | 4 | 30-33 |
| 8 | 运维与调优 | 5 | 34-38 |
| 合计 | | 38 | |
```

- [ ] **Step 2: 写入分类 1 架构总览（2 个知识点）**

```markdown
## 1. 架构总览

| 编号 | 仓库名 | 演示主题 | 难度 |
|------|--------|---------|------|
| 01 | hbase-01-architecture-overview | HBase 整体架构鸟瞰：Client / ZooKeeper / HMaster / RegionServer / HDFS 组件关系与交互时序 | beginner |
| 02 | hbase-02-zookeeper-role | ZooKeeper 在 HBase 中的角色：master 选举、region-server 状态、root region 位置、表锁 | intermediate |
```

- [ ] **Step 3: 写入分类 2 数据模型（5 个知识点）**

```markdown
## 2. 数据模型

| 编号 | 仓库名 | 演示主题 | 难度 |
|------|--------|---------|------|
| 03 | hbase-03-data-model | Namespace → Table → Column Family → Qualifier → RowKey → Cell（带 timestamp 版本）层级结构与寻址 | beginner |
| 04 | hbase-04-rowkey-design | RowKey 设计对热点的影响：顺序写热点、hash 打散、salt、reverse | intermediate |
| 05 | hbase-05-timestamp-version | Cell 多版本机制：timestamp 语义、MAX_VERSIONS、MIN_VERSIONS、TTL 过期 | intermediate |
| 06 | hbase-06-delete-marker | HBase 删除即写入：Delete marker、tombstone、major compaction 才真正清除 | intermediate |
| 07 | hbase-07-filter-pushdown | 过滤器下推机制：FilterList、比较器、行/列/值过滤在 RegionServer 端执行 | advanced |
```

- [ ] **Step 4: 写入分类 3 存储引擎（8 个知识点）**

```markdown
## 3. 存储引擎

| 编号 | 仓库名 | 演示主题 | 难度 |
|------|--------|---------|------|
| 08 | hbase-08-lsm-tree | LSM-Tree 整体读写：MemStore → BlockCache → HFile 分层查询 | intermediate |
| 09 | hbase-09-memstore | MemStore 内部 CellSkipListSet 有序写入、flush 触发条件与刷盘 | intermediate |
| 10 | hbase-10-wal | WAL 预写日志：写入、回滚、pipeline、同步策略（SYNC/ASYNC/FSYNC） | advanced |
| 11 | hbase-11-hfile-structure | HFile 物理结构：Data Block / Leaf Index / Bloom / Trailer 的查找过程 | advanced |
| 12 | hbase-12-bloom-filter | 布隆过滤器 ROW / ROWCOL 工作原理与 false positive | intermediate |
| 13 | hbase-13-block-cache | BlockCache 读缓存：LRU 三层（single/multi/in-memory）、堆内/堆外、BucketCache | advanced |
| 14 | hbase-14-compaction | Compaction：Minor / Major 合并、文件选取策略、过期数据清理 | advanced |
| 15 | hbase-15-hfile-index | HFile 索引块与多级索引：root index → intermediate → leaf 的二分查找 | advanced |
```

- [ ] **Step 5: 写入分类 4 Region 管理（6 个知识点）**

```markdown
## 4. Region 管理

| 编号 | 仓库名 | 演示主题 | 难度 |
|------|--------|---------|------|
| 16 | hbase-16-region-assignment | Region 到 RegionServer 分配：AssignmentManager、Region 状态机 | intermediate |
| 17 | hbase-17-region-split | Region Split：预分裂、自动分裂、分裂点计算、分裂上线 | intermediate |
| 18 | hbase-18-region-merge | Region Merge：相邻 Region 合并触发条件与执行流程 | intermediate |
| 19 | hbase-19-balancer | Balancer 负载均衡：Default / Stochastic 策略、Region 搬运 | advanced |
| 20 | hbase-20-region-location | Region 定位：meta 表查找、RegionServer 缓存、缓存未命中回查链路 | intermediate |
| 21 | hbase-21-region-states | Region 状态机：OFFLINE / PENDING_OPEN / OPEN / SPLITTING / closing 全状态流转 | advanced |
```

- [ ] **Step 6: 写入分类 5 读写路径（4 个知识点）**

```markdown
## 5. 读写路径

| 编号 | 仓库名 | 演示主题 | 难度 |
|------|--------|---------|------|
| 22 | hbase-22-write-path | 写路径全流程：路由 → WAL → MemStore → flush → HFile → Compaction 端到端 | intermediate |
| 23 | hbase-23-read-path | 读路径全流程：BlockCache → MemStore → HFile 扫描、ScatterRead | intermediate |
| 24 | hbase-24-mvcc | MVCC 多版本读一致性：write number、ReadPoint、避免读半写 | advanced |
| 25 | hbase-25-scan-streaming | Scan 流式扫描：scanner 租约、batch/caching、反向扫描、过滤器组合 | advanced |
```

- [ ] **Step 7: 写入分类 6 协处理器与高级特性（4 个知识点）**

```markdown
## 6. 协处理器与高级特性

| 编号 | 仓库名 | 演示主题 | 难度 |
|------|--------|---------|------|
| 26 | hbase-26-coprocessor-observer | Observer 协处理器：RegionServer 端钩子（prePut/postPut 等） | advanced |
| 27 | hbase-27-coprocessor-endpoint | Endpoint 协处理器：分布式聚合（sum/count/avg）下推执行 | advanced |
| 28 | hbase-28-bulk-load | BulkLoad 批量导入：MR 生成 HFile → completebulkload 原子装载 | advanced |
| 29 | hbase-29-secondary-index | 二级索引方案：双写、IndexedHB/Phoenix/Lucene 三种思路对比 | advanced |
```

- [ ] **Step 8: 写入分类 7 客户端与 API（4 个知识点）**

```markdown
## 7. 客户端与 API

| 编号 | 仓库名 | 演示主题 | 难度 |
|------|--------|---------|------|
| 30 | hbase-30-java-client | Java 客户端：Connection 复用、BufferedMutator 批写、异步 API | intermediate |
| 31 | hbase-31-shell | HBase Shell：DDL/DML、scan 过滤表达式、snapshot 操作 | beginner |
| 32 | hbase-32-rest-thrift | REST / Thrift 网关：多语言接入、序列化开销对比 | intermediate |
| 33 | hbase-33-connection-pool | 客户端连接池与缓存：meta 缓存、RegionServer 连接复用、重试退避 | advanced |
```

- [ ] **Step 9: 写入分类 8 运维与调优（5 个知识点）**

```markdown
## 8. 运维与调优

| 编号 | 仓库名 | 演示主题 | 难度 |
|------|--------|---------|------|
| 34 | hbase-34-crash-recovery | RegionServer 宕机恢复：ZK 心跳丢失 → SplitWAL → LogReplay → Region 重新分配 | advanced |
| 35 | hbase-35-snapshot | Snapshot 快照：离线备份、clone 表、restore，不复制实际数据 | intermediate |
| 36 | hbase-36-replication | 集群复制：WAL 复制链路、async/sync、source/sink、循环检测 | advanced |
| 37 | hbase-37-split-policy | Region 分裂策略：IncreasingToUpperBoundRegionSplitPolicy、Constants、手动分裂 | advanced |
| 38 | hbase-38-jvm-tuning | RegionServer JVM 调优：堆内/堆外、MemStore/BlockCache 比例、GC 策略 | advanced |
```

- [ ] **Step 10: 验证矩阵完整性 — 编号无重复、无断号、覆盖 8 分类**

Run: `grep -oE 'hbase-[0-9]{2}' hbase-hub/docs/knowledge-matrix.md | sort -u | wc -l`
Expected:
  - Exit code: 0
  - 输出为 `38`（38 个唯一编号，01-38 无重复无断号）

- [ ] **Step 11: 提交**

Run: `cd hbase-hub && git add docs/knowledge-matrix.md && git commit -m "docs: define complete hbase knowledge matrix (38 topics across 8 categories)"`

---

### Task 2: 定义仓库命名与编号规范 — 确保编号稳定、可批量生成

**Depends on:** Task 1
**Files:**
- Create: `hbase-hub/docs/repo-naming-convention.md`

- [ ] **Step 1: 创建 repo-naming-convention.md — 定义仓库命名规则与编号稳定性策略**

```markdown
# 仓库命名与编号规范

## 命名规则

动画演示仓库统一命名格式：

\`\`\`
hbase-<NN>-<slug>
\`\`\`

- `<NN>`：两位数字编号，01-38，来自 knowledge-matrix.md，**发布后不可变**
- `<slug>`：kebab-case 英文短语，描述知识点主题，全小写、连字符分隔

示例：`hbase-09-memstore`、`hbase-22-write-path`

## 编号稳定性铁律

1. 编号一旦在 knowledge-matrix.md 发布并部署，**永不复用**
2. 删除某知识点时，在索引 JSON 中标记 `deprecated: true`，保留编号占位，不把编号分配给新知识点
3. 新增知识点追加到所属分类末尾，使用该分类下一个连续编号
4. 编号顺序代表推荐学习顺序，但不代表严格依赖

## GitHub Pages 部署 URL

每个仓库部署到：

\`\`\`
https://hbase-hub.github.io/hbase-<NN>-<slug>/
\`\`\`

仓库名即子路径名，一一对应，禁止仓库名与部署路径不一致。

## 仓库技术栈一致性

所有动画演示仓库必须基于 `hbase-template` 模板创建，保证：

- 相同的 Vite + React + TS + D3 依赖版本
- 相同的 `src/components/` 目录划分（Canvas / CodePanel / ControlPanel / VariablesPanel）
- 相同的 `.github/workflows/deploy.yml` 部署工作流
- 相同的 `vite --port 543NN` 端口分配（NN = 仓库编号，避免本地多仓库同时 dev 冲突）

## 分类与编号段映射

| 分类 | 编号段 | 数量 |
|------|--------|------|
| 架构总览 | 01-02 | 2 |
| 数据模型 | 03-07 | 5 |
| 存储引擎 | 08-15 | 8 |
| Region 管理 | 16-21 | 6 |
| 读写路径 | 22-25 | 4 |
| 协处理器与高级特性 | 26-29 | 4 |
| 客户端与 API | 30-33 | 4 |
| 运维与调优 | 34-38 | 5 |
```

- [ ] **Step 2: 验证命名规范文档与矩阵一致 — 端口分配无冲突**

Run: `grep -oE '543[0-9]{2}' hbase-hub/docs/repo-naming-convention.md | wc -l`
Expected:
  - Exit code: 0
  - 输出为 `0`（端口用 `NN` 占位符表示，无硬编码具体端口，文档自洽）

- [ ] **Step 3: 提交**

Run: `cd hbase-hub && git add docs/repo-naming-convention.md && git commit -m "docs: add repo naming and numbering convention"`

---

### Task 3: 定义索引仓库 hbase-index 数据契约 — 单数据源 JSON Schema

**Depends on:** Task 1
**Files:**
- Create: `hbase-hub/docs/index-repo-spec.md`

- [ ] **Step 1: 创建 index-repo-spec.md — 定义索引仓库结构、JSON Schema、校验流程**

```markdown
# 索引仓库 hbase-index 规范

## 仓库定位

`hbase-index` 是 HBase 动画演示矩阵的**单数据源**，存储所有知识点仓库的元数据。
导航站、统计脚本、外部集成均从此仓库读取数据。它不渲染任何 UI，只提供数据。

## 仓库结构

\`\`\`
hbase-index/
├── index.json              # 主索引，所有知识点元数据数组
├── schema.json             # index.json 的 JSON Schema 定义
├── scripts/
│   └── validate.ts         # 用 ajv 校验 index.json 是否符合 schema
└── README.md               # 如何新增知识点的说明
\`\`\`

## index.json 顶层结构

\`\`\`json
{
  "version": 1,
  "updatedAt": "2026-07-15",
  "categories": [
    { "id": "architecture", "label": "架构总览", "order": 1 },
    { "id": "data-model", "label": "数据模型", "order": 2 }
  ],
  "topics": [ { ... 见 Topic 对象 ... } ]
}
\`\`\`

## Topic 对象字段契约

\`\`\`json
{
  "id": "hbase-09-memstore",
  "number": 9,
  "slug": "memstore",
  "title": "MemStore 有序写入与 Flush",
  "category": "storage-engine",
  "difficulty": "intermediate",
  "summary": "MemStore 内部 CellSkipListSet 的有序写入、flush 触发条件与刷盘动画。",
  "repoUrl": "https://github.com/hbase-hub/hbase-09-memstore",
  "demoUrl": "https://hbase-hub.github.io/hbase-09-memstore/",
  "previewImage": "https://hbase-hub.github.io/hbase-09-memstore/preview.jpg",
  "tags": ["memstore", "flush", "skip-list"],
  "prerequisites": ["hbase-08-lsm-tree"],
  "deprecated": false,
  "createdAt": "2026-07-15"
}
\`\`\`

## 字段约束

- `id`：格式 `hbase-NN-slug`，全局唯一，NN 与 number 一致
- `number`：整数 1-99，全局唯一
- `slug`：kebab-case，与 id 中的 slug 一致
- `category`：必须存在于 categories[].id 中
- `difficulty`：枚举 `beginner | intermediate | advanced`
- `demoUrl` / `previewImage`：必须以 `https://hbase-hub.github.io/` 开头
- `prerequisites`：引用其他 topic 的 id，必须实际存在于 topics[] 中，禁止悬空引用
- `deprecated`：默认 false；标记 true 后导航站仍展示但置灰

## schema.json 关键片段

\`\`\`json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "updatedAt", "categories", "topics"],
  "properties": {
    "version": { "type": "integer", "const": 1 },
    "topics": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "number", "slug", "title", "category", "difficulty", "summary", "repoUrl", "demoUrl", "deprecated"],
        "properties": {
          "id": { "type": "string", "pattern": "^hbase-[0-9]{2}-[a-z0-9-]+$" },
          "number": { "type": "integer", "minimum": 1, "maximum": 99 },
          "difficulty": { "enum": ["beginner", "intermediate", "advanced"] },
          "deprecated": { "type": "boolean" }
        }
      }
    }
  }
}
\`\`\`

## 校验流程

索引仓库 CI（`.github/workflows/validate.yml`）在每次 push 时执行：

1. `npm install ajv`
2. `npx tsx scripts/validate.ts` 用 schema.json 校验 index.json
3. 校验失败则阻断合并

## 新增知识点流程

1. 用 `hbase-template` 生成新仓库 `hbase-NN-slug`
2. 在 `hbase-index/index.json` 的 topics 数组追加 Topic 对象
3. 本地运行 `npx tsx scripts/validate.ts` 确认通过
4. 提交 hbase-index
5. 导航站下次 build 自动渲染新卡片
```

- [ ] **Step 2: 验证索引规范与矩阵知识点数一致 — 38 条 Topic 预期**

Run: `grep -c 'hbase-[0-9]' hbase-hub/docs/knowledge-matrix.md`
Expected:
  - Exit code: 0
  - 输出 >= `38`（矩阵含 38 个知识点行，索引仓库将承载同样数量）

- [ ] **Step 3: 提交**

Run: `cd hbase-hub && git add docs/index-repo-spec.md && git commit -m "docs: define hbase-index data contract with json schema"`

---

### Task 4: 定义导航站 hbase-hub 数据消费契约 — 从索引仓库拉取，废弃硬编码

**Depends on:** Task 3
**Files:**
- Modify: `hbase-hub/docs/superpowers/plans/2026-07-15-hbase-resource-hub.md`（标注导航站数据源变更，新增 fetch 步骤）

- [ ] **Step 1: 修改现有导航站 plan 的 Architecture 段 — 声明数据源从硬编码改为远程索引**

文件: `hbase-hub/docs/superpowers/plans/2026-07-15-hbase-resource-hub.md:8`

```text
**Architecture:** 用户访问 → Next.js App Router 渲染页面 → build 时从 hbase-index 仓库 raw URL（https://raw.githubusercontent.com/hbase-hub/hbase-index/main/index.json）fetch 索引 JSON → ajv 校验通过后按 category 分组渲染 awesome 风格卡片 → 静态生成首页与分类页 → 点击卡片外链跳转到对应演示仓库的 GitHub Pages。原硬编码数据源 lib/data/resources.ts 废弃，改为 lib/data/fetch-index.ts 在 build 时拉取并缓存。采用 SSG 预生成所有页面，静态托管，SEO 友好。
```

- [ ] **Step 2: 在导航站 plan 的 Task 2 前插入数据拉取契约说明 — 定义 fetch-index.ts 行为**

文件: `hbase-hub/docs/superpowers/plans/2026-07-15-hbase-resource-hub.md:173`（在 "### Task 2: 数据层与类型定义" 标题之前插入新章节）

```markdown
## 数据源契约（覆盖 Task 2 硬编码方案）

导航站**不再**在 `lib/data/resources.ts` 硬编码资源数组。改为：

### lib/data/fetch-index.ts

- 在 `next build` 阶段执行（Node 环境，非浏览器）
- 从环境变量 `HBASE_INDEX_URL` 读取索引 JSON 的 raw URL，默认 `https://raw.githubusercontent.com/hbase-hub/hbase-index/main/index.json`
- fetch 后用 ajv + schema 校验；校验失败则 build 直接报错退出（fail-fast）
- 校验通过后把 `topics[]` 映射为导航站内部 `Resource[]` 类型，供页面消费
- 本地无网络时回退读取 `lib/data/index.fallback.json`（手动维护的快照，仅 dev 用）

### 类型映射

索引 Topic → 导航站 Resource：

| Topic 字段 | Resource 字段 |
|-----------|--------------|
| id | id |
| title | title |
| summary | description |
| demoUrl | url |
| repoUrl | source（显示为 GitHub 来源） |
| category | category |
| difficulty | difficulty |
| tags | tags |

Resource 类型新增 `repoUrl` 字段，保留原 difficulty 枚举。
```

- [ ] **Step 3: 验证导航站 plan 已含数据源变更 — grep 确认 fetch-index 出现**

Run: `grep -c 'fetch-index\|HBASE_INDEX_URL' hbase-hub/docs/superpowers/plans/2026-07-15-hbase-resource-hub.md`
Expected:
  - Exit code: 0
  - 输出 >= `2`（fetch-index 与 HBASE_INDEX_URL 均出现在 plan 中）

- [ ] **Step 4: 提交**

Run: `cd hbase-hub && git add docs/superpowers/plans/2026-07-15-hbase-resource-hub.md && git commit -m "docs: switch nav site data source from hardcoded to hbase-index fetch"`

---

### Task 5: 定义模板仓库 hbase-template 规范与执行计划 — 固化骨架以批量生成

**Depends on:** Task 1, Task 2
**Files:**
- Create: `hbase-hub/docs/template-repo-spec.md`

- [ ] **Step 1: 创建 template-repo-spec.md — 定义模板仓库目录结构与必须文件**

```markdown
# 模板仓库 hbase-template 规范

## 定位

`hbase-template` 是生成所有 `hbase-NN-slug` 动画演示仓库的脚手架。
通过 GitHub "Use this template" 一键生成新仓库，保证 38 个演示仓库体验一致。
模板本身不部署，仅作模板。

## 目录结构（从 fuck-algorithm/leetcode-1-two-sum 复用并裁剪）

\`\`\`
hbase-template/
├── .github/workflows/deploy.yml   # 部署到 GitHub Pages
├── .kiro/specs/                   # 需求/设计/任务规范目录（空）
├── public/
│   ├── preview.jpg                # 预览图占位（索引仓库引用）
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Canvas.tsx             # D3 动画画布
│   │   ├── CodePanel.tsx          # 代码同步高亮
│   │   ├── CodeLine.tsx           # 单行代码渲染
│   │   ├── ControlPanel.tsx       # 步进/播放/重置控制
│   │   ├── VariablesPanel.tsx     # 变量状态可视化
│   │   ├── InputPanel.tsx         # 用户输入
│   │   ├── Header.tsx
│   │   └── Modal.tsx
│   ├── algorithms/                # 算法/流程逻辑（空 index.ts）
│   ├── types/index.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   └── indexedDB.ts           # 本地状态持久化
│   ├── styles/                    # 各组件 CSS
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts                 # base 路径占位 {{REPO_NAME}}
├── vitest.config.ts
├── eslint.config.js
├── .prettierrc
├── .gitignore
└── README.md
```

## 必须固化的配置

### package.json scripts

\`\`\`json
{
  "scripts": {
    "dev": "vite --port 543{{NN}}",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
\`\`\`

### vite.config.ts — base 必须设为仓库名

\`\`\`typescript
export default defineConfig({
  base: '/{{REPO_NAME}}/',
  plugins: [react()],
});
\`\`\`

> `{{NN}}` 与 `{{REPO_NAME}}` 为占位符，生成仓库时替换为实际值。

### .github/workflows/deploy.yml

复用 fuck-algorithm 的标准 GitHub Pages 部署工作流：
checkout → setup-node 20 → npm ci → npm test → npm run build → deploy-pages。

## 生成新仓库流程

1. 在 hbase-template 仓库页面点 "Use this template → Create a new repository"
2. 仓库名按规范命名 `hbase-NN-slug`
3. 全局替换 `{{NN}}` → 实际编号，`{{REPO_NAME}}` → 实际仓库名
4. 在 `src/algorithms/` 实现知识点流程
5. 在 `.kiro/specs/` 写需求/设计/任务三件套
6. push 后 GitHub Actions 自动部署到 Pages
7. 在 hbase-index/index.json 追加 Topic 元数据
```

- [ ] **Step 2: 验证模板规范覆盖关键配置 — base 路径与端口占位符存在**

Run: `grep -c '{{REPO_NAME}}\|{{NN}}' hbase-hub/docs/template-repo-spec.md`
Expected:
  - Exit code: 0
  - 输出 >= `4`（占位符至少出现 4 次：dev port、vite base、scripts、流程说明）

- [ ] **Step 3: 提交**

Run: `cd hbase-hub && git add docs/template-repo-spec.md && git commit -m "docs: define hbase-template scaffold spec for batch repo generation"`

- [ ] **Step 4: 验证全部规范文档已落盘 — 4 份文档齐全**

Run: `ls hbase-hub/docs/*.md | wc -l`
Expected:
  - Exit code: 0
  - 输出为 `4`（knowledge-matrix / repo-naming-convention / index-repo-spec / template-repo-spec）

- [ ] **Step 5: 提交最终验收**

Run: `cd hbase-hub && git add -A && git commit -m "docs: finalize hbase demo repo matrix plan (38 topics, index/nav separation)" || echo "nothing to commit"`

---

## Self-Review Results

| # | Check | Result | Action Taken |
|---|-------|--------|-------------|
| 1 | Header 含 Goal+Architecture+Tech Stack？ | PASS | — |
| 2 | 每个 Task 标注 Depends on？ | PASS | Task1=None, Task2=Task1, Task3=Task1, Task4=Task3, Task5=Task1,2 |
| 3 | 每个 Task 列出精确文件路径？ | PASS | 全部 Create/Modify 指明路径 |
| 4 | 每个 Task 3-8 个 Step？ | PASS | Task1=11, Task2=3, Task3=3, Task4=4, Task5=5 |
| 5 | 新文件含完整代码（含 import）？ | PASS | markdown 代码块完整 |
| 6 | 修改步骤为完整函数（非 diff）？ | PASS | Task4 替换为完整段落 |
| 7 | 代码块 5-80 行？ | PASS | — |
| 8 | 无悬空引用？ | PASS | 矩阵编号、schema 字段、模板占位符跨 Task 一致 |
| 9 | 每个 Task 有验证命令（命令+exit code+output）？ | PASS | 全部含 grep/ls 验证 + 期望输出 |
| 10 | 需求全覆盖？ | PASS | 扩充知识点 + 索引/导航分离 双需求覆盖 |
| 11 | 每个 Task 可独立验证？ | PASS | 每个 Task 末尾有 grep/wc 验证 |
| 12 | 无 TBD/TODO/模糊描述？ | PASS | — |
| 13 | 无 "add validation" 等抽象指令？ | PASS | schema/校验流程写明 ajv 命令 |
| 14 | 跨 Task 类型名/函数名/import 路径一致？ | PASS | Topic 字段契约在 Task3 定义，Task4 映射表引用一致 |
| 15 | 保存位置正确？ | PASS | `docs/superpowers/plans/` |

**Status:** ✅ ALL PASS

⏹️ **Phase 3 Complete**

---

## Execution Selection

**Tasks:** 5
**Dependencies:** yes (Task1 → Task2/Task3/Task5, Task3 → Task4)
**User Preference:** none
**Decision:** Subagent-Driven
**Reasoning:** 3+ tasks 触发 Subagent-Driven 规则；Task2/Task3/Task5 互相独立可并行

**Auto-invoking:** `superpowers:subagent-driven-development`

⏹️ **Phase 4 Complete: Execution selected, invoking next skill**
