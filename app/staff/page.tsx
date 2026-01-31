"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Search, Filter, UserPlus } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import StaffCard from "@/components/staff/StaffCard"

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
  const { data: session } = useSession()

  const [isAdding, setIsAdding] = useState(false)

  // form state
  const [fullName, setFullName] = useState("")
  const [empId, setEmpId] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [designation, setDesignation] = useState("")
  const [staffType, setStaffType] = useState<"teaching" | "non-teaching">("teaching")

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)

  // staff list
  const [staffs, setStaffs] = useState<StaffItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [refreshFlag, setRefreshFlag] = useState(0)

  // search & filter
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState<"all" | "teaching" | "non-teaching">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  // fetch staff
  useEffect(() => {
    const ac = new AbortController()
    let mounted = true

    async function load() {
      setIsLoading(true)
      setFetchError(null)

      try {
        const res = await fetch("/api/staff", {
          method: "GET",
          credentials: "same-origin",
          signal: ac.signal,
        })

        const body = await res.json().catch(() => ({}))

        if (!mounted) return

        if (!res.ok) {
          setFetchError(body?.message || "Failed to load staff")
          setStaffs([])
        } else {
          setStaffs(Array.isArray(body?.staff) ? body.staff : [])
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setFetchError(err?.message || "Failed to fetch staff")
        }
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

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  // filtered staff
  const filteredStaffs = useMemo(() => {
    const q = debouncedQuery.toLowerCase()

    return staffs.filter((s) => {
      if (!s) return false

      // normalize staffType (ensure array)
      const types = Array.isArray(s.staffType) ? s.staffType.map((t) => t.toLowerCase()) : []

      // status filter
      const isActive = s.isActive !== false
      if (statusFilter === "active" && !isActive) return false
      if (statusFilter === "inactive" && isActive) return false

      // type filter
      if (typeFilter !== "all" && !types.includes(typeFilter)) return false

      if (!q) return true

      return (
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.empId?.toLowerCase().includes(q)
      )
    })
  }, [staffs, debouncedQuery, typeFilter, statusFilter])

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Staff Directory</h2>
            <p className="text-sm text-muted-foreground">
              Manage teaching and non-teaching staff.
            </p>
          </div>

          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Staff</DialogTitle>
                <DialogDescription>
                  Credentials will be emailed automatically.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <Input placeholder="Employee ID" value={empId} onChange={(e) => setEmpId(e.target.value)} />
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input placeholder="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />

                <Select value={staffType} onValueChange={(v) => setStaffType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teaching">Teaching</SelectItem>
                    <SelectItem value="non-teaching">Non-teaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  disabled={creating}
                  onClick={async () => {
                    setCreating(true)
                    setCreateError(null)

                    if (!session?.user) {
                      setCreateError("Not authorized")
                      setCreating(false)
                      return
                    }

                    const [firstName, ...rest] = fullName.trim().split(/\s+/)

                    const payload = {
                      empid: empId,
                      firstName,
                      lastName: rest.join(" "),
                      email,
                      phone,
                      designation,
                      staffType: [staffType], // ✅ CRITICAL FIX
                      department: session.user.department,
                    }

                    try {
                      const res = await fetch("/api/staff", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      })

                      if (!res.ok) throw new Error("Failed to create staff")

                      setCreateSuccess("Staff created")
                      setRefreshFlag((f) => f + 1)
                      setIsAdding(false)
                    } catch (e: any) {
                      setCreateError(e.message)
                    } finally {
                      setCreating(false)
                    }
                  }}
                >
                  {creating ? "Creating..." : "Create Staff"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search staff..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Staff List */}
        <div className="grid gap-4 md:grid-cols-2">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" /> Loading...
            </div>
          ) : fetchError ? (
            <div className="text-red-600">{fetchError}</div>
          ) : filteredStaffs.length === 0 ? (
            <div>No staff found.</div>
          ) : (
            filteredStaffs.map((staff) => (
              <StaffCard key={staff._id ?? staff.empId ?? staff.email} staff={staff} />
            ))
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
