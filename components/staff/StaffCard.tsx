"use client"

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Award as IdCard, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StaffItem } from './types'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

type FormValues = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  staffType: string
}

export default function StaffCard({ staff }: { staff: StaffItem }) {
  const status = staff.isActive ? 'Active' : 'Inactive'
  const typeLabel = staff.staffType && staff.staffType.length > 0 ? (staff.staffType[0].toLowerCase() === 'non-teaching' || staff.staffType[0] === 'NON-TEACHING' ? 'Non-teaching' : 'Teaching') : '—'
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [details, setDetails] = React.useState<any>(null)
  const toast = useToast()

  const form = useForm<FormValues>({
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', staffType: 'TEACHING' },
  })

  React.useEffect(() => {
    if (!open) return
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const id = staff.empId ?? ''
        const res = await fetch(`/api/staff/${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        if (!mounted) return
        setDetails(data)
        // populate form
        const name = data.staff.name || ''
        const parts = name.split(' ')
        form.reset({
          firstName: parts.slice(0, -1).join(' ') || parts[0] || '',
          lastName: parts.length > 1 ? parts.slice(-1).join(' ') : '',
          email: data.staff.email || '',
          phone: data.staff.phone || '',
          staffType: data.staff.staffType && data.staff.staffType.length > 0 ? data.staff.staffType[0] : 'TEACHING',
        })
      } catch (err) {
        console.error(err)
        toast.toast({ title: 'Failed to load staff details' })
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [open])

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empid: staff.empId,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          staffType: [values.staffType],
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.message || 'Update failed')
      }
      toast.toast({ title: 'Staff updated' })
      setOpen(false)
    } catch (err: any) {
      console.error(err)
      toast.toast({ title: err?.message || 'Update failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
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

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 sm:static h-8 w-8 text-muted-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Staff: {staff.name}</DialogTitle>
                  <DialogDescription>View task stats & update staff info</DialogDescription>
                </DialogHeader>

                <div className="mt-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{details?.staff?.email || staff.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employee ID</p>
                      <p className="font-medium">{staff.empId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{details?.staff?.phone || staff.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-medium">{details?.staff?.staffType?.[0] || staff.staffType?.[0] || '—'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold">Task Summary</h4>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <div className="p-2 bg-muted rounded">Total: {details?.stats?.total ?? '—'}</div>
                      {(
                        details?.stats?.byStatus
                          ? Object.entries(details.stats.byStatus)
                          : []
                      ).map(([k, v]: any) => (
                        <div key={k} className="p-2 bg-muted rounded">{k}: {v}</div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>First name</Label>
                        <Input {...form.register('firstName')} />
                      </div>
                      <div>
                        <Label>Last name</Label>
                        <Input {...form.register('lastName')} />
                      </div>
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input {...form.register('email')} />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input {...form.register('phone')} />
                    </div>

                    <div>
                      <Label>Staff Type</Label>
                      <select className="w-full rounded-md border px-2 py-1" {...form.register('staffType')}>
                        <option value="TEACHING">TEACHING</option>
                        <option value="NON-TEACHING">NON-TEACHING</option>
                      </select>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
