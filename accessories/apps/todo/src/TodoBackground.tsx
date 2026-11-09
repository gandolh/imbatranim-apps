import { useTodoReminders } from './reminders'
import { useTodosQuery } from './queries/todosQueries'

/** How often the tasks are read again, so another tab's changes reach the watcher. */
const TODOS_REFETCH_MS = 60_000

/**
 * The Todo app's desktop-lifetime service: keeps the tasks read and runs the
 * due-date watcher, so "due today" and "task due" announce themselves while
 * the desktop is open, with or without a Todo window. Exported as
 * `Background` from `App.tsx`; quiet when the files can't be read, since a
 * window says so.
 */
export function TodoBackground() {
  useTodosQuery(
    { filter: 'all', listId: null },
    { refetchIntervalMs: TODOS_REFETCH_MS, quiet: true }
  )
  useTodoReminders()
  return null
}
