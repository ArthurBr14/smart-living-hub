import type { QueryClient } from '@tanstack/react-query'

/** Drop account data before a new identity can reuse any cached results. */
export function clearPreviousAccount(queryClient: QueryClient, previousId: string | null, nextId: string | null) {
  if (previousId === nextId) return false
  void queryClient.cancelQueries()
  queryClient.clear()
  return true
}