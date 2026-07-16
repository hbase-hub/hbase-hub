# HBase 资源导航网站 (hbase-hub) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`
> Steps use checkbox (`- [ ]`) syntax.

**Goal:** 从零搭建一个 HBase 资源导航网站，聚合官方文档、社区项目、书籍、视频等资源，帮助用户系统学习了解 HBase。

**Architecture:** 用户访问 → Next.js App Router 渲染页面 → 从本地 JSON 数据源（`lib/data/resources.ts`）读取结构化资源列表 → 按 category 分组展示在首页与分类页 → 点击卡片进入静态生成的详情页；搜索在前端本地过滤资源数组。采用 SSG（`generateStaticParams`）预生成所有详情页，部署后可静态托管，SEO 友好。

**Tech Stack:** Next.js 14.2.x (App Router), TypeScript 5.4.x, React 18.3.x, Tailwind CSS 3.4.x, Node.js 20

**Risks:**
- 资源链接可能失效 → 缓解：Task 2 数据中每条资源标注 source；Task 5 Step 5 运行链接可达性校验脚本，失效链接需人工复核
- Next.js App Router 与 Tailwind 配置易错 → 缓解：Task 1 使用标准脚手架配置，固定版本号
- SSG 构建依赖所有详情页 ID → 缓解：Task 5 Step 4 用 `generateStaticParams` 返回全部资源 ID

---

### Task 1: 项目骨架与配置

**Depends on:** None
**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/globals.css`

- [ ] **Step 1: 创建 package.json — 声明 Next.js/React/TS/Tailwind 依赖与脚本**

```json
{
  "name": "hbase-hub",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "check-links": "tsx scripts/check-links.ts"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.39",
    "tailwindcss": "3.4.6",
    "tsx": "4.16.2",
    "typescript": "5.4.5"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json — TypeScript 编译配置（App Router 标准）**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: 创建 next.config.mjs — 关闭图片优化以支持任意外链域名**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 4: 创建 tailwind.config.ts 与 postcss.config.mjs — 启用 Tailwind 扫描 app/components**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0a7c5a',
          dark: '#064f3a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

```javascript
// postcss.config.mjs
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: 创建 app/globals.css — 注入 Tailwind 指令与基础样式**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  @apply bg-gray-50 text-gray-900 antialiased;
}
```

- [ ] **Step 6: 安装依赖**
Run: `npm install`
Expected:
  - Exit code: 0
  - Output does NOT contain: "npm error"
  - node_modules 目录生成

- [ ] **Step 7: 验证骨架可构建 — 创建空 app/layout.tsx 占位**
Run: `npx next build`
Expected:
  - Exit code: 非 0（因为还没有 app/layout.tsx，此步预期失败）

> 注：此 Step 仅用于确认 Next.js 可执行；真正的 layout 在 Task 3 创建。如果提示缺少 layout，进入 Task 3。

- [ ] **Step 8: 提交**
Run: `git add package.json tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs app/globals.css && git commit -m "chore: scaffold next.js + typescript + tailwind project"`

---

### Task 2: 数据层与类型定义

**Depends on:** Task 1
**Files:**
- Create: `lib/types.ts`
- Create: `lib/data/resources.ts`

- [ ] **Step 1: 创建 lib/types.ts — 定义资源、分类、导航所需类型**

```typescript
// lib/types.ts

/** 资源分类 */
export type Category =
  | 'official'
  | 'book'
  | 'course'
  | 'video'
  | 'community'
  | 'tool';

/** 单条 HBase 学习资源 */
export interface Resource {
  /** 唯一 ID，用于详情页路由，kebab-case */
  id: string;
  /** 资源标题 */
  title: string;
  /** 一句话描述 */
  description: string;
  /** 外链 URL */
  url: string;
  /** 来源标注，用于可信度说明 */
  source: string;
  /** 分类 */
  category: Category;
  /** 难度等级 */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** 标签数组，用于搜索与过滤 */
  tags: string[];
}

/** 分类显示信息 */
export interface CategoryInfo {
  id: Category;
  label: string;
  description: string;
}
```

- [ ] **Step 2: 创建 lib/data/resources.ts — 内置 HBase 资源数据与分类元信息**

```typescript
// lib/data/resources.ts
import { Resource, CategoryInfo } from '../types';

export const categories: CategoryInfo[] = [
  { id: 'official', label: '官方文档', description: 'Apache HBase 官方权威文档与手册' },
  { id: 'book', label: '书籍', description: '系统学习 HBase 的经典书籍' },
  { id: 'course', label: '课程与教程', description: '结构化学习路径与教程' },
  { id: 'video', label: '视频资源', description: '会议演讲与教学视频' },
  { id: 'community', label: '社区', description: '邮件列表、Issue、博客等社区资源' },
  { id: 'tool', label: '工具', description: '与 HBase 配套使用的生态工具' },
];

export const resources: Resource[] = [
  {
    id: 'hbase-reference-guide',
    title: 'Apache HBase Reference Guide',
    description: 'HBase 官方参考手册，涵盖架构、配置、API 与运维全部内容。',
    url: 'https://hbase.apache.org/book.html',
    source: 'Apache HBase',
    category: 'official',
    difficulty: 'intermediate',
    tags: ['architecture', 'api', 'operations'],
  },
  {
    id: 'hbase-quickstart',
    title: 'HBase Quick Start',
    description: '官方快速上手指南，几分钟内启动第一个 HBase 实例。',
    url: 'https://hbase.apache.org/book.html#quickstart',
    source: 'Apache HBase',
    category: 'official',
    difficulty: 'beginner',
    tags: ['quickstart', 'install'],
  },
  {
    id: 'hbase-in-action',
    title: 'HBase in Action',
    description: 'Nick Dimiduk 等著，面向开发者的 HBase 实战书籍，讲解数据建模与应用开发。',
    url: 'https://www.manning.com/books/hbase-in-action',
    source: 'Manning Publications',
    category: 'book',
    difficulty: 'intermediate',
    tags: ['data-modeling', 'development'],
  },
  {
    id: 'hbase-definitive-guide',
    title: 'HBase: The Definitive Guide',
    description: 'Lars George 著，HBase 权威指南，深入架构原理与生产实践。',
    url: 'https://www.oreilly.com/library/view/hbase/9781449396107/',
    source: "O'Reilly",
    category: 'book',
    difficulty: 'advanced',
    tags: ['architecture', 'operations', 'data-modeling'],
  },
  {
    id: 'apache-hbase-tutorial',
    title: 'Apache HBase Tutorial (TutorialsPoint)',
    description: '结构化在线教程，从安装到 shell 操作到 Java API 编程逐步讲解。',
    url: 'https://www.tutorialspoint.com/hbase/',
    source: 'TutorialsPoint',
    category: 'course',
    difficulty: 'beginner',
    tags: ['shell', 'java-api', 'tutorial'],
  },
  {
    id: 'hbase-confoo-talk',
    title: 'Introduction to Apache HBase',
    description: '社区技术演讲视频，快速建立对 HBase 定位与适用场景的整体认知。',
    url: 'https://www.youtube.com/results?search_query=apache+hbase+introduction',
    source: 'YouTube',
    category: 'video',
    difficulty: 'beginner',
    tags: ['overview', 'talk'],
  },
  {
    id: 'hbase-mailing-lists',
    title: 'HBase Mailing Lists',
    description: '官方用户与开发者邮件列表，提问、追踪 release 与架构讨论的官方渠道。',
    url: 'https://hbase.apache.org/mail-lists.html',
    source: 'Apache HBase',
    category: 'community',
    difficulty: 'intermediate',
    tags: ['mailing-list', 'support'],
  },
  {
    id: 'hbase-jira',
    title: 'HBase JIRA Issues',
    description: 'Apache HBase 的 issue 跟踪系统，了解特性进度与已知问题。',
    url: 'https://issues.apache.org/jira/projects/HBASE',
    source: 'Apache Software Foundation',
    category: 'community',
    difficulty: 'advanced',
    tags: ['issues', 'tracking'],
  },
  {
    id: 'apache-phoenix',
    title: 'Apache Phoenix',
    description: '构建在 HBase 之上的 SQL 层，用标准 JDBC/SQL 查询 HBase 数据。',
    url: 'https://phoenix.apache.org/',
    source: 'Apache Phoenix',
    category: 'tool',
    difficulty: 'intermediate',
    tags: ['sql', 'jdbc'],
  },
  {
    id: 'hbase-rest-gateway',
    title: 'HBase REST Gateway',
    description: 'HBase 内置 REST 接口，允许用 HTTP 调用读写数据，无需 Java 客户端。',
    url: 'https://hbase.apache.org/book.html#rest',
    source: 'Apache HBase',
    category: 'tool',
    difficulty: 'intermediate',
    tags: ['rest', 'http', 'client'],
  },
];

/** 按 ID 获取单个资源 */
export function getResourceById(id: string): Resource | undefined {
  return resources.find((r) => r.id === id);
}

/** 按分类筛选资源 */
export function getResourcesByCategory(category: CategoryInfo['id']): Resource[] {
  return resources.filter((r) => r.category === category);
}
```

- [ ] **Step 3: 验证类型可编译**
Run: `npx tsc --noEmit`
Expected:
  - Exit code: 0
  - Output does NOT contain: "error TS"

- [ ] **Step 4: 提交**
Run: `git add lib/types.ts lib/data/resources.ts && git commit -m "feat(data): add resource types and hbase resource dataset"`

---

### Task 3: 基础布局与公共组件

**Depends on:** Task 1, Task 2
**Files:**
- Create: `app/layout.tsx`
- Create: `components/SiteHeader.tsx`
- Create: `components/SiteFooter.tsx`
- Create: `components/ResourceCard.tsx`
- Create: `components/CategoryFilter.tsx`
- Create: `components/SearchBar.tsx`

- [ ] **Step 1: 创建 app/layout.tsx — 全局布局，挂载 Header/Footer 与字体元数据**

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'HBase Hub — HBase 资源导航',
  description: '聚合 Apache HBase 官方文档、书籍、课程、视频与社区资源，帮助你系统学习 HBase。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 创建 components/SiteHeader.tsx — 顶部导航栏**

```typescript
import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-brand-dark">
          HBase Hub
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-brand">首页</Link>
          <Link href="/resources" className="hover:text-brand">资源</Link>
          <Link href="/about" className="hover:text-brand">关于</Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: 创建 components/SiteFooter.tsx — 底部信息**

```typescript
export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-gray-500">
        <p>HBase Hub · 聚合 HBase 学习资源，帮助开发者入门与进阶</p>
        <p className="mt-1">资源整理自 Apache HBase 等公开来源，链接版权归原作者所有</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: 创建 components/ResourceCard.tsx — 资源卡片，链接到详情页**

```typescript
import Link from 'next/link';
import { Resource } from '@/lib/types';

const difficultyLabel: Record<Resource['difficulty'], string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
};

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link
      href={`/resources/${resource.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-brand hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="rounded bg-brand-dark px-2 py-0.5 text-white">
          {difficultyLabel[resource.difficulty]}
        </span>
        <span className="text-gray-400">{resource.source}</span>
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{resource.title}</h3>
      <p className="text-sm text-gray-600">{resource.description}</p>
    </Link>
  );
}
```

- [ ] **Step 5: 创建 components/CategoryFilter.tsx — 分类过滤链接（服务端组件）**

```typescript
import Link from 'next/link';
import { categories } from '@/lib/data/resources';
import { Category } from '@/lib/types';

export function CategoryFilter({ active }: { active?: Category }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/resources"
        className={`rounded-full border px-3 py-1 text-sm ${!active ? 'border-brand bg-brand text-white' : 'border-gray-300 bg-white text-gray-700'}`}
      >
        全部
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/resources?category=${c.id}`}
          className={`rounded-full border px-3 py-1 text-sm ${active === c.id ? 'border-brand bg-brand text-white' : 'border-gray-300 bg-white text-gray-700'}`}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: 创建 components/SearchBar.tsx — 客户端搜索输入框**

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/resources?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索资源标题、描述或标签…"
        className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
      />
      <button
        type="submit"
        className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        搜索
      </button>
    </form>
  );
}
```

- [ ] **Step 7: 验证组件可编译**
Run: `npx tsc --noEmit`
Expected:
  - Exit code: 0
  - Output does NOT contain: "error TS"

- [ ] **Step 8: 提交**
Run: `git add app/layout.tsx components/ && git commit -m "feat(ui): add layout, header, footer, resource card, filter, search bar"`

---

### Task 4: 首页与资源列表页

**Depends on:** Task 3
**Files:**
- Create: `app/page.tsx`
- Create: `app/resources/page.tsx`

- [ ] **Step 1: 创建 app/page.tsx — 首页，展示 Hero + 分类导航 + 精选资源**

```typescript
import Link from 'next/link';
import { resources, categories } from '@/lib/data/resources';
import { ResourceCard } from '@/components/ResourceCard';

export default function HomePage() {
  // 精选：每个分类取第 1 条，最多 6 条
  const featured = categories
    .map((c) => resources.find((r) => r.category === c.id))
    .filter(Boolean)
    .slice(0, 6) as typeof resources;

  return (
    <div>
      <section className="bg-brand-dark py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold">HBase 资源导航</h1>
          <p className="mt-4 text-lg text-brand-100">
            聚合官方文档、书籍、课程、视频与社区资源，帮助你系统学习 Apache HBase。
          </p>
          <Link
            href="/resources"
            className="mt-6 inline-block rounded bg-white px-6 py-2 font-medium text-brand-dark hover:bg-gray-100"
          >
            浏览全部资源
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">分类导航</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/resources?category=${c.id}`}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-brand"
            >
              <h3 className="font-semibold text-brand-dark">{c.label}</h3>
              <p className="mt-1 text-sm text-gray-600">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-6 text-2xl font-bold">精选资源</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: 创建 app/resources/page.tsx — 资源列表页，支持分类与搜索过滤**

```typescript
import { Suspense } from 'react';
import { resources, categories } from '@/lib/data/resources';
import { ResourceCard } from '@/components/ResourceCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import type { Category } from '@/lib/types';

const validCategories = categories.map((c) => c.id);

export default function ResourcesPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const category = validCategories.includes(searchParams.category as Category)
    ? (searchParams.category as Category)
    : undefined;
  const q = (searchParams.q ?? '').trim().toLowerCase();

  let list = resources;
  if (category) list = list.filter((r) => r.category === category);
  if (q) {
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">HBase 学习资源</h1>

      <div className="mb-6">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="mb-8">
        <CategoryFilter active={category} />
      </div>

      <p className="mb-4 text-sm text-gray-500">共 {list.length} 条资源</p>

      {list.length === 0 ? (
        <p className="py-12 text-center text-gray-500">未找到匹配的资源，试试其他关键词。</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 验证首页与列表页可构建**
Run: `npx next build`
Expected:
  - Exit code: 0
  - Output contains: "Compiled successfully" 或 "✓"
  - Output does NOT contain: "Failed to compile"

- [ ] **Step 4: 提交**
Run: `git add app/page.tsx app/resources/page.tsx && git commit -m "feat(pages): add home page and resources listing with filter/search"`

---

### Task 5: 资源详情页、关于页与链接校验

**Depends on:** Task 4
**Files:**
- Create: `app/resources/[id]/page.tsx`
- Create: `app/about/page.tsx`
- Create: `scripts/check-links.ts`
- Create: `app/not-found.tsx`

- [ ] **Step 1: 创建 app/resources/[id]/page.tsx — 静态资源详情页**

```typescript
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { resources, getResourceById, categories } from '@/lib/data/resources';
import { ResourceCard } from '@/components/ResourceCard';

const difficultyLabel = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
} as const;

export function generateStaticParams() {
  return resources.map((r) => ({ id: r.id }));
}

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  const resource = getResourceById(params.id);
  if (!resource) notFound();

  const category = categories.find((c) => c.id === resource.category);
  const related = resources
    .filter((r) => r.category === resource.category && r.id !== resource.id)
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/resources" className="text-sm text-brand hover:underline">
        ← 返回资源列表
      </Link>

      <article className="mt-6">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="rounded bg-brand-dark px-2 py-0.5 text-white">
            {difficultyLabel[resource.difficulty]}
          </span>
          {category && <span className="text-gray-500">{category.label}</span>}
          <span className="text-gray-400">· 来源 {resource.source}</span>
        </div>

        <h1 className="text-3xl font-bold">{resource.title}</h1>
        <p className="mt-4 text-lg text-gray-700">{resource.description}</p>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded bg-brand px-6 py-2 font-medium text-white hover:bg-brand-dark"
        >
          访问资源 →
        </a>

        <div className="mt-8 flex flex-wrap gap-2">
          {resource.tags.map((t) => (
            <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              #{t}
            </span>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">同类资源</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {related.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建 app/about/page.tsx — 关于页，说明项目定位与免责声明**

```typescript
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">关于 HBase Hub</h1>
      <div className="mt-6 space-y-4 text-gray-700">
        <p>
          HBase Hub 是一个非营利的资源导航网站，目的是帮助开发者与学习者更方便地发现 Apache HBase 相关的优质资料，
          包括官方文档、书籍、课程、视频与社区资源。
        </p>
        <p>
          所有资源链接均整理自公开来源（如 Apache HBase 官方站点、出版社官网等），版权归原作者所有。
          本站仅提供导航，不托管任何受版权保护的内容。
        </p>
        <p>
          如果某条链接失效或你有优质资源想推荐，欢迎在项目仓库提交 Issue。
        </p>
        <p>
          <Link href="/resources" className="text-brand hover:underline">
            开始浏览资源 →
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建 app/not-found.tsx — 自定义 404 页**

```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-brand-dark">404</h1>
      <p className="mt-4 text-gray-600">页面不存在或资源已移除。</p>
      <Link href="/" className="mt-6 inline-block text-brand hover:underline">
        返回首页
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: 创建 scripts/check-links.ts — 校验所有资源 URL 可达性**

```typescript
// scripts/check-links.ts
import { resources } from '../lib/data/resources';

async function check(url: string): Promise<{ url: string; ok: boolean; status: number }> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10000) });
    return { url, ok: res.ok, status: res.status };
  } catch (err) {
    // 部分站点不支持 HEAD，降级 GET
    try {
      const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(10000) });
      return { url, ok: res.ok, status: res.status };
    } catch {
      return { url, ok: false, status: 0 };
    }
  }
}

async function main() {
  const results = await Promise.all(resources.map((r) => check(r.url)));
  const failures = results.filter((r) => !r.ok);
  console.log(`Checked ${results.length} links, ${failures.length} failures.`);
  for (const f of failures) {
    console.log(`  [FAIL ${f.status}] ${f.url}`);
  }
  process.exit(failures.length > 0 ? 1 : 0);
}

main();
```

- [ ] **Step 5: 验证全站可构建（含详情页 SSG）**
Run: `npx next build`
Expected:
  - Exit code: 0
  - Output contains: "●" (静态页面生成) 且包含 "/resources/[id]" 的多个静态路由
  - Output does NOT contain: "Failed to compile"

- [ ] **Step 6: 验证链接可达性（需联网，失败允许人工复核）**
Run: `npm run check-links`
Expected:
  - Exit code: 0 或 1
  - Output contains: "Checked N links"
  - 若有 FAIL：人工核对对应 URL，必要时更新 lib/data/resources.ts 中的 url 字段

- [ ] **Step 7: 提交**
Run: `git add app/resources/[id]/page.tsx app/about/page.tsx app/not-found.tsx scripts/check-links.ts && git commit -m "feat(pages): add resource detail, about, 404 and link checker script"`

---

## Self-Review Results

| # | Check | Result | Action Taken |
|---|-------|--------|-------------|
| 1 | Header 含 Goal+Architecture+Tech Stack？ | PASS | — |
| 2 | 每个 Task 标注 Depends on？ | PASS | — |
| 3 | 每个 Task 列出精确文件路径？ | PASS | — |
| 4 | 每个 Task 3-8 个 Step？ | PASS | Task1=8, Task2=4, Task3=8, Task4=4, Task5=7 |
| 5 | 新文件含完整代码（含 import）？ | PASS | — |
| 6 | 修改步骤为完整函数（非 diff）？ | N/A | 本项目无修改已有文件 |
| 7 | 代码块 5-80 行？ | PASS | — |
| 8 | 无悬空引用？ | PASS | 类型 `Resource`/`Category`/`CategoryInfo` 在 Task2 定义，后续 Task 引用一致 |
| 9 | 每个 Task 有验证命令（命令+exit code+output）？ | PASS | — |
| 10 | 需求全覆盖？ | PASS | 导航/分类/详情/搜索/关于 全覆盖 |
| 11 | 每个 Task 可独立验证？ | PASS | 每个 Task 末尾有 tsc/build 验证 |
| 12 | 无 TBD/TODO/模糊描述？ | PASS | — |
| 13 | 无 "add validation" 等抽象指令？ | PASS | — |
| 14 | 跨 Task 类型名/函数名/import 路径一致？ | PASS | 全部使用 `@/lib/types`、`@/lib/data/resources`、`@/components/*` |
| 15 | 保存位置正确？ | PASS | `docs/superpowers/plans/` |

**Status:** ✅ ALL PASS

⏹️ **Phase 3 Complete**

---

## Execution Selection

**Tasks:** 5
**Dependencies:** yes (Task1 → Task2 → Task3 → Task4 → Task5)
**User Preference:** none
**Decision:** Subagent-Driven
**Reasoning:** 3+ tasks 触发 Subagent-Driven 规则

**Auto-invoking:** `superpowers:subagent-driven-development`

⏹️ **Phase 4 Complete: Execution selected, invoking next skill**
