
import { EntityNodeEditor, prefabIcons } from '@xrengine/editor/src/managers/NodeManager'
import { MapNodeEditor } from './MapNodeEditor'
import MapIcon from '@mui/icons-material/Map'
import { map } from '../worldInjection'
import { World } from '@xrengine/engine/src/ecs/classes/World'

EntityNodeEditor[map] = MapNodeEditor
prefabIcons[map] = MapIcon

export default async (world: World) => {}