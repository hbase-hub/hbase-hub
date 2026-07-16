export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Category {
  id: string
  label: string
  description: string
  order: number
}

export interface Topic {
  id: string
  number: number
  slug: string
  title: string
  category: string
  difficulty: Difficulty
  summary: string
  repoUrl: string
  demoUrl: string
  previewImage: string
  tags: string[]
  prerequisites: number[]
  deprecated: boolean
  createdAt: string
}

export interface HubIndex {
  version: number
  updatedAt: string
  categories: Category[]
  topics: Topic[]
}
