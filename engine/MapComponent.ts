import {useEffect} from 'react'
import { Vector3 } from 'three'

import { createMappedComponent, defineComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SCENE_COMPONENT_MAP, _updateMap, serializeMap } from './MapFunctions'
import { isClient } from '@etherealengine/engine/src/common/functions/getEnvironment'
import { useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'

export type MapComponentType = {
  apiKey: string
  name?: string
  scale?: Vector3
  style?: any
  useTimeOfDay?: number
  useDirectionalShadows?: boolean
  useDeviceGeolocation?: boolean
  startLatitude?: string
  startLongitude?: string
  showRasterTiles?: boolean
  enableDebug?: boolean
}

export const MapComponent = createMappedComponent<MapComponentType>('MapComponent')
