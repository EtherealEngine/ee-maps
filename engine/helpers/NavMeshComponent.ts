import { Object3D } from 'three'
import { NavMesh } from 'yuka'

import { createMappedComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

export type NavMeshComponentType = {
  yukaNavMesh?: NavMesh
  navTarget: Object3D
}

export const NavMeshComponent = createMappedComponent<NavMeshComponentType>('NavMeshComponent')