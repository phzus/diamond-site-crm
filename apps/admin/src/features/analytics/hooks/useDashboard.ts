'use client'

import { useQuery } from '@tanstack/react-query'
import { getDashboardMetrics, getStatusDistribution, getRecentLeads } from '../services/analytics.service'

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
  })
}

export function useStatusDistribution() {
  return useQuery({
    queryKey: ['status-distribution'],
    queryFn: getStatusDistribution,
  })
}

export function useRecentLeads() {
  return useQuery({
    queryKey: ['recent-leads'],
    queryFn: getRecentLeads,
  })
}
