import { useEffect, useState } from 'react'
import type { HubIndex } from '../types'
import { FALLBACK_INDEX } from '../data/fallback'

export const INDEX_URL =
  'https://raw.githubusercontent.com/hbase-hub/hbase-index/main/index.json'

export type LoadState = 'loading' | 'success' | 'fallback'

interface UseHubIndexResult {
  data: HubIndex
  state: LoadState
  error: string | null
}

export function useHubIndex(): UseHubIndexResult {
  const [data, setData] = useState<HubIndex>(FALLBACK_INDEX)
  const [state, setState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(INDEX_URL, { cache: 'no-cache' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as HubIndex
        if (!json || !Array.isArray(json.topics) || !Array.isArray(json.categories)) {
          throw new Error('索引格式异常')
        }
        if (cancelled) return
        setData(json)
        setState('success')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
        setState('fallback')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, state, error }
}
