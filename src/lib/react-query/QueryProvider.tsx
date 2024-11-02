import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// Instantiate a new QueryClient instance to manage server state
const queryClient = new QueryClient();

/**
 * QueryProvider Component
 * A wrapper component to provide react-query's QueryClient context to all child components.
 * This enables the use of react-query hooks like useQuery and useMutation within the component tree.
 *
 * @param {ReactNode} children - The nested child components that require access to react-query context.
 */
export const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
