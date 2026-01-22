"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'
import { StaffItem } from './types'

export default function CreateStaffForm({ onCreated }: { onCreated?: () => void }) {
  const { data: session } = useSession()

  const [isAdding, setIsAdding] = useState(false)
  const [fullName, setFullName] = useState('')
  const [empId, setEmpId] = useState('')
  const [email, setEmail] = useState('')
  const [staffType, setStaffType] = useState('teaching')
  const [designation, setDesignation] = useState('')
  const [phone, setPhone] = useState('')

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)

  async function handleCreate() {
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
        // callback
        onCreated && onCreated()
        // close dialog after brief delay
        setTimeout(() => setIsAdding(false), 800)
      }
    } catch (err: any) {
      console.error('Create staff failed', err)
      setCreateError(err?.message || 'Failed to create staff')
    } finally {
      setCreating(false)
    }
  }

  return (
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
              onClick={handleCreate}
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
  )
}
