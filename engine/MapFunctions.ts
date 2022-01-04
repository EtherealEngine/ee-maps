import { getStartCoords } from './getStartCoords'
import { MapComponentType } from './MapComponent'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { DebugNavMeshComponent } from '@xrengine/engine/src/debug/DebugNavMeshComponent'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { Group, Mesh } from 'three'
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

export const SCENE_COMPONENT_MAP = 'map'
export const SCENE_COMPONENT_MAP_DEFAULT_VALUES = {}

export async function deserializeMap(entity: Entity, json: ComponentJson<MapComponentType>): Promise<void> {
  if (isClient) {
    registerSceneLoadPromise(createMap(entity, json.props))
    if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_MAP)
  }
}

const createMap = async (entity: Entity, args: MapComponentType) => {

  // TODO: handle "navigator.geolocation.getCurrentPosition" rejection?
  const center = await getStartCoords(args)

  addComponent(entity, MapComponent, args)

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
  const spinnerGLTF = await LoadGLTF(Engine.publicPath + '/projects/default-project/EarthLowPoly.glb')
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

export const serializeMap = (entity: Entity) => {
  const mapComponent = getComponent(entity, MapComponent)
  return {
    name: SCENE_COMPONENT_MAP,
    props: {
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