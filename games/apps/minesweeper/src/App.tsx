import { Minesweeper } from './Minesweeper'

/**
 * The module the desktop renders for `minesweeper`. The built-in's manifest
 * became this component plus the Games descriptor's entry, which carries the
 * name, icon, window sizes and `multiInstance: false`. The id is the
 * built-in's, so a pin, a startup entry and the best times (the stats store's
 * key) come back when Games is installed.
 */
export function App() {
  return <Minesweeper />
}
