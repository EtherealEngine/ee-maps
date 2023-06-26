import { MultiPolygon } from 'polygon-clipping'
import { Mesh } from 'three'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import FeatureCache from './classes/FeatureCache'
import HashMap from './classes/HashMap'
import HashSet from './classes/HashSet'
import MutableNavMesh from './classes/MutableNavMesh'
import TileCache from './classes/TileCache'
import { MAX_CACHED_FEATURES, MAX_CACHED_TILES } from './constants'
import { LongLat } from './functions/UnitConversionFunctions'
import {
  FeatureKey,
  MapDerivedFeatureComplete,
  MapDerivedFeatureGeometry,
  MapFeatureLabel,
  MapHelpers,
  MapTransformedFeature,
  SupportedFeature,
  TaskStatus,
  Text3D,
  TileKey,
  VectorTile
} from './types'

interface IMapInitializeAction {
  centerPoint: LongLat
  triggerRefreshRadius: number
  minimumSceneRadius: number
  scale: number
}

export const MapState = defineState({
  name: 'EE_Map_State',
  initial: () => ({
    center: [0, 0],
    originalCenter: [0, 0],
    viewerPosition: [0, 0],
    triggerRefreshRadius: 160,
    minimumSceneRadius: 800,
    labelRadius: 400,
    navMeshRadius: 400,
    scale: 1,
    fetchTilesTasks: new HashMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    tileCache: new TileCache<VectorTile>(MAX_CACHED_TILES),
    extractTilesTasks: new HashMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    featureCache: new FeatureCache<SupportedFeature>(MAX_CACHED_FEATURES),
    transformedFeatureTasks: new HashMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    transformedFeatureCache: new FeatureCache<MapTransformedFeature>(MAX_CACHED_FEATURES),
    geometryTasks: new HashMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    geometryCache: new FeatureCache<MapDerivedFeatureGeometry>(MAX_CACHED_FEATURES),
    completeObjectsTasks: new HashMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    completeObjects: new FeatureCache<MapDerivedFeatureComplete>(MAX_CACHED_FEATURES),
    labelTasks: new HashMap<FeatureKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    labelCache: new FeatureCache<MapFeatureLabel>(MAX_CACHED_FEATURES),
    tileNavMeshTasks: new HashMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    tileNavMeshCache: new TileCache<MultiPolygon>(MAX_CACHED_TILES),
    helpersTasks: new HashMap<TileKey, TaskStatus>([], { defaultValue: TaskStatus.NOT_STARTED }),
    helpersCache: new TileCache<MapHelpers>(MAX_CACHED_TILES),
    tileMeta: new HashMap<TileKey, { cachedFeatureKeys: HashSet<FeatureKey> }>([], {
      defaultValue: { cachedFeatureKeys: new HashSet() }
    }),
    featureMeta: new HashMap<FeatureKey, { tileKey: TileKey }>(),
    navMesh: new MutableNavMesh(),
    activePhase: null as null | string,
    updateSpinner: null as null | Mesh,
    updateTextContainer: null as null | Text3D
  })
})

// ACTIONS

export class MapStateActions {
  static initialize = defineAction({
    type: 'ee.maps.MapState.INITIALIZE' as const,
    data: matches.object as Validator<unknown, IMapInitializeAction>
  })
  static setProperty = defineAction({
    type: 'ee.maps.MapState.SET_PROPERTY' as const,
    data: matches.object as Validator<unknown, Partial<typeof MapState._TYPE>>
  })
}

// RECEPTORS

const mapInitializeActionReceptor = (action: typeof MapStateActions.initialize.matches._TYPE) => {
  const state = getMutableState(MapState)
  return state.merge({
    center: action.data.centerPoint,
    originalCenter: action.data.centerPoint,
    triggerRefreshRadius: action.data.triggerRefreshRadius,
    minimumSceneRadius: action.data.minimumSceneRadius,
    labelRadius: action.data.minimumSceneRadius * 0.5,
    navMeshRadius: action.data.minimumSceneRadius * 0.5,
    scale: action.data.scale
  })
}

const mapSetPropertyActionReceptor = (action: typeof MapStateActions.setProperty.matches._TYPE) => {
  const state = getMutableState(MapState)
  return state.merge(action.data)
}

export const MapStateReceptor = {
  mapInitializeActionReceptor,
  mapSetPropertyActionReceptor
}

// SERVICE

export const MapStateService = {
  initializeMap: (centerPoint: LongLat, scale = 1, triggerRefreshRadius = 40, minimumSceneRadius = 800) =>
    dispatchAction(
      MapStateActions.initialize({
        data: {
          centerPoint,
          scale,
          triggerRefreshRadius,
          minimumSceneRadius
        }
      })
    ),
  setProperty: (data: Partial<typeof MapState._TYPE>) => {
    dispatchAction(MapStateActions.setProperty({ data }))
  }
}

MapStateService.setProperty({})
