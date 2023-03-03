import type { ProjectConfigInterface } from '@etherealengine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: undefined,
  thumbnail: '/static/etherealengine_thumbnail.jpg',
  worldInjection: () => import('./worldInjection'),
  routes: {},
  services: undefined,
  databaseSeed: undefined
}

export default config
