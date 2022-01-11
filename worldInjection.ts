
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { deserializeMap, SCENE_COMPONENT_MAP, SCENE_COMPONENT_MAP_DEFAULT_VALUES, serializeMap, updateMap } from './engine/MapFunctions'
import { defaultSpatialComponents } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { isNode } from '@xrengine/engine/src/common/functions/getEnvironment'

export const map = 'Geo Map' as const

export default async (world: World) => {

  if(!isNode) {
    (await import('./editor/index')).default(world)
  }

  world.scenePrefabRegistry.set(map, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MAP, props: SCENE_COMPONENT_MAP_DEFAULT_VALUES }
  ])

  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MAP, {
    deserialize: deserializeMap,
    serialize: serializeMap,
    update: updateMap
  })
}
