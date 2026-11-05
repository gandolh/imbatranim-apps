import type { KitAppProps } from '@imbatranim-office/shared'
import { CadApp } from './ui/CadApp'

/**
 * CAD: a 2D drafting app in the AutoCAD mould. A command line
 * that takes typed coordinates and the toolbar start the same commands;
 * drawings are DXF files opened and saved through the desktop, and DWG
 * files open through the suite's server, which converts them to DXF.
 */
export function App(_props: KitAppProps) {
  // The suite's server, for DWG, is asked for through `system.server` when a
  // DWG needs it; `host.server` is always null for a kit app.
  return <CadApp />
}
