import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'; // 🟢 Global Error Boundary

// 1. Import React Query parts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools' // Optional: Amazing for debugging

// 2. Create the "Brain" (Client)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                // 🛡️ STOP retry loop if 401, 403, 429, or total failure
                if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 429) {
                    return false;
                }
                return failureCount < 2; // Retry twice for other intermittent errors
            },
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential Backoff: 1s, 2s, 4s...
            refetchOnWindowFocus: false, // Don't refetch on tab switch (prevents 429 on toggle)
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* 3. Wrap your App */}
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
            {/* Optional: Adds a floating flower icon to inspect cache in dev mode */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
)