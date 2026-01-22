"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Award as IdCard, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StaffItem } from './types'

export default function StaffCard({ staff }: { staff: StaffItem }) {
  const status = staff.isActive ? 'Active' : 'Inactive'
  const typeLabel = staff.staffType && staff.staffType.length > 0 ? (staff.staffType[0].toLowerCase() === 'non-teaching' || staff.staffType[0] === 'NON-TEACHING' ? 'Non-teaching' : 'Teaching') : '—'

  return (
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
}
