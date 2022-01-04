import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Vector3 } from 'three'

export type MapComponentType = {
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
