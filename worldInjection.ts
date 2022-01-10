
import { EntityNodeEditor, prefabIcons } from '@xrengine/editor/src/managers/NodeManager'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { MapNodeEditor } from './editor/MapNodeEditor'
import MapIcon from '@mui/icons-material/Map'
import { deserializeMap, SCENE_COMPONENT_MAP, SCENE_COMPONENT_MAP_DEFAULT_VALUES, serializeMap, updateMap } from './engine/MapFunctions'
import { defaultSpatialComponents } from '@xrengine/engine/src/scene/functions/registerPrefabs'

const map = 'Geo Map' as const

EntityNodeEditor[map] = MapNodeEditor
prefabIcons[map] = MapIcon

export default async (world: World) => {
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
