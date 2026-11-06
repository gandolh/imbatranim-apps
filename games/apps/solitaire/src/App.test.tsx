// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import {
  cleanupRendered,
  createFakeSystem,
  renderWithSystem,
} from '@imbatranim-office/shared/testing'
import { fencedSystem } from '../../../shared/src/testing/fencedSystem'
import { App } from './App'

afterEach(cleanupRendered)

describe('Solitaire as a kit app', () => {
  it('deals a game with only the capabilities its descriptor grants', () => {
    const { system } = createFakeSystem({ appId: 'solitaire' })
    const { container } = renderWithSystem(<App />, fencedSystem(system, 'solitaire'))
    expect(container.querySelectorAll('[aria-label^="Foundation "]')).toHaveLength(4)
    expect(container.querySelector('[aria-label="Draw from stock"]')).not.toBeNull()
  })
})
