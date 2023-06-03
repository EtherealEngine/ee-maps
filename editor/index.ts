
import { EntityNodeEditor, prefabIcons } from '@etherealengine/editor/src/functions/PrefabEditors'
import { MapNodeEditor } from './MapNodeEditor'
import MapIcon from '@mui/icons-material/Map'
import { map } from '../worldInjection'
import MapUpdateSystem from '../engine/MapUpdateSystem'

EntityNodeEditor[map] = MapNodeEditor
prefabIcons[map] = MapIcon

export default async () => {
  return await MapUpdateSystem()
}