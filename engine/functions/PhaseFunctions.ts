import { isClient } from '@etherealengine/engine/src/common/functions/getEnvironment'

import { TaskStatus } from '../types'
import { ICachingPhase, IPhase, ISyncPhase, MapStateUnwrapped } from '../types'

// Random Thought: Monads like https://github.com/monet/monet.js/blob/master/docs/FREE.md could be useful here.
type FeatureId = 'navigation'

const defaultPhases: Promise<IPhase<any, any>>[] = []
const phasesNoNavigation: Promise<IPhase<any, any>>[] = []

if (isClient) {
  const phases: { [name: string]: Promise<IPhase<any, any>> | null } = {
    FetchTilesPhase: null,
    ExtractTileFeaturesPhase: null,
    TransformFeaturePhase: null,
    UnifyFeaturesPhase: null,
    CreateGeometryPhase: null,
    CreateFallbackLanduseMeshPhase: null,
    CreateTileNavMeshPhase: null,
    CreateCompleteObjectPhase: null,
    CreateCompleteNavMeshPhase: null,
    CreateLabelPhase: null,
    CreateHelpersPhase: null
  }

  Object.keys(phases).forEach((name: string) => {
    phases[name] = import(`../phases/${name}.ts`)
  })
  defaultPhases.push(
    phases.FetchTilesPhase!,
    phases.ExtractTileFeaturesPhase!,
    phases.UnifyFeaturesPhase!,
    phases.TransformFeaturePhase!,
    phases.CreateGeometryPhase!,
    phases.CreateFallbackLanduseMeshPhase!,
    phases.CreateTileNavMeshPhase!,
    phases.CreateCompleteObjectPhase!,
    phases.CreateCompleteNavMeshPhase!,
    phases.CreateLabelPhase!,
    phases.CreateHelpersPhase!
  )
  phasesNoNavigation.push(
    phases.FetchTilesPhase!,
    phases.ExtractTileFeaturesPhase!,
    phases.UnifyFeaturesPhase!,
    phases.TransformFeaturePhase!,
    phases.CreateGeometryPhase!,
    phases.CreateFallbackLanduseMeshPhase!,
    phases.CreateCompleteObjectPhase!,
    phases.CreateLabelPhase!
  )
}

Object.freeze(defaultPhases)
Object.freeze(phasesNoNavigation)

export async function getPhases(options: { exclude?: FeatureId[] } = {}): Promise<readonly IPhase<any, any>[]> {
  console.log('GETPHASES-PHASES-CALLED--->')
  const exclude = options.exclude || []
  return Promise.all(exclude.includes('navigation') ? phasesNoNavigation : defaultPhases)
}

export function resetPhases(state: MapStateUnwrapped, phases: readonly IPhase<any, any>[]) {
  console.log('RESET-PHASES-CALLED--->')
  for (const phase of phases) {
    phase.reset(state)
  }
}

export async function startPhases(state: MapStateUnwrapped, phases: readonly IPhase<any, any>[]) {
  // TODO remove
  console.log('START-PHASES-CALLED--->')
  const results = [] as any[]
  let result: any
  const newState = { ...state }

  for (const phase of phases) {
    // console.log("starting phase", phase.name)
    const keys = phase.getTaskKeys(state)
    if (phase.isCachingPhase || phase.isAsyncPhase) {
      newState.activePhase = phase.name
      // TODO remove
      const promises = [] as Promise<any>[]
      let promise: Promise<any>
      for (const key of keys) {
        const taskStatus = phase.getTaskStatus(newState, key)
        // console.log(`task key: ${key} status: ${taskStatus === TaskStatus.STARTED ? 'started' : 'not started'}`)
        if (taskStatus === TaskStatus.NOT_STARTED) {
          // console.log("starting task for", phase.name)
          if (phase.isAsyncPhase) {
            promise = phase.startTask(newState, key)
            promises.push(promise)
          } else {
            result = (phase as ICachingPhase<any, any>).execTask(newState, key)
            results.push(result)
          }
          ;(phase as ICachingPhase<any, any>).setTaskStatus(newState, key, TaskStatus.STARTED)
        }
      }
      results.push(...(await Promise.all(promises)))
    } else {
      for (const key of keys) {
        // console.log(`task key: ${key}`)
        // console.log("starting task", phase.name)
        result = (phase as ISyncPhase<any, any>).execTask(newState, key)
        results.push(result)
      }
    }
    phase.cleanup(newState)
  }
  newState.activePhase = 'UpdateScene'
  return results
}
