import { useState, useEffect } from 'react'
import { CompletenessChart } from '@/components/reports/CompletenessChart'
import { CategoryCoverageChart } from '@/components/reports/CategoryCoverageChart'
import { VendorDistributionChart } from '@/components/reports/VendorDistributionChart'
import { DataGapsReport } from '@/components/reports/DataGapsReport'
import { TopPerformersReport } from '@/components/reports/TopPerformersReport'
import { PriceAnalysisReport } from '@/components/reports/PriceAnalysisReport'
import { ProcessNodeReport } from '@/components/reports/ProcessNodeReport'
import { MemoryAnalysisReport } from '@/components/reports/MemoryAnalysisReport'
import { VendorDeepDiveReport } from '@/components/reports/VendorDeepDiveReport'
import { LaunchTimelineReport } from '@/components/reports/LaunchTimelineReport'

const REPORTS = [
  { id: 'overview', name: 'Overview', icon: '📊', description: 'Data completeness distribution and summary stats', component: CompletenessChart },
  { id: 'categories', name: 'Categories', icon: '📁', description: 'Device and data coverage by category', component: CategoryCoverageChart },
  { id: 'vendors', name: 'Vendors', icon: '🏢', description: 'Vendor distribution and device counts', component: VendorDistributionChart },
  { id: 'gaps', name: 'Data Gaps', icon: '🔍', description: 'Devices missing key data fields', component: DataGapsReport },
  { id: 'performers', name: 'Top Performers', icon: '🏆', description: 'Best value and efficiency rankings', component: TopPerformersReport },
  { id: 'price', name: 'Price Analysis', icon: '💵', description: 'Price distribution, value bands, and price vs performance', component: PriceAnalysisReport },
  { id: 'process', name: 'Process Node', icon: '🔬', description: 'Process technology analysis and performance correlation', component: ProcessNodeReport },
  { id: 'memory', name: 'Memory', icon: '🧠', description: 'Memory types, capacity, and bandwidth analysis', component: MemoryAnalysisReport },
  { id: 'vendor-deep', name: 'Vendor Deep Dive', icon: '🏢', description: 'Detailed vendor-level analysis and comparison', component: VendorDeepDiveReport },
  { id: 'timeline', name: 'Timeline', icon: '📅', description: 'Launch dates, trends, and generational analysis', component: LaunchTimelineReport },
] as const

export function ReportsPage() {
  useEffect(() => { document.title = 'Data Reports | SiliconRank'; return () => { document.title = 'SiliconRank' } }, [])
  const [activeReport, setActiveReport] = useState<string>('overview')
  const ActiveComponent = REPORTS.find(r => r.id === activeReport)?.component ?? CompletenessChart

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <p className="text-sm text-text-secondary mt-1">Data quality, coverage analysis, and performance rankings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 shrink-0">
          <div role="tablist" aria-label="Report selection" className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {REPORTS.map(report => (
              <button
                key={report.id}
                role="tab"
                id={`report-tab-${report.id}`}
                aria-selected={activeReport === report.id}
                aria-controls={`report-panel-${report.id}`}
                tabIndex={activeReport === report.id ? 0 : -1}
                onClick={() => setActiveReport(report.id)}
                onKeyDown={(e) => {
                  const idx = REPORTS.findIndex(r => r.id === report.id)
                  if (e.key === 'ArrowDown') { const next = REPORTS[(idx + 1) % REPORTS.length]; setActiveReport(next.id); document.getElementById(`report-tab-${next.id}`)?.focus() }
                  if (e.key === 'ArrowUp') { const prev = REPORTS[(idx - 1 + REPORTS.length) % REPORTS.length]; setActiveReport(prev.id); document.getElementById(`report-tab-${prev.id}`)?.focus() }
                }}
                className={`px-4 py-3 rounded-lg text-left text-sm whitespace-nowrap transition-colors ${
                  activeReport === report.id
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
                }`}
              >
                <span className="mr-2">{report.icon}</span>
                {report.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active report */}
        <div role="tabpanel" id={`report-panel-${activeReport}`} aria-labelledby={`report-tab-${activeReport}`} className="flex-1 bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}
