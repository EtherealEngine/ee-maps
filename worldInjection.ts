import { prefabIcons } from '@etherealengine/editor/src/functions/PrefabEditors'
import { EntityNodeEditor } from '@etherealengine/editor/src/functions/PrefabEditors'
import { isClient } from '@etherealengine/engine/src/common/functions/getEnvironment'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { InputSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { defaultSpatialComponents } from '@etherealengine/engine/src/scene/systems/SceneObjectUpdateSystem'

import MapIcon from '@mui/icons-material/Map'

import { MapNodeEditor } from './editor/MapNodeEditor'
import { MapComponent } from './engine/MapComponent'
import { _updateMap, SCENE_COMPONENT_MAP, SCENE_COMPONENT_MAP_DEFAULT_VALUES } from './engine/MapFunctions'
import MapUpdateSystem from './engine/MapUpdateSystem'

export const GEO_MAP = 'Geo Map' as const

export default async () => {
  if (isClient) {
    EntityNodeEditor.set(MapComponent, MapNodeEditor)
    prefabIcons[GEO_MAP] = MapIcon
    startSystem(MapUpdateSystem, { after: InputSystemGroup })
  }

  Engine.instance.scenePrefabRegistry.set(GEO_MAP, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MAP, props: SCENE_COMPONENT_MAP_DEFAULT_VALUES }
  ])
}
