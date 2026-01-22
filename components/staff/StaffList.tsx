"use client"

import StaffCard from './StaffCard'
import { Loader2 } from 'lucide-react'
import { StaffItem } from './types'

export default function StaffList({ staffs, isLoading, fetchError }: { staffs: StaffItem[]; isLoading: boolean; fetchError: string | null }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {isLoading ? (
        <div className="col-span-full flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading staff...</span>
        </div>
      ) : fetchError ? (
        <div className="col-span-full p-6 bg-rose-50 text-rose-700 rounded">
          <strong>Failed to load staff:</strong> {fetchError}
        </div>
      ) : staffs.length === 0 ? (
        <div className="col-span-full p-6 bg-muted/5 rounded text-muted-foreground">No staff match your search or filters.</div>
      ) : (
        staffs.map((s) => <StaffCard key={s._id || s.empId} staff={s} />)
      )}
    </div>
  )
}
