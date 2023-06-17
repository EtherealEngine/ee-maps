import { prefabIcons } from '@etherealengine/editor/src/functions/PrefabEditors'
import { startSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'

import MapIcon from '@mui/icons-material/Map'

import MapUpdateSystem from '../engine/MapUpdateSystem'
import { GEO_MAP } from '../worldInjection'

export default async () => {
  prefabIcons[GEO_MAP] = MapIcon

  startSystem(MapUpdateSystem, {})
}
