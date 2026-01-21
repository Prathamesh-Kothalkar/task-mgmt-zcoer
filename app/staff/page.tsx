"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
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

const staffData = [
  {
    id: 1,
    name: "Prof. Rajesh Patil",
    email: "rajesh.patil@zealedu.in",
    empId: "ZES-CS-101",
    type: "Teaching",
    status: "Active",
    designation: "Asst. Professor",
  },
  {
    id: 2,
    name: "Dr. Sunita Deshmukh",
    email: "sunita.d@zealedu.in",
    empId: "ZES-CS-102",
    type: "Teaching",
    status: "Active",
    designation: "Associate Professor",
  },
  {
    id: 3,
    name: "Mr. Amit Kulkarni",
    email: "amit.k@zealedu.in",
    empId: "ZES-CS-NT-01",
    type: "Non-teaching",
    status: "Active",
    designation: "Lab Assistant",
  },
  {
    id: 4,
    name: "Ms. Priyanka Shinde",
    email: "priyanka.s@zealedu.in",
    empId: "ZES-CS-103",
    type: "Teaching",
    status: "Inactive",
    designation: "Lecturer",
  },
  {
    id: 5,
    name: "Prof. Vinod More",
    email: "vinod.m@zealedu.in",
    empId: "ZES-CS-104",
    type: "Teaching",
    status: "Active",
    designation: "Asst. Professor",
  },
]

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
            />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 bg-card border-none shadow-sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {staffData.map((staff) => (
            <Card key={staff.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <CardContent className="p-0 flex h-full">
                <div className={cn("w-1.5 h-full", staff.status === "Active" ? "bg-emerald-500" : "bg-muted")} />
                <div className="p-5 flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-16 w-16 border-4 border-muted group-hover:border-primary/20 transition-colors">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {staff.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg leading-none">{staff.name}</h3>
                      <Badge
                        variant={staff.status === "Active" ? "default" : "secondary"}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5",
                          staff.status === "Active" && "bg-emerald-500 hover:bg-emerald-600",
                        )}
                      >
                        {staff.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-primary/80 uppercase tracking-wide">
                      {staff.designation} • {staff.type}
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
          ))}
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
