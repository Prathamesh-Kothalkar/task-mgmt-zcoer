"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MoreVertical, Mail, Award as IdCard, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Suspense } from "react"

type StaffItem = {
  _id?: string
  empId?: string
  name: string
  email?: string
  phone?: string
  staffType?: string[]
  isActive?: boolean
  designation?: string
}


function StaffContent() {
  const [isAdding, setIsAdding] = useState(false)
  const { data: session } = useSession()

  // form state
  const [fullName, setFullName] = useState('')
  const [empId, setEmpId] = useState('')
  const [email, setEmail] = useState('')
  const [staffType, setStaffType] = useState('teaching')
  const [designation, setDesignation] = useState('')
  const [phone, setPhone] = useState('')

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  // fetched staff list
  const [staffs, setStaffs] = useState<StaffItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [refreshFlag, setRefreshFlag] = useState(0)
  // search & filter
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'all' | 'teaching' | 'non-teaching'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    const ac = new AbortController()
    let mounted = true

    async function load() {
      setIsLoading(true)
      setFetchError(null)

      try {
        const res = await fetch('/api/staff', { method: 'GET', credentials: 'same-origin', signal: ac.signal })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          if (!mounted) return
          setFetchError(body?.message || 'Failed to load staff')
          setStaffs([])
        } else {
          const body = await res.json()
          if (!mounted) return
          setStaffs(Array.isArray(body?.staff) ? body.staff : [])
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.error('Failed to fetch staff', err)
        if (!mounted) return
        setFetchError(err?.message || 'Failed to fetch staff')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
      ac.abort()
    }
  }, [refreshFlag, session])

  // debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  // client-side filtered results
  const filteredStaffs = useMemo(() => {
    const q = debouncedQuery.toLowerCase()
    return staffs.filter((s) => {
      if (!s) return false

      // status filter
      if (statusFilter !== 'all') {
        const isActive = !!s.isActive
        if (statusFilter === 'active' && !isActive) return false
        if (statusFilter === 'inactive' && isActive) return false
      }

      // type filter
      if (typeFilter !== 'all') {
        const types = (s.staffType || []).map((t) => String(t).toLowerCase())
        if (typeFilter === 'teaching' && !types.includes('teaching') && !types.includes('TEACHING')) return false
        if (typeFilter === 'non-teaching' && !types.includes('non-teaching') && !types.includes('NON-TEACHING')) return false
      }

      if (!q) return true

      // match name, email, empId
      const name = (s.name || '').toLowerCase()
      const email = (s.email || '').toLowerCase()
      const emp = (s.empId || '').toLowerCase()
      return name.includes(q) || email.includes(q) || emp.includes(q)
    })
  }, [staffs, debouncedQuery, typeFilter, statusFilter])

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Staff Directory</h2>
            <p className="text-sm text-muted-foreground">Manage your department's teaching and non-teaching staff.</p>
          </div>

          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="font-bold shadow-md h-11 px-6 rounded-xl">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="p-6 bg-primary text-primary-foreground">
                <DialogTitle className="text-xl font-bold">Register New Staff</DialogTitle>
                <DialogDescription className="text-primary-foreground/80">
                  Fill in the details to add a new member to the Computer Engineering department.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="e.g. Prof. J. Doe" className="bg-muted/50" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empId">Employee ID</Label>
                    <Input id="empId" placeholder="ZES-XXXX" className="bg-muted/50" value={empId} onChange={(e) => setEmpId(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Official Email</Label>
                  <Input id="email" type="email" placeholder="name@zealedu.in" className="bg-muted/50" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="9000000000" className="bg-muted/50" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Staff Type</Label>
                    <Select value={staffType} onValueChange={(v) => setStaffType(v)}>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teaching">Teaching</SelectItem>
                        <SelectItem value="non-teaching">Non-teaching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input id="designation" placeholder="Asst. Professor" className="bg-muted/50" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-normal">
                    <span className="inline-block mr-1">ℹ️</span>
                    Credentials will be auto-generated and sent via email upon submission.
                  </p>
                </div>
              </div>
              <DialogFooter className="p-6 pt-0">
                <Button variant="outline" onClick={() => setIsAdding(false)} className="rounded-xl">
                  Cancel
                </Button>
                <div className="flex items-center gap-3">
                  {createError && <div className="text-sm text-rose-600">{createError}</div>}
                  {createSuccess && <div className="text-sm text-emerald-600">{createSuccess}</div>}
                  <Button
                    className="font-bold px-8 rounded-xl shadow-md hover:shadow-lg transition-all"
                    onClick={async () => {
                      // submit
                      setCreateError(null)
                      setCreateSuccess(null)
                      setCreating(true)

                      if (!session || !session.user) {
                        setCreateError('You must be signed in as HOD to create staff')
                        setCreating(false)
                        return
                      }

                      // split name
                      const parts = fullName.trim().split(/\s+/)
                      const firstName = parts.shift() || ''
                      const lastName = parts.join(' ') || ''

                      const payload = {
                        empid: empId,
                        firstName,
                        lastName,
                        email,
                        phone,
                        department: session.user.department,
                      }

                      try {
                        const res = await fetch('/api/staff', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        })

                        const body = await res.json().catch(() => ({}))
                        if (!res.ok) {
                          setCreateError(body?.message || (body?.errors ? body.errors.join(', ') : 'Failed to create staff'))
                        } else {
                          setCreateSuccess(body?.message || 'Staff created')
                          // reset form
                          setFullName('')
                          setEmpId('')
                          setEmail('')
                          setPhone('')
                          setDesignation('')
                          setStaffType('teaching')
                          // refresh staff list
                          setRefreshFlag((f) => f + 1)
                          // close dialog after brief delay
                          setTimeout(() => setIsAdding(false), 900)
                        }
                      } catch (err: any) {
                        console.error('Create staff failed', err)
                        setCreateError(err?.message || 'Failed to create staff')
                      } finally {
                        setCreating(false)
                      }
                    }}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                      </>
                    ) : (
                      'Create Staff'
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
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
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
              aria-pressed={showFilters}
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
        </div>

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
          ) : filteredStaffs.length === 0 ? (
            <div className="col-span-full p-6 bg-muted/5 rounded text-muted-foreground">No staff match your search or filters.</div>
          ) : (
            filteredStaffs.map((staff) => {
              const status = staff.isActive ? 'Active' : 'Inactive'
              const typeLabel = staff.staffType && staff.staffType.length > 0 ? (staff.staffType[0].toLowerCase() === 'non-teaching' || staff.staffType[0] === 'NON-TEACHING' ? 'Non-teaching' : 'Teaching') : '—'
              return (
                <Card key={staff._id || staff.empId} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <CardContent className="p-0 flex h-full">
                    <div className={cn('w-1.5 h-full', status === 'Active' ? 'bg-emerald-500' : 'bg-muted')} />
                    <div className="p-5 flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                      <Avatar className="h-16 w-16 border-4 border-muted group-hover:border-primary/20 transition-colors">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {staff.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg leading-none">{staff.name}</h3>
                          <Badge
                            variant={status === 'Active' ? 'default' : 'secondary'}
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5',
                              status === 'Active' && 'bg-emerald-500 hover:bg-emerald-600',
                            )}
                          >
                            {status}
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-primary/80 uppercase tracking-wide">
                          {staff.designation || '—'} • {typeLabel}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 pt-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 mr-2 text-primary" />
                            {staff.email}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <IdCard className="h-3 w-3 mr-2 text-primary" />
                            {staff.empId}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 sm:static h-8 w-8 text-muted-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </AppShell>
  )
}

export default function StaffPage() {
  return (
    <Suspense fallback={null}>
      <StaffContent />
    </Suspense>
  )
}
