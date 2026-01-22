"use client"

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'
import { Label } from '@/components/ui/label'

export default function SearchFilters({
  query,
  setQuery,
  showFilters,
  setShowFilters,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
}: any) {
  return (
    <>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID or email..."
          className="pl-10 h-11 bg-card border-none shadow-sm focus-visible:ring-primary"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search staff"
        />
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 bg-card border-none shadow-sm"
          onClick={() => setShowFilters((s: boolean) => !s)}
          aria-expanded={showFilters}
        >
          <Filter className="h-4 w-4" />
        </Button>

        {showFilters && (
          <div className="absolute right-0 mt-2 w-64 bg-popover border rounded shadow p-4 z-20">
            <div className="space-y-3">
              <div>
                <Label>Type</Label>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{typeFilter === 'all' ? 'All' : typeFilter === 'teaching' ? 'Teaching' : 'Non-teaching'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="teaching">Teaching</SelectItem>
                    <SelectItem value="non-teaching">Non-teaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{statusFilter === 'all' ? 'All' : statusFilter === 'active' ? 'Active' : 'Inactive'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setQuery(''); setShowFilters(false); }}>
                  Reset
                </Button>
                <Button onClick={() => setShowFilters(false)}>Apply</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
