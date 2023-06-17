import { useEffect } from 'react'
import { Vector3 } from 'three'

import { isClient } from '@etherealengine/engine/src/common/functions/getEnvironment'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  defineComponent,
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { defaultSpatialComponents } from '@etherealengine/engine/src/scene/systems/SceneObjectUpdateSystem'

import {
  _updateMap,
  SCENE_COMPONENT_MAP,
  SCENE_COMPONENT_MAP_DEFAULT_VALUES,
  serializeMap,
} from './engine/MapFunctions'

export const GEO_MAP = 'Geo Map' as const

export default async () => {
  if (isClient) {
    ;(await import('./editor/index')).default()
  }

  Engine.instance.scenePrefabRegistry.set(GEO_MAP, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MAP, props: SCENE_COMPONENT_MAP_DEFAULT_VALUES }
  ])

  defineComponent({
    name: 'EE_maps_scene_component',
    jsonID: SCENE_COMPONENT_MAP,
    onInit: () => ({
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
    }),
    onSet: (entity, component, json) => {
      if (!json) return
      // if(typeof json.apiKey === 'string' && json.apiKey !== component.apiKey.value) component.apiKey.set(json.apiKey)
      // if(typeof json.name === 'string' && json.name !== component.)
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
    },
    toJSON: (entity) => serializeMap(entity),
    reactor: () => {
      if (!isClient) return null
      const entity = useEntityContext()

      useEffect(() => {
        _updateMap(entity, {})
      }, [entity])

      return null
    }
  })
}
