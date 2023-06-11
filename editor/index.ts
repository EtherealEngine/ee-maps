
import { EntityNodeEditor, prefabIcons } from '@etherealengine/editor/src/functions/PrefabEditors'
import { MapNodeEditor } from './MapNodeEditor'
import MapIcon from '@mui/icons-material/Map'
import { GEO_MAP } from '../worldInjection'
import MapUpdateSystem from '../engine/MapUpdateSystem'

EntityNodeEditor[GEO_MAP] = MapNodeEditor
prefabIcons[GEO_MAP] = MapIcon

export default async () => {
  return await MapUpdateSystem()
}