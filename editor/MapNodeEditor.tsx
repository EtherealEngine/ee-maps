import React from 'react'
import { useTranslation } from 'react-i18next'
import BooleanInput from '@etherealengine/editor/src/components/inputs/BooleanInput'
import InputGroup from '@etherealengine/editor/src/components/inputs/InputGroup'
import StringInput from '@etherealengine/editor/src/components/inputs/StringInput'
import NodeEditor from '@etherealengine/editor/src/components/properties/NodeEditor'
import { MapComponent } from '../engine/MapComponent'
import { EditorComponentType, updateProperty } from '@etherealengine/editor/src/components/properties/Util'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

export const MapNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const mapComponent = getComponent(props.node.entity, MapComponent)
  console.log('MapNodeEditor')

  return (
    <NodeEditor {...props} description={t('editor:properties.map.description')}>

      <InputGroup name="Mapbox API Key" label={'Mapbox API Key'}>
        <StringInput value={mapComponent.apiKey} onChange={updateProperty(MapComponent, 'apiKey')} />
      </InputGroup>
      <InputGroup
        name="Start at device's geolocation?"
        label={t('editor:properties.map.lbl-useDeviceGeolocation')}
        info={t('editor:properties.map.info-useDeviceGeolocation')}
      >
        <BooleanInput value={mapComponent.useDeviceGeolocation} onChange={updateProperty(MapComponent, 'useDeviceGeolocation')} />
      </InputGroup>
      <InputGroup name="Start Latitude" label={t('editor:properties.map.lbl-startLatitude')}>
        <StringInput value={mapComponent.startLatitude} onChange={updateProperty(MapComponent, 'startLatitude')} />
      </InputGroup>
      <InputGroup name="Start Longitude" label={t('editor:properties.map.lbl-startLongitude')}>
        <StringInput value={mapComponent.startLongitude} onChange={updateProperty(MapComponent, 'startLongitude')} />
      </InputGroup>
      <InputGroup
        name="Show Raster Tiles?"
        label={t('editor:properties.map.lbl-showRasterTiles')}
        info={t('editor:properties.map.info-showRasterTiles')}
      >
        <BooleanInput value={mapComponent.showRasterTiles} onChange={updateProperty(MapComponent, 'showRasterTiles')} />
      </InputGroup>
      <InputGroup
        name="Enable debugging code?"
        label={t('editor:properties.map.lbl-enableDebug')}
        info={t('editor:properties.map.info-enableDebug')}
      >
        <BooleanInput value={mapComponent.enableDebug} onChange={updateProperty(MapComponent, 'enableDebug')} />
      </InputGroup>
    </NodeEditor>
  )
}