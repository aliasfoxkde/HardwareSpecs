import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const BrowsePage = lazy(() => import('@/pages/BrowsePage').then(m => ({ default: m.BrowsePage })))
const DevicePage = lazy(() => import('@/pages/DevicePage').then(m => ({ default: m.DevicePage })))
const ComparePage = lazy(() => import('@/pages/ComparePage').then(m => ({ default: m.ComparePage })))
const ChartsPage = lazy(() => import('@/pages/ChartsPage').then(m => ({ default: m.ChartsPage })))
const StudioPage = lazy(() => import('@/pages/StudioPage').then(m => ({ default: m.StudioPage })))
const ToolsPage = lazy(() => import('@/pages/ToolsPage').then(m => ({ default: m.ToolsPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ReportsPage })))
const DocsPage = lazy(() => import('@/pages/DocsPage').then(m => ({ default: m.DocsPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
            <Route path="/browse" element={<ErrorBoundary><BrowsePage /></ErrorBoundary>} />
            <Route path="/device/:deviceId" element={<ErrorBoundary><DevicePage /></ErrorBoundary>} />
            <Route path="/compare" element={<ErrorBoundary><ComparePage /></ErrorBoundary>} />
            <Route path="/charts" element={<ErrorBoundary><ChartsPage /></ErrorBoundary>} />
            <Route path="/studio" element={<ErrorBoundary><StudioPage /></ErrorBoundary>} />
            <Route path="/tools" element={<ErrorBoundary><ToolsPage /></ErrorBoundary>} />
            <Route path="/reports" element={<ErrorBoundary><ReportsPage /></ErrorBoundary>} />
            <Route path="/docs" element={<ErrorBoundary><DocsPage /></ErrorBoundary>} />
            <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
