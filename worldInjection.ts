import { deserializeMap, SCENE_COMPONENT_MAP, SCENE_COMPONENT_MAP_DEFAULT_VALUES, serializeMap, updateMap } from './engine/MapFunctions'
import { defaultSpatialComponents } from '@etherealengine/engine/src/scene/functions/registerPrefabs'
import { isNode } from '@etherealengine/engine/src/common/functions/getEnvironment'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'

export const map = 'Geo Map' as const

export default async () => {

  if(!isNode) {
    (await import('./editor/index')).default()
  }

  Engine.instance.scenePrefabRegistry.set(map, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MAP, props: SCENE_COMPONENT_MAP_DEFAULT_VALUES }
  ])

  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_MAP, {
    deserialize: deserializeMap,
    serialize: serializeMap,
    update: updateMap
  })
}
