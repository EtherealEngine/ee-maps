
import { EntityNodeEditor, prefabIcons } from '@etherealengine/editor/src/functions/PrefabEditors'
import { MapNodeEditor } from './MapNodeEditor'
import MapIcon from '@mui/icons-material/Map'
import { map } from '../worldInjection'
import { World } from '@etherealengine/engine/src/ecs/classes/World'
import MapUpdateSystem from '../engine/MapUpdateSystem'

EntityNodeEditor[map] = MapNodeEditor
prefabIcons[map] = MapIcon

export default async (world: World) => {
  return await MapUpdateSystem(world)
}