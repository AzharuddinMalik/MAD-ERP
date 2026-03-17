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
            retry: 1, // If API fails, retry once before showing error
            refetchOnWindowFocus: false, // Don't refetch every time user clicks back to the tab
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <React.StrictMode>
            {/* 3. Wrap your App */}
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <App />
                </ErrorBoundary>
                {/* Optional: Adds a floating flower icon to inspect cache in dev mode */}
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </React.StrictMode>,
    </React.StrictMode>,
)