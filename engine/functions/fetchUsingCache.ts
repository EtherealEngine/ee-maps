import ParametricCache from '../classes/ParametricCache'
import { ITuple, MapStateUnwrapped } from '../types'
import createUsingGetSet from './createUsingGetSet'

export default function fetchUsingCache<CacheKey extends ITuple, Value>(
  fetch: (state: MapStateUnwrapped, key: CacheKey, ...args: any[]) => Value
) {
  console.log("FETCHCACHE__FN");
  const _fetchUsingCache = createUsingGetSet(fetch)
  return async (
    cache: ParametricCache<CacheKey, Value>,
    state: MapStateUnwrapped,
    key: CacheKey,
    ...extraArgs: any[]
  ) => {
    return await _fetchUsingCache(
      cache.get.bind(cache),
      async function set(key: CacheKey, value: Value) {
        const resolvedValue = await value
        cache.set(key, resolvedValue)
      },
      state,
      key,
      ...extraArgs
    )
  }
}

export function fetchUsingCacheAsync<CacheKey extends ITuple, Value>(
  fetch: (state: MapStateUnwrapped, key: CacheKey, ...args: any[]) => Promise<Value>
) {
  return async (
    cache: ParametricCache<CacheKey, Value>,
    state: MapStateUnwrapped,
    key: CacheKey,
    ...extraArgs: any[]
  ) => {
    let value = cache.get(key)
    if (!value) {
      value = await fetch(state, key, ...extraArgs)
      cache.set(key, value)
    }
    return value
  }
}
