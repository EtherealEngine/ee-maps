import { MapStateUnwrapped } from '../types'
import unifyCachedFeatures from '../functions/unifyCachedFeatures'

export const name = 'UnifyFeatures'
export const isAsyncPhase = false
export const isCachingPhase = false

export function* getTaskKeys() {
  console.log('UnifyFeatures--->')
  yield null
}

export function execTask(state: MapStateUnwrapped) {
  console.log('UnifyFeatures_2--->')
  unifyCachedFeatures(state.featureCache)
}

export function cleanup() {}

export function reset() {}
