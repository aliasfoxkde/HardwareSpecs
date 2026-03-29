import { useState, useMemo } from 'react'
import { getVendors, getDevicesByCategory } from '@/lib/api'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { VendorDistributionPie, CategoryDistributionPie, PriceBandPie } from '@/components/charts/MarketPieCharts'
import { TopTopsBarChart, TopTopsPerDollarChart, TopTopsPerWattChart } from '@/components/charts/PerformanceRankings'
import { PerfVsPriceChart, TopsVsPriceChart } from '@/components/charts/ScatterWithRegression'
import { TdpOverTimeChart, TopsOverTimeChart, PriceOverTimeChart, ProcessOverTimeChart } from '@/components/charts/TimeSeriesChart'
import { PriceTdpHeatmap, VendorPerfHeatmap } from '@/components/charts/HeatmapChart'
import { MultiMetricComparison, PricePerfStacked } from '@/components/charts/StackedMetrics'
import { TopDevicesRadar } from '@/components/charts/RadarComparison'
import { InfographicPanel } from '@/components/charts/InfographicPanel'
import { getVendorColor } from '@/components/charts/chartUtils'
import type { DeviceCategory } from '@/types'

const categories: DeviceCategory[] = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System']

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'performance', label: 'Performance' },
  { id: 'value', label: 'Value' },
  { id: 'efficiency', label: 'Efficiency' },
  { id: 'trends', label: 'Trends' },
  { id: 'compare', label: 'Compare' },
  { id: 'report', label: 'Report' },
] as const

type TabId = typeof tabs[number]['id']

export function ChartsPage() {
  const [activeCategory, setActiveCategory] = useState<DeviceCategory>('GPU')
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const vendors = useMemo(() => getVendors(), [])
  const categoryDevices = useMemo(() => getDevicesByCategory(activeCategory), [activeCategory])
  const uniqueVendorIds = useMemo(() => [...new Set(categoryDevices.map(d => d.vendor.vendorId))], [categoryDevices])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Charts & Visualizations</h1>
      <p className="text-sm text-text-secondary mb-6">Interactive charts for hardware performance, pricing, and efficiency.</p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-brand-600 text-text-primary'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap ml-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-text-primary'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-border-subtle/30">
        {uniqueVendorIds.map(vendorId => {
          const vendor = vendors.find(v => v.vendorId === vendorId)
          return (
            <div key={vendorId} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getVendorColor(vendorId) }} />
              <span className="text-xs text-text-secondary">{vendor?.name ?? vendorId}</span>
            </div>
          )
        })}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartContainer title={`Vendor Share — ${activeCategory}`}>
            <VendorDistributionPie category={activeCategory} />
          </ChartContainer>
          <ChartContainer title="Category Distribution (All)">
            <CategoryDistributionPie />
          </ChartContainer>
          <ChartContainer title={`Price Bands — ${activeCategory}`}>
            <PriceBandPie category={activeCategory} />
          </ChartContainer>
          <ChartContainer title={`Vendor Performance Overview — ${activeCategory}`}>
            <VendorPerfHeatmap category={activeCategory} />
          </ChartContainer>
        </div>
      )}

      {/* Performance */}
      {activeTab === 'performance' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartContainer title={`TOP 20 INT8 TOPS — ${activeCategory}`}>
            <TopTopsBarChart limit={20} />
          </ChartContainer>
          <ChartContainer title={`Compute Stacked (FP32 + FP16 + INT8) — ${activeCategory}`}>
            <MultiMetricComparison category={activeCategory} />
          </ChartContainer>
          <ChartContainer title={`INT8 TOPS vs Price — ${activeCategory}`}>
            <TopsVsPriceChart category={activeCategory} />
          </ChartContainer>
          <ChartContainer title={`Performance Score vs Price — ${activeCategory}`}>
            <PerfVsPriceChart category={activeCategory} />
          </ChartContainer>
        </div>
      )}

      {/* Value */}
      {activeTab === 'value' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartContainer title={`TOP 20 TOPS/$ — ${activeCategory}`}>
            <TopTopsPerDollarChart limit={20} />
          </ChartContainer>
          <ChartContainer title={`TOP 20 TOPS/W — ${activeCategory}`}>
            <TopTopsPerWattChart limit={20} />
          </ChartContainer>
          <ChartContainer title={`Price-TDP Heatmap — ${activeCategory}`}>
            <PriceTdpHeatmap category={activeCategory} />
          </ChartContainer>
          <ChartContainer title={`Price Perf Stacked — ${activeCategory}`}>
            <PricePerfStacked category={activeCategory} />
          </ChartContainer>
        </div>
      )}

      {/* Efficiency */}
      {activeTab === 'efficiency' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartContainer title={`TOPS/$ Rankings — ${activeCategory}`}>
            <TopTopsPerDollarChart limit={20} />
          </ChartContainer>
          <ChartContainer title={`TOPS/W Rankings — ${activeCategory}`}>
            <TopTopsPerWattChart limit={20} />
          </ChartContainer>
          <ChartContainer title={`Vendor Efficiency Heatmap — ${activeCategory}`}>
            <VendorPerfHeatmap category={activeCategory} />
          </ChartContainer>
          <ChartContainer title={`Multi-Metric Stacked — ${activeCategory}`}>
            <MultiMetricComparison category={activeCategory} />
          </ChartContainer>
        </div>
      )}

      {/* Trends */}
      {activeTab === 'trends' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartContainer title={`TDP Trend by Vendor — ${activeCategory}`}>
            <TdpOverTimeChart category={activeCategory} />
          </ChartContainer>
          <ChartContainer title={`INT8 TOPS Trend by Vendor — ${activeCategory}`}>
            <TopsOverTimeChart category={activeCategory} />
          </ChartContainer>
          <ChartContainer title={`Avg Price Trend by Vendor — ${activeCategory}`}>
            <PriceOverTimeChart category={activeCategory} />
          </ChartContainer>
          <ChartContainer title={`Process Node Trend by Vendor — ${activeCategory}`}>
            <ProcessOverTimeChart category={activeCategory} />
          </ChartContainer>
        </div>
      )}

      {/* Compare (Radar) */}
      {activeTab === 'compare' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartContainer title={`Top 5 Radar — ${activeCategory}`}>
            <TopDevicesRadar category={activeCategory} />
          </ChartContainer>
          <ChartContainer title={`TOPS Comparison — ${activeCategory}`}>
            <TopTopsBarChart limit={15} />
          </ChartContainer>
          <ChartContainer title={`TOPS/$ Comparison — ${activeCategory}`}>
            <TopTopsPerDollarChart limit={15} />
          </ChartContainer>
          <ChartContainer title={`TOPS/W Comparison — ${activeCategory}`}>
            <TopTopsPerWattChart limit={15} />
          </ChartContainer>
        </div>
      )}

      {/* Report */}
      {activeTab === 'report' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartContainer title={`${activeCategory} Report`}>
              <InfographicPanel category={activeCategory} />
            </ChartContainer>
          </div>
          <div className="space-y-6">
            <ChartContainer title={`Vendor Share — ${activeCategory}`}>
              <VendorDistributionPie category={activeCategory} />
            </ChartContainer>
            <ChartContainer title={`Price Bands — ${activeCategory}`}>
              <PriceBandPie category={activeCategory} />
            </ChartContainer>
          </div>
        </div>
      )}
    </div>
  )
}
