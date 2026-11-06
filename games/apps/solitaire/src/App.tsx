import { Solitaire } from './Solitaire'

/**
 * The module the desktop renders for `solitaire`. The built-in's manifest
 * became this component plus the Games descriptor's entry, which carries the
 * name, icon, window sizes and `multiInstance: false`. The id is the
 * built-in's, so a pin, a startup entry and the win count (the stats store's
 * key) come back when Games is installed.
 */
export function App() {
  return <Solitaire />
}
