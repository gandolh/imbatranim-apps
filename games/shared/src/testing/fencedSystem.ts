import type { SystemHandle } from '@imbatranim/ui'
import template from '../../../os/descriptor.template.json'

/**
 * Members of the handle every app gets, capability or not. The OS's list, in
 * `scopeHandle.ts` of its marketplace module; keep the two the same.
 */
const ALWAYS = new Set([
  'protocolVersion',
  'appId',
  'windowId',
  'window',
  'appearance',
  'sound',
  'on',
  'server',
])

/**
 * `system` fenced to the capabilities the group's descriptor grants `appId`,
 * as the desktop fences a catalog app: touching any other member throws. A
 * render through it fails when the app reaches for a capability the
 * descriptor does not list.
 */
export function fencedSystem(system: SystemHandle, appId: string): SystemHandle {
  const app = template.apps.find((a) => a.id === appId)
  if (!app) throw new Error(`os/descriptor.template.json has no app ${appId}`)
  const allowed = new Set([...ALWAYS, ...app.capabilities])
  return new Proxy(system, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && !allowed.has(prop) && prop in target) {
        throw new Error(`${appId} did not ask for system.${prop}`)
      }
      return Reflect.get(target, prop, receiver) as unknown
    },
  })
}
