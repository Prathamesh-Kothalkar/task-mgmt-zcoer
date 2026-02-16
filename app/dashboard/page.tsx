"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) throw new Error('Failed to load')
        const json = await res.json()
        if (mounted) setData(json)
        
        // const result = await fetch('/api/task/mark-overdue', { method: 'POST' })
        // if (!result.ok) console.error('Failed to mark overdue tasks')
        // else console.log('Overdue tasks updated')
        
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const stats = [
    { label: 'Total Staff', value: data ? String(data.staff.total) : '—', icon: Users, color: 'bg-blue-500', trend: '+2 this month', trendUp: true },
    { label: 'Total Tasks', value: data ? String(data.tasks.total) : '—', icon: CheckSquare, color: 'bg-indigo-500', trend: '+12 week', trendUp: true },
    { label: 'Completed', value: data ? String(data.tasks.completed) : '—', icon: CheckCircle2, color: 'bg-emerald-500', trend: 'Rate', trendUp: true },
    { label: 'In Progress', value: data ? String(data.tasks.inProgress) : '—', icon: TrendingUp, color: 'bg-amber-500', trend: 'High priority', trendUp: false },
    { label: 'Pending', value: data ? String(data.tasks.pending) : '—', icon: Clock, color: 'bg-slate-500', trend: 'Needs review', trendUp: false },
    { label: 'Overdue', value: data ? String(data.tasks.overdue) : '—', icon: AlertCircle, color: 'bg-rose-500', trend: '-3 from last month', trendUp: true },
  ]

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {session?.user.name}</h2>
          <p className="text-muted-foreground">Here's what's happening in {session?.user.deptName || 'your department'} today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-4 pt-6 flex flex-col items-center text-center space-y-3">
                <div
                  className={`${stat.color} p-2.5 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                </div>
                <div
                  className={`flex items-center text-[10px] font-bold ${stat.trendUp ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Staff Distribution & Department Performance */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-base font-bold text-primary">Staff Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center p-6">
              <div className="w-full h-full flex items-end justify-around gap-2 pb-2">
                {data && data.distribution && data.distribution.length > 0 ? (
                  (() => {
                    const max = Math.max(...data.distribution.map((d: any) => d.total), 1)
                    return data.distribution.map((d: any, i: number) => {
                      const pct = Math.round((d.total / max) * 100)
                      return (
                        <div key={d.staffId || i} className="flex-1 flex flex-col items-center gap-2 group">
                          <div
                            className="w-full bg-primary/20 rounded-t-lg transition-all duration-700 group-hover:bg-primary/40 relative"
                            style={{ height: `${pct}%` }}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white px-1.5 py-0.5 rounded">
                              {d.total}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter text-center">
                            {d.name ? d.name.split(' ')[0] : d.empId || `S${i + 1}`}
                          </span>
                        </div>
                      )
                    })
                  })()
                ) : (
                  <div className="text-sm text-muted-foreground">No distribution data available.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-base font-bold text-primary">Department Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-muted/30"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={
                      data && data.performance && typeof data.performance.efficiency === 'number'
                        ? 440 - (440 * data.performance.efficiency) / 100
                        : 440 - (440 * 0) / 100
                    }
                    className="text-primary transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-primary">{data && data.performance ? `${data.performance.efficiency}%` : '—'}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Efficiency</span>
                </div>
              </div>

              <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col gap-1 text-sm">
                  <div className="font-bold">Overdue Rate</div>
                  <div className="text-muted-foreground">{data && data.performance ? `${data.performance.overdueRate}%` : '—'}</div>
                </div>

                <div className="flex flex-col gap-1 text-sm">
                  <div className="font-bold">Top Performers</div>
                  <div className="text-muted-foreground">
                    {data && data.distribution && data.distribution.length > 0 ? (
                      <div className="flex flex-col text-[12px]">
                        {data.distribution.slice(0, 3).map((d: any, i: number) => (
                          <div key={d.staffId || i} className="flex items-center justify-between">
                            <span className="truncate pr-2">{d.name || d.empId || `Staff ${i + 1}`}</span>
                            <span className="font-mono text-xs">{d.completed ?? 0}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      'No performers yet'
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
