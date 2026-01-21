"use client"

import { useState, useEffect, useRef } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Calendar, MoreHorizontal} from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Sheet, SheetContent} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Suspense } from "react"
import { useSession } from "next-auth/react"
import { AssignTaskForm } from "@/components/assign-task-form"

// client-side tasks state will be populated from the backend

function TasksContent() {
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const { data: session, status } = useSession()

  useEffect(() => {
    let mounted = true
    // initial load handled by fetchPage(1)
    // no-op here; fetchPage will be triggered by effect below

    return () => {
      mounted = false
    }
  }, [])

  // Pagination state
  const limit = 10
  const pageRef = useRef(1)
  const hasMoreRef = useRef(true)
  const abortRef = useRef<AbortController | null>(null)

  async function fetchPage(page: number) {
    if (!hasMoreRef.current && page > 1) return
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    if (page === 1) {
      setLoading(true)
      setError(null)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (query) params.set('search', query)
      if (selectedStatuses.length > 0) params.set('statuses', selectedStatuses.join(','))
      if (selectedPriorities.length > 0) params.set('priorities', selectedPriorities.join(','))

      const res = await fetch(`/api/task?${params.toString()}`, { signal: controller.signal })
      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized. Please sign in.')
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'Failed to load tasks')
      }

      const body = await res.json()
      const received: any[] = body.tasks || []

      if (page === 1) {
        setTasks(received)
      } else {
        setTasks((prev) => {
          // avoid duplicates
          const ids = new Set(prev.map((t) => String(t._id)))
          const toAdd = received.filter((t) => !ids.has(String(t._id)))
          return [...prev, ...toAdd]
        })
      }

      hasMoreRef.current = !!body.hasMore
      pageRef.current = page
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Failed to load tasks', err)
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // initial fetch and when filters change
  useEffect(() => {
    // reset pagination
    pageRef.current = 1
    hasMoreRef.current = true
    fetchPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedStatuses.join(','), selectedPriorities.join(',')])

  // Infinite scroll observer
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = document.getElementById('load-more-sentinel')
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !loadingMore && hasMoreRef.current) {
          fetchPage(pageRef.current + 1)
        }
      }
    })
    obs.observe(el)
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore])

  // server-side filtered tasks; `tasks` is the accumulated list from pages

  function statusBadgeClass(status: string) {
    switch (status) {
      case 'COMPLETED':
        return 'border-emerald-500 text-emerald-700 bg-emerald-50'
      case 'IN_PROGRESS':
        return 'border-sky-500 text-sky-700 bg-sky-50'
      case 'OVERDUE':
        return 'border-rose-500 text-rose-700 bg-rose-50'
      case 'REJECTED':
        return 'border-zinc-500 text-zinc-700 bg-zinc-50'
      case 'PENDING':
      default:
        return 'border-amber-500 text-amber-700 bg-amber-50'
    }
  }

  function priorityBadgeClass(priority: string) {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-600 text-white'
      case 'HIGH':
        return 'bg-amber-500 text-white'
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700'
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-700'
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Task Management</h2>
            <p className="text-sm text-muted-foreground">Assign and track departmental academic tasks.</p>
          </div>
          <AssignTaskForm />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-10 h-11 bg-card border-none shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11 bg-card border-none shadow-sm">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-64 p-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-muted-foreground mb-2">Status</div>
                  <div className="flex flex-wrap gap-2">
                    {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'REJECTED'].map((s) => {
                      const active = selectedStatuses.includes(s)
                      return (
                        <button
                          key={s}
                          onClick={() =>
                            setSelectedStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
                          }
                          className={cn(
                            'px-3 py-1 rounded-md text-xs font-medium border',
                            active ? 'bg-primary text-white border-primary' : 'bg-muted/20 text-muted-foreground border-transparent',
                          )}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-muted-foreground mb-2">Priority</div>
                  <div className="flex flex-wrap gap-2">
                    {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => {
                      const active = selectedPriorities.includes(p)
                      return (
                        <button
                          key={p}
                          onClick={() =>
                            setSelectedPriorities((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
                          }
                          className={cn(
                            'px-3 py-1 rounded-md text-xs font-medium border',
                            active ? 'bg-primary text-white border-primary' : 'bg-muted/20 text-muted-foreground border-transparent',
                          )}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      setSelectedStatuses([])
                      setSelectedPriorities([])
                    }}
                    className="text-sm text-muted-foreground"
                  >
                    Clear
                  </button>
                  <div className="text-sm text-muted-foreground">{tasks.length} results</div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-4">
            {loading && tasks.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Loading tasks...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : tasks.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No tasks found.</div>
          ) : (
            tasks.map((task) => {
              const priority = task.priority || 'MEDIUM'
              const status = task.status || 'PENDING'
              const assignedToName = task.assignedTo?.name || task.assignedTo || 'Unassigned'
              const assignedToEmp = task.assignedTo?.empid || ''
              const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'

              return (
                <Card
                  key={task._id}
                  className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelectedTask(task)}
                >
                  <CardContent className="p-0 flex h-full">
                    <div
                      className={cn(
                        'w-2',
                        priority === 'URGENT' ? 'bg-rose-500' : priority === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500',
                      )}
                    />
                    <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-black uppercase tracking-tighter px-1.5 py-0',
                              statusBadgeClass(status),
                            )}
                          >
                            {status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn('text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0', priorityBadgeClass(priority))}
                          >
                            {priority}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-base group-hover:text-primary transition-colors">{task.title}</h3>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-1">
                          <div className="flex items-center text-xs text-muted-foreground font-medium">
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarFallback className="text-[8px] bg-primary text-primary-foreground">
                                {assignedToName
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            {assignedToName} {assignedToEmp ? `(${assignedToEmp})` : ''}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground font-medium">
                            <Calendar className="h-3 w-3 mr-1.5 text-primary" />
                            Due {due}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* sentinel for infinite scroll */}
        <div className="flex justify-center py-4">
          {loadingMore ? (
            <div className="text-sm text-muted-foreground">Loading more...</div>
          ) : (
            <div id="load-more-sentinel" />
          )}
        </div>

        {/* Task Detail Drawer - simplified to show only core task info */}
        <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col border-none shadow-2xl">
            {selectedTask && (
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
                    <p className="text-sm text-muted-foreground mt-2">{selectedTask.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={cn('text-[10px] font-black uppercase px-2 py-1', statusBadgeClass(selectedTask.status))}>{selectedTask.status}</Badge>
                    <Badge className={cn('text-[10px] font-bold uppercase px-2 py-1', priorityBadgeClass(selectedTask.priority))}>{selectedTask.priority}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground font-bold">Assigned To</div>
                    <div className="mt-1 font-medium">
                      {selectedTask.assignedTo?.name || selectedTask.assignedTo || '—'} {selectedTask.assignedTo?.empid ? `(${selectedTask.assignedTo.empid})` : ''}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground font-bold">Due Date</div>
                    <div className="mt-1 font-medium">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleString() : '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground font-bold">Assigned By</div>
                    <div className="mt-1 font-medium">{selectedTask.assignedBy?.name || selectedTask.assignedBy || '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground font-bold">Created</div>
                    <div className="mt-1 font-medium">{selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleString() : '—'}</div>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksContent />
    </Suspense>
  )
}
