import { getStartCoords } from './getStartCoords'
import { MapComponentType } from './MapComponent'
import { addComponent, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { DebugNavMeshComponent } from '@xrengine/engine/src/debug/DebugNavMeshComponent'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { Object3D, Group, Mesh } from 'three'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NavMeshComponent } from '@xrengine/engine/src/navigation/component/NavMeshComponent'
import { MapAction, mapReducer } from './MapReceptor'
import { MapComponent } from './MapComponent'
import { getPhases, startPhases } from './functions/PhaseFunctions'
import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { avatarHalfHeight } from '@xrengine/engine/src/avatar/functions/createAvatar'
import { Text } from 'troika-three-text'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { registerSceneLoadPromise } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { addChildFast, setPosition } from './util'
import { debounce } from 'lodash'

export const SCENE_COMPONENT_MAP = 'map'
export const SCENE_COMPONENT_MAP_DEFAULT_VALUES = {}

export const deserializeMap = (entity: Entity, json: ComponentJson<MapComponentType>) => {
  if (isClient) {
    registerSceneLoadPromise(createMap(entity, json.props))
    if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_MAP)
  }
}

export const createMap = async (entity: Entity, args: MapComponentType) => {
  if(Engine.isEditor && hasComponent(entity, MapComponent)) {
    _updateMap(entity, args)
    return
  }
  // TODO: handle "navigator.geolocation.getCurrentPosition" rejection?

  addComponent(entity, MapComponent, args)
  const center = await getStartCoords(args)

  const mapObject3D = new Group()
  const navigationRaycastTarget = new Group()

  mapObject3D.name = '(Geographic) Map'

  addComponent(entity, Object3DComponent, {
    value: mapObject3D
  })
  if (args.enableDebug) {
    addComponent(entity, DebugNavMeshComponent, { object3d: new Group() })
  }

  const state = mapReducer(null, MapAction.initialize(center, args.scale?.x))

  // TODO fix hardcoded URL
  const spinnerGLTF = await LoadGLTF(Engine.publicPath + '/projects/XREngine-Project-Maps/EarthLowPoly.glb')
  const spinner = spinnerGLTF.scene as Mesh
  spinner.position.y = avatarHalfHeight * 2
  spinner.position.z = -150
  state.updateSpinner = spinner

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
  Engine.scene.add(navigationRaycastTarget)

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