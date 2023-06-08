import { deserializeMap, SCENE_COMPONENT_MAP, SCENE_COMPONENT_MAP_DEFAULT_VALUES, serializeMap, updateMap } from './engine/MapFunctions'
import { isClient } from '@etherealengine/engine/src/common/functions/getEnvironment'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineQuery, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SceneAssetPendingTagComponent } from '@etherealengine/engine/src/scene/components/SceneAssetPendingTagComponent'
import { defaultSpatialComponents } from '@etherealengine/engine/src/scene/systems/SceneObjectUpdateSystem'

export const GEO_MAP = 'Geo Map' as const

export default async () => {

  if(isClient) {
    (await import('./editor/index')).default()
  }

  Engine.instance.scenePrefabRegistry.set(GEO_MAP, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MAP, props: SCENE_COMPONENT_MAP_DEFAULT_VALUES }
  ])

  const sceneAssetPendingTagQuery = defineQuery([SceneAssetPendingTagComponent])
  if(sceneAssetPendingTagQuery.length > 0) {
    Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_MAP, {
      deserialize: deserializeMap,
      serialize: serializeMap,
      update: updateMap
    })
  }
}
