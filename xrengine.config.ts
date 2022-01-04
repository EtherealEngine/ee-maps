import type { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: undefined,
  thumbnail: '/static/xrengine_thumbnail.jpg',
  registerWorld: () => import('./registerWorld'),
  routes: {},
  services: undefined,
  databaseSeed: undefined
}

export default config
