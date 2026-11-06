// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useGamesStats } from './statsStore'

// The key the built-in games wrote to: keeping it is what brings the best times
// back when Games is installed after the built-ins are gone.
const KEY = 'imbatranimos:games'

beforeEach(() => {
  localStorage.clear()
  useGamesStats.setState({
    minesweeper: { wins: 0, losses: 0, best: {} },
    solitaire: { wins: 0, losses: 0 },
  })
})

describe('the games stats store', () => {
  it('persists under the built-in key', () => {
    expect(useGamesStats.persist.getOptions().name).toBe(KEY)
    useGamesStats.getState().recordMinesweeper('win', 'beginner', 42)
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as {
      state?: { minesweeper?: { best?: Record<string, number> } }
    }
    expect(saved.state?.minesweeper?.best).toEqual({ beginner: 42 })
  })

  it('reads back what the built-in saved', async () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        state: {
          minesweeper: { wins: 3, losses: 1, best: { intermediate: 95 } },
          solitaire: { wins: 2, losses: 0 },
        },
        version: 0,
      })
    )
    await useGamesStats.persist.rehydrate()
    expect(useGamesStats.getState().minesweeper.best).toEqual({ intermediate: 95 })
    expect(useGamesStats.getState().solitaire.wins).toBe(2)
  })

  it('keeps the fastest win per difficulty and counts losses', () => {
    const { recordMinesweeper } = useGamesStats.getState()
    recordMinesweeper('win', 'beginner', 50)
    recordMinesweeper('win', 'beginner', 70)
    recordMinesweeper('loss', 'beginner', 5)
    recordMinesweeper('win', 'beginner', 31)
    expect(useGamesStats.getState().minesweeper).toEqual({
      wins: 3,
      losses: 1,
      best: { beginner: 31 },
    })
  })
})
