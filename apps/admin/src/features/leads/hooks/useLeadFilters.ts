'use client'

import { useQueryStates, parseAsString, parseAsArrayOf, parseAsInteger } from 'nuqs'

export function useLeadFilters() {
  return useQueryStates({
    search:     parseAsString.withDefault(''),
    status:     parseAsArrayOf(parseAsString).withDefault([]),
    priority:   parseAsString.withDefault(''),
    assignedTo: parseAsString.withDefault(''),
    source:     parseAsString.withDefault(''),
    dateFrom:   parseAsString.withDefault(''),
    dateTo:     parseAsString.withDefault(''),
    page:       parseAsInteger.withDefault(1),
    pageSize:   parseAsInteger.withDefault(25),
    sortBy:     parseAsString.withDefault('created_at'),
    sortOrder:  parseAsString.withDefault('desc'),
    view:       parseAsString.withDefault('list'),
  })
}
