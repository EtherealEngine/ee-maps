import React from 'react'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '@xrengine/editor/src/managers/CommandManager'
import BooleanInput from '@xrengine/editor/src/components/inputs/BooleanInput'
import InputGroup from '@xrengine/editor/src/components/inputs/InputGroup'
import StringInput from '@xrengine/editor/src/components/inputs/StringInput'
import NodeEditor from '@xrengine/editor/src/components/properties/NodeEditor'
import { MapComponent } from '../engine/MapComponent'
import { EditorComponentType } from '@xrengine/editor/src/components/properties/Util'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export const MapNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onChangeValue = (prop) => (value) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: MapComponent,
      properties: { [prop]: value }
    })
  }

  const mapComponent = getComponent(props.node.entity, MapComponent)

  return (
    <NodeEditor {...props} description={t('editor:properties.map.description')}>
      <InputGroup
        name="Start at device's geolocation?"
        label={t('editor:properties.map.lbl-useDeviceGeolocation')}
        info={t('editor:properties.map.info-useDeviceGeolocation')}
      >
        <BooleanInput value={mapComponent.useDeviceGeolocation} onChange={onChangeValue('useDeviceGeolocation')} />
      </InputGroup>
      <InputGroup name="Start Latitude" label={t('editor:properties.map.lbl-startLatitude')}>
        <StringInput value={mapComponent.startLatitude} onChange={onChangeValue('startLatitude')} />
      </InputGroup>
      <InputGroup name="Start Longitude" label={t('editor:properties.map.lbl-startLongitude')}>
        <StringInput value={mapComponent.startLongitude} onChange={onChangeValue('startLongitude')} />
      </InputGroup>
      <InputGroup
        name="Show Raster Tiles?"
        label={t('editor:properties.map.lbl-showRasterTiles')}
        info={t('editor:properties.map.info-showRasterTiles')}
      >
        <BooleanInput value={mapComponent.showRasterTiles} onChange={onChangeValue('showRasterTiles')} />
      </InputGroup>
      <InputGroup
        name="Enable debugging code?"
        label={t('editor:properties.map.lbl-enableDebug')}
        info={t('editor:properties.map.info-enableDebug')}
      >
        <BooleanInput value={mapComponent.enableDebug} onChange={onChangeValue('enableDebug')} />
      </InputGroup>
    </NodeEditor>
  )
}