import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { worker } from './mocks/browser'

const queryClient = new QueryClient()

async function clearMockWorker() {
  if (!('serviceWorker' in navigator)) return
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(
    registrations
      .filter((registration) => registration.active?.scriptURL.includes('mockServiceWorker.js'))
      .map((registration) => registration.unregister()),
  )
}

await clearMockWorker()
await worker.start({ onUnhandledRequest: 'bypass' })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
