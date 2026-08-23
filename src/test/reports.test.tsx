import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopPerformersReport } from '@/components/reports/TopPerformersReport'
import { DataGapsReport } from '@/components/reports/DataGapsReport'
import { LaunchTimelineReport } from '@/components/reports/LaunchTimelineReport'
import { MemoryAnalysisReport } from '@/components/reports/MemoryAnalysisReport'
import { PriceAnalysisReport } from '@/components/reports/PriceAnalysisReport'
import { ProcessNodeReport } from '@/components/reports/ProcessNodeReport'
import { VendorDeepDiveReport } from '@/components/reports/VendorDeepDiveReport'
import { CategoryCoverageChart } from '@/components/reports/CategoryCoverageChart'
import { CompletenessChart } from '@/components/reports/CompletenessChart'
import { VendorDistributionChart } from '@/components/reports/VendorDistributionChart'

describe('Report Components', () => {
  describe('TopPerformersReport', () => {
    it('renders section heading', () => {
      render(<TopPerformersReport />)
      expect(screen.getByText('Top Performers')).toBeDefined()
    })

    it('renders TOPS/$ heading', () => {
      render(<TopPerformersReport />)
      expect(screen.getByText(/TOPS.*\$/i)).toBeDefined()
    })

    it('renders TOPS/W heading', () => {
      render(<TopPerformersReport />)
      expect(screen.getByText(/TOPS.*W/i)).toBeDefined()
    })
  })

  describe('DataGapsReport', () => {
    it('renders section', () => {
      render(<DataGapsReport />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('LaunchTimelineReport', () => {
    it('renders section', () => {
      render(<LaunchTimelineReport />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('MemoryAnalysisReport', () => {
    it('renders section', () => {
      render(<MemoryAnalysisReport />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('PriceAnalysisReport', () => {
    it('renders section', () => {
      render(<PriceAnalysisReport />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('ProcessNodeReport', () => {
    it('renders section', () => {
      render(<ProcessNodeReport />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('VendorDeepDiveReport', () => {
    it('renders section', () => {
      render(<VendorDeepDiveReport />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('CategoryCoverageChart', () => {
    it('renders section', () => {
      render(<CategoryCoverageChart />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('CompletenessChart', () => {
    it('renders section', () => {
      render(<CompletenessChart />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('VendorDistributionChart', () => {
    it('renders section', () => {
      render(<VendorDistributionChart />)
      expect(document.body.textContent).toBeTruthy()
    })
  })
})
