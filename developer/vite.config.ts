// `npm run build:os --workspace=developer`: the Developer group's build,
// the one its descriptor runs after `npm ci --workspace=developer`. The
// group is its own build root (apps/, dist/os); the kit snapshot is the repo's.
import { join } from 'node:path'
import { defineConfig } from 'vite'
import { osBuildConfig } from '../packages/shared/src/build/index.ts'

const repo = join(import.meta.dirname, '..')

export default defineConfig(
  osBuildConfig({
    root: import.meta.dirname,
    vendorDir: join(repo, 'vendor', 'imbatranim-ui'),
    sharedDir: join(import.meta.dirname, 'shared', 'src'),
  })
)
