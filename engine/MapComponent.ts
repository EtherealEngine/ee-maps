import { useEffect } from 'react'
import { Vector3 } from 'three'

import { isClient } from '@etherealengine/engine/src/common/functions/getEnvironment'
import { ComponentType, defineComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'

import { _updateMap, deserializeMap, SCENE_COMPONENT_MAP } from './MapFunctions'

export const MapComponent = defineComponent({
  name: 'EE_maps_scene_component',
  jsonID: SCENE_COMPONENT_MAP,
  onInit: (entity) => {
    return {
      apiKey: '',
      name: '',
      scale: new Vector3(),
      style: {},
      useTimeOfDay: 0,
      useDirectionalShadows: false,
      useDeviceGeolocation: false,
      startLatitude: '',
      startLongitude: '',
      showRasterTiles: false,
      enableDebug: false
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return
    component.apiKey.set(json.apiKey!)
    component.name.set(json.name!)
    component.scale.set(json.scale!)
    component.style.set(json.style!)
    component.useTimeOfDay.set(json.useTimeOfDay!)
    component.useDirectionalShadows.set(json.useDirectionalShadows!)
    component.useDeviceGeolocation.set(json.useDeviceGeolocation!)
    component.startLatitude.set(json.startLatitude!)
    component.startLongitude.set(json.startLongitude!)
    component.showRasterTiles.set(json.showRasterTiles!)
    component.enableDebug.set(json.enableDebug!)
    deserializeMap(entity, component.value)
  },
  toJSON: (entity, component) => {
    return {
      apiKey: component.apiKey,
      name: component.name,
      scale: component.scale,
      useTimeOfDay: component.useTimeOfDay,
      useDirectionalShadows: component.useDirectionalShadows,
      useDeviceGeolocation: component.useDeviceGeolocation,
      startLatitude: component.startLatitude,
      startLongitude: component.startLongitude,
      showRasterTiles: component.showRasterTiles,
      enableDebug: component.enableDebug
    }
  },
  reactor: () => {
    if (!isClient) return null
    const entity = useEntityContext()

    useEffect(() => {
      _updateMap(entity, {})
    }, [entity])

    return null
  }
})

export type MapComponentType = ComponentType<typeof MapComponent>
