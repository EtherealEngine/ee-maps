import React from 'react'
import { useTranslation } from 'react-i18next'
import BooleanInput from '@etherealengine/editor/src/components/inputs/BooleanInput'
import InputGroup from '@etherealengine/editor/src/components/inputs/InputGroup'
import StringInput from '@etherealengine/editor/src/components/inputs/StringInput'
import NodeEditor from '@etherealengine/editor/src/components/properties/NodeEditor'
import { MapComponent } from '../engine/MapComponent'
import { EditorComponentType, updateProperty } from '@etherealengine/editor/src/components/properties/Util'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

export const MapNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const mapComponent = useComponent(props.entity, MapComponent)
  console.log('MapNodeEditor')

  return (
    <NodeEditor {...props} description={t('editor:properties.map.description')}>

      <InputGroup name="Mapbox API Key" label={'Mapbox API Key'}>
        <StringInput value={mapComponent.value.apiKey} onChange={updateProperty(MapComponent, 'apiKey')} />
      </InputGroup>
      <InputGroup
        name="Start at device's geolocation?"
        label={t('editor:properties.map.lbl-useDeviceGeolocation')}
        info={t('editor:properties.map.info-useDeviceGeolocation')}
      >
        <BooleanInput value={mapComponent.value.useDeviceGeolocation as boolean} onChange={updateProperty(MapComponent, 'useDeviceGeolocation')} />
      </InputGroup>
      <InputGroup name="Start Latitude" label={t('editor:properties.map.lbl-startLatitude')}>
        <StringInput value={mapComponent.value.startLatitude} onChange={updateProperty(MapComponent, 'startLatitude')} />
      </InputGroup>
      <InputGroup name="Start Longitude" label={t('editor:properties.map.lbl-startLongitude')}>
        <StringInput value={mapComponent.value.startLongitude} onChange={updateProperty(MapComponent, 'startLongitude')} />
      </InputGroup>
      <InputGroup
        name="Show Raster Tiles?"
        label={t('editor:properties.map.lbl-showRasterTiles')}
        info={t('editor:properties.map.info-showRasterTiles')}
      >
        <BooleanInput value={mapComponent.value.showRasterTiles as boolean} onChange={updateProperty(MapComponent, 'showRasterTiles')} />
      </InputGroup>
      <InputGroup
        name="Enable debugging code?"
        label={t('editor:properties.map.lbl-enableDebug')}
        info={t('editor:properties.map.info-enableDebug')}
      >
        <BooleanInput value={mapComponent.value.enableDebug as boolean} onChange={updateProperty(MapComponent, 'enableDebug')} />
      </InputGroup>
    </NodeEditor>
  )
}