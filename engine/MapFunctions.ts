import { ComponentJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { defaultAvatarHalfHeight } from '@etherealengine/engine/src/avatar/functions/spawnAvatarReceptor'
// import { DebugNavMeshComponent } from '@etherealengine/engine/src/debug/DebugNavMeshComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { addComponent, defineQuery, getAllComponents, getComponent, hasComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getState } from '@etherealengine/hyperflux'

import { debounce } from 'lodash'
import { Group, Mesh, Object3D } from 'three'
import { Text } from 'troika-three-text'

import { isClient } from '@etherealengine/engine/src/common/functions/getEnvironment'
import { MapComponent, MapComponentType } from './MapComponent'
import { MapAction, mapReducer } from './MapReceptor'
import { getPhases, startPhases } from './functions/PhaseFunctions'
import { getStartCoords } from './getStartCoords'
import { addChildFast, setPosition } from './util'
import { NavMeshComponent } from './helpers/NavMeshComponent'
import { GroupComponent, Object3DWithEntity } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { SceneAssetPendingTagComponent } from '@etherealengine/engine/src/scene/components/SceneAssetPendingTagComponent'

export const SCENE_COMPONENT_MAP = 'map'
export const SCENE_COMPONENT_MAP_DEFAULT_VALUES = {}

export const deserializeMap = (entity: Entity, json: ComponentJson<MapComponentType>) => {
  const sceneAssetPendingTagQuery = defineQuery([SceneAssetPendingTagComponent])
  if (isClient) {
    if(sceneAssetPendingTagQuery.length > 0) {
      createMap(entity, json.props as MapComponentType)
    }
    
    // if (getState(EngineState).isEditor) {
    //   const components = getAllComponents(entity)
    //   components.push(SCENE_COMPONENT_MAP)
    // }
  }
}

export const createMap = async (entity: Entity, args: MapComponentType) => {
  if(getState(EngineState).isEditor && hasComponent(entity, MapComponent)) {
    _updateMap(entity, args)
    return
  }
  // TODO: handle "navigator.geolocation.getCurrentPosition" rejection?

  addComponent(entity, MapComponent, args)
  const center = await getStartCoords(args)

  const mapObject3D = new Object3D() as Object3DWithEntity
  const navigationRaycastTarget = new Group()

  mapObject3D.name = '(Geographic) Map'

  addComponent(entity, GroupComponent, [mapObject3D])

  if (args.enableDebug) {
    // addComponent(entity, DebugNavMeshComponent, { object3d: new Group() })
  }

  const state = mapReducer(null, MapAction.initialize(center, args.scale?.x))

  // const spinnerGLTF = getState(EngineState).publicPath + '/projects/ee-maps/EarthLowPoly.glb'
  // const spinner = spinnerGLTF as Mesh
  // spinner.position.y = defaultAvatarHalfHeight * 2
  // spinner.position.z = -150
  // state.updateSpinner = spinner

  const updateTextContainer = new Text()

  updateTextContainer.fontSize = 8
  updateTextContainer.color = 0x080808
  updateTextContainer.anchorX = '50%'
  updateTextContainer.anchorY = '50%'
  updateTextContainer.strokeColor = 0x707070
  updateTextContainer.strokeWidth = '1%'
  updateTextContainer.sdfGlyphSize = 32
  updateTextContainer.text = 'Hop, skip, jump...'

  updateTextContainer.position.set(0, 0, -100)

  updateTextContainer.sync()

  state.updateTextContainer = updateTextContainer

  await startPhases(state, await getPhases({ exclude: ['navigation'] }))

  navigationRaycastTarget.scale.setScalar(state.scale)
  Engine.instance.scene.add(navigationRaycastTarget)

  addComponent(entity, NavMeshComponent, {
    /*
  * [Mappa#2](https://github.com/lagunalabsio/mappa/issues/2)
    yukaNavMesh: store.navMesh,
  */
    navTarget: navigationRaycastTarget
  })
}

export const _updateMap = async (entity: Entity, props: any) => {

  // only update on some property changes
  if(!(
    Object.keys(props).includes('startLatitude')
    || Object.keys(props).includes('startLongitude')
    || Object.keys(props).includes('useDeviceGeolocation'))
  ) return

  const args = getComponent(entity, MapComponent)
  const center = await getStartCoords(args)
  const subSceneChildren = []
  const subScene = this as unknown as Object3D

  const state = mapReducer(null, MapAction.initialize(center, args.scale?.x))

  await startPhases(state, await getPhases({ exclude: ['navigation'] }))

  for (const object of state.completeObjects.values()) {
    if (object.mesh) {
      setPosition(object.mesh, object.centerPoint)
      addChildFast(subScene, object.mesh, subSceneChildren)
    }
  }
  for (const object of state.labelCache.values()) {
    if (object.mesh) {
      setPosition(object.mesh, object.centerPoint)
      addChildFast(subScene, object.mesh, subSceneChildren)
      object.mesh.update()
    }
  }
  subScene.children = subSceneChildren
}
export const updateMap = debounce((entity, args) => _updateMap(entity, args), 500) as any as (entity: Entity, props: any) => void

export const serializeMap = (entity: Entity) => {
  const mapComponent = getComponent(entity, MapComponent)
  return {
    name: SCENE_COMPONENT_MAP,
    props: {
      apiKey: mapComponent.apiKey,
      name: mapComponent.name,
      scale: mapComponent.scale,
      useTimeOfDay: mapComponent.useTimeOfDay,
      useDirectionalShadows: mapComponent.useDirectionalShadows,
      useDeviceGeolocation: mapComponent.useDeviceGeolocation,
      startLatitude: mapComponent.startLatitude,
      startLongitude: mapComponent.startLongitude,
      showRasterTiles: mapComponent.showRasterTiles,
      enableDebug: mapComponent.enableDebug
    }
  }
}