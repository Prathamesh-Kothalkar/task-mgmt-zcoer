"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Clock, Calendar, MoreHorizontal, FileText, Paperclip, Send } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Suspense } from "react"
import { AssignTaskForm } from "@/components/assign-task-form"

const tasksData = [
  {
    id: 1,
    title: "NAAC Criteria 4 Documentation",
    assignedTo: "Prof. Rajesh Patil",
    dueDate: "2024-06-15",
    priority: "High",
    status: "In Progress",
  },
  {
    id: 2,
    title: "Final Year Project Reviews",
    assignedTo: "Dr. Sunita Deshmukh",
    dueDate: "2024-06-10",
    priority: "Urgent",
    status: "Pending",
  },
  {
    id: 3,
    title: "Laboratoy Maintenance Report",
    assignedTo: "Mr. Amit Kulkarni",
    dueDate: "2024-06-08",
    priority: "Medium",
    status: "Overdue",
  },
  {
    id: 4,
    title: "Semester Exam Paper Setting",
    assignedTo: "Prof. Vinod More",
    dueDate: "2024-06-20",
    priority: "High",
    status: "Completed",
  },
]

function TasksContent() {
  const [selectedTask, setSelectedTask] = useState<(typeof tasksData)[0] | null>(null)

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
            <Input placeholder="Search tasks..." className="pl-10 h-11 bg-card border-none shadow-sm" />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 bg-card border-none shadow-sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4">
          {tasksData.map((task) => (
            <Card
              key={task.id}
              className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setSelectedTask(task)}
            >
              <CardContent className="p-0 flex h-full">
                <div
                  className={cn(
                    "w-2",
                    task.priority === "Urgent"
                      ? "bg-rose-500"
                      : task.priority === "High"
                        ? "bg-amber-500"
                        : "bg-blue-500",
                  )}
                />
                <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-black uppercase tracking-tighter px-1.5 py-0",
                          task.status === "Completed" && "border-emerald-500 text-emerald-600 bg-emerald-50",
                          task.status === "Overdue" && "border-rose-500 text-rose-600 bg-rose-50",
                          task.status === "In Progress" && "border-blue-500 text-blue-600 bg-blue-50",
                        )}
                      >
                        {task.status}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-tighter bg-muted">
                        {task.priority}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-base group-hover:text-primary transition-colors">{task.title}</h3>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-1">
                      <div className="flex items-center text-xs text-muted-foreground font-medium">
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarFallback className="text-[8px] bg-primary text-primary-foreground">
                            {task.assignedTo
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {task.assignedTo}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground font-medium">
                        <Calendar className="h-3 w-3 mr-1.5 text-primary" />
                        Due {task.dueDate}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Task Detail Drawer */}
        <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col border-none shadow-2xl">
            {selectedTask && (
              <>
                <SheetHeader className="p-6 bg-primary text-primary-foreground">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-white/20 text-white border-white/30 text-[10px] uppercase font-black">
                      {selectedTask.status}
                    </Badge>
                    <Badge className="bg-rose-400 text-white border-none text-[10px] uppercase font-black">
                      {selectedTask.priority} Priority
                    </Badge>
                  </div>
                  <SheetTitle className="text-xl font-bold text-white">{selectedTask.title}</SheetTitle>
                  <SheetDescription className="text-white/80 flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-white/20">
                      <AvatarFallback className="bg-white text-primary text-[10px] font-bold">RP</AvatarFallback>
                    </Avatar>
                    Assigned to {selectedTask.assignedTo}
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center">
                      <FileText className="h-3 w-3 mr-1.5" /> Description
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Complete all necessary documentation for Criteria 4.3 and 4.4 including IT infrastructure logs,
                      bandwidth usage reports, and laboratory maintenance schedules for the academic year 2023-24.
                    </p>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center">
                      <Clock className="h-3 w-3 mr-1.5" /> Discussion
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            HK
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted/50 rounded-2xl rounded-tl-none p-3 max-w-[85%]">
                          <div className="flex items-center justify-between mb-1 gap-4">
                            <span className="text-[10px] font-black uppercase">Dr. Hemant (HOD)</span>
                            <span className="text-[9px] text-muted-foreground font-bold">2h ago</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-normal">
                            Please ensure the laboratory logbooks are scanned and uploaded as well.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-row-reverse">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-bold">
                            RP
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl rounded-tr-none p-3 max-w-[85%]">
                          <div className="flex items-center justify-between mb-1 gap-4">
                            <span className="text-[10px] font-black uppercase text-primary">Prof. Rajesh Patil</span>
                            <span className="text-[9px] text-muted-foreground font-bold">1h ago</span>
                          </div>
                          <p className="text-xs text-foreground leading-normal font-medium">
                            Yes sir, I've started scanning them. Will finish by tomorrow EOD.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center">
                      <Paperclip className="h-3 w-3 mr-1.5" /> Attachments (2)
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center p-2.5 rounded-xl border bg-card hover:border-primary/30 transition-colors group">
                        <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary mr-3">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold truncate">Lab_Infra_Report.pdf</p>
                          <p className="text-[9px] text-muted-foreground font-bold">
                            PDF • 2.4 MB • Uploaded by Prof. Patil
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <SheetFooter className="p-4 bg-muted/20 border-t sm:flex-col sm:space-x-0 gap-3">
                  <div className="relative w-full">
                    <Textarea
                      placeholder="Type a message..."
                      className="min-h-[80px] bg-background border-none shadow-inner resize-none pr-12 focus-visible:ring-primary rounded-xl"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button size="icon" className="h-8 w-8 rounded-lg shadow-md">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </SheetFooter>
              </>
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
