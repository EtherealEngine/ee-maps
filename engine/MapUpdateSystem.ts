import { Vector3 } from 'three'

import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { TargetCameraRotationComponent } from '@etherealengine/engine/src/camera/components/TargetCameraRotationComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { addComponent, defineQuery, getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { defineActionQueue, getMutableState } from '@etherealengine/hyperflux'

import isIntersectCircleCircle from './functions/isIntersectCircleCircle'
import { getPhases, resetPhases, startPhases } from './functions/PhaseFunctions'
import { fromMetersFromCenter, LongLat } from './functions/UnitConversionFunctions'
import { NavMeshComponent } from './helpers/NavMeshComponent'
import { MapComponent } from './MapComponent'
import { MapState, MapStateActions, MapStateReceptor, MapStateService } from './MapReceptor'
import { IPhase } from './types'
import { addChildFast, multiplyArray, setPosition, vectorToArray } from './util'

const PI2 = Math.PI * 2
const $vector3 = new Vector3()
const $normalScaleViewerPositionDelta = new Array(2) as [number, number]

/** Track where the viewer was the last time we kicked off a new set of map contruction tasks */
const $previousViewerPosition = new Vector3()
const $previousMapCenterPoint: LongLat = Array(2)

const mapsQuery = defineQuery([MapComponent])
const viewerQuery = defineQuery([AvatarComponent])
const navMeshQuery = defineQuery([NavMeshComponent])
const mapStateInitializeActionQueue = defineActionQueue(MapStateActions.initialize.matches)
const mapStateSetPropertyActionQueue = defineActionQueue(MapStateActions.setProperty.matches)

let previousViewerEntity: Entity | null = null
let spinnerAngle = 0

let phases: readonly IPhase<any, any>[]
getPhases({ exclude: ['navigation'] }).then((phases_) => (phases = phases_))

const execute = () => {
  if (!phases) return

  const viewerEntity = viewerQuery()[0]
  const mapEntities = mapsQuery()
  const mapEntity = mapEntities[0]
  const navPlaneEntity = navMeshQuery()[0]

  // Sanity checks
  if (!mapEntity || !viewerEntity) return
  if (mapEntities.length > 1) console.warn('Not supported: More than one map!')

  // MAP STATE RECEPTORS
  for (const action of mapStateInitializeActionQueue()) MapStateReceptor.mapInitializeActionReceptor(action)
  for (const action of mapStateSetPropertyActionQueue()) MapStateReceptor.mapSetPropertyActionReceptor(action)

  const mapState = getMutableState(MapState)
  const mapScale = mapState.scale.value
  const object3dComponent = getComponent(mapEntity, GroupComponent)
  const viewerTransform = getComponent(viewerEntity, TransformComponent)
  const viewerPosition = vectorToArray(viewerTransform.position)
  const viewerPositionScaled = multiplyArray(viewerPosition, 1 / mapScale)
  const navigationRaycastTarget = getComponent(navPlaneEntity, NavMeshComponent).navTarget
  const avatar = getComponent(viewerEntity, AvatarComponent)

  // Initialize on first pass or whenever the viewer changes
  if (viewerEntity !== previousViewerEntity) {
    $previousViewerPosition.copy(viewerTransform.position)
  }

  // Find how far the viewer has travelled since last update, in real-world scale (scale=1)
  // TODO only compare x, z components of positions
  $vector3.subVectors(viewerTransform.position, $previousViewerPosition).divideScalar(mapScale)
  vectorToArray($vector3, $normalScaleViewerPositionDelta)
  const viewerDistanceFromCenterSquared =
    $normalScaleViewerPositionDelta[0] * $normalScaleViewerPositionDelta[0] +
    $normalScaleViewerPositionDelta[1] * $normalScaleViewerPositionDelta[1]

  const wasRefreshTriggered =
    viewerDistanceFromCenterSquared >= mapState.triggerRefreshRadius.value * mapState.triggerRefreshRadius.value
  const wasMapCenterUpdated =
    typeof $previousMapCenterPoint[0] !== 'undefined' &&
    typeof $previousMapCenterPoint[1] !== 'undefined' &&
    ($previousMapCenterPoint[0] !== mapState.center.value[0] || $previousMapCenterPoint[1] !== mapState.center.value[1])

  if (wasMapCenterUpdated) {
    mapState.viewerPosition.value[0] = $previousViewerPosition[0] = 0
    mapState.viewerPosition.value[1] = $previousViewerPosition[1] = 0
    viewerTransform.position.set(0, 0, 0)
    resetPhases(mapState.value, phases)
  }

  if (wasRefreshTriggered || wasMapCenterUpdated) {
    const tempMapState = { ...mapState.value }
    tempMapState.center = fromMetersFromCenter($normalScaleViewerPositionDelta, tempMapState.center)
    tempMapState.viewerPosition = viewerPosition
    startPhases(tempMapState, phases)

    $previousViewerPosition.copy(viewerTransform.position)
    $previousViewerPosition.y = 0
  }

  $previousMapCenterPoint[0] = mapState.center.value[0]
  $previousMapCenterPoint[1] = mapState.center.value[1]

  // Perf hack: Start with an empty array so that any children that have been purged or that do not meet the criteria for adding are implicitly removed.
  if (mapState.updateSpinner && mapState.activePhase !== null && mapState.completeObjects.value.size === 0) {
    const spinner = mapState.updateSpinner.value!
    spinner.rotation.y = spinnerAngle
    spinnerAngle = (spinnerAngle + 0.01) % PI2

    object3dComponent[0].children.length = 0
    navigationRaycastTarget.children.length = 0
    object3dComponent[0].children[0] = spinner

    object3dComponent[0].children[1] = mapState.updateTextContainer.value!

    avatar.model!.visible = false
    addComponent(viewerEntity, TargetCameraRotationComponent, {
      time: 0,
      phi: 0,
      theta: 0,
      phiVelocity: { value: Math.PI },
      thetaVelocity: { value: Math.PI }
    })
  } else if (mapState.activePhase.value === 'UpdateScene') {
    avatar.model!.visible = true
    object3dComponent[0].children.length = 0
    for (const key of mapState.completeObjects.value.keys()) {
      const object = mapState.completeObjects.value.get(key)
      if (object.mesh) {
        if (
          isIntersectCircleCircle(
            viewerPositionScaled,
            mapState.minimumSceneRadius.value * mapState.scale.value,
            object.centerPoint,
            object.boundingCircleRadius
          ) &&
          key[0] !== 'landuse_fallback'
        ) {
          setPosition(object.mesh, object.centerPoint)
          addChildFast(object3dComponent[0], object.mesh)
        } else {
          object.mesh.parent = null
        }
      }
    }
    for (const label of mapState.labelCache.value.values()) {
      if (label.mesh) {
        if (
          isIntersectCircleCircle(
            viewerPositionScaled,
            mapState.labelRadius.value * mapState.scale.value,
            label.centerPoint,
            label.boundingCircleRadius
          )
        ) {
          setPosition(label.mesh, label.centerPoint)
          addChildFast(object3dComponent[0], label.mesh)
        } else {
          label.mesh.parent = null
        }
      }
    }
    // navigationRaycastTarget.children.length = 0
    for (const key of mapState.completeObjects.value.keys()) {
      const layerName = key[0]
      if (layerName === 'landuse_fallback') {
        const { mesh, centerPoint } = mapState.completeObjects.value.get(key)
        setPosition(mesh, centerPoint)

        addChildFast(navigationRaycastTarget, mesh)
      }
    }
    for (const helpers of mapState.helpersCache.value.values()) {
      if (helpers.tileNavMesh) {
        addChildFast(object3dComponent[0], helpers.tileNavMesh)
      }
    }

    // Update (sub)scene
    MapStateService.setProperty({ activePhase: null })
  }

  // Update labels
  if (Math.round(Engine.instance.elapsedSeconds / Engine.instance.fixedDeltaSeconds) % 20 === 0) {
    for (const label of mapState.labelCache.value.values()) {
      if (label.mesh) {
        if (
          isIntersectCircleCircle(
            viewerPositionScaled,
            mapState.labelRadius.value * mapState.scale.value,
            label.centerPoint,
            label.boundingCircleRadius
          )
        ) {
          label.mesh.update()
        }
      }
    }
    previousViewerEntity = viewerEntity
  }
}

const MapUpdateSystem = defineSystem({
  uuid: 'ee.map.MapUpdateSystem',
  execute
})

export default MapUpdateSystem
