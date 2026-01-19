import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, CheckCircle2, AlertCircle, Clock, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const notifications = [
  {
    id: 1,
    type: "status",
    title: "Task Completed",
    message: "Prof. Rajesh Patil has completed 'Semester Exam Paper Setting'",
    time: "10 mins ago",
    read: false,
    icon: CheckCircle2,
    color: "text-emerald-500",
  },
  {
    id: 2,
    type: "overdue",
    title: "Overdue Alert",
    message: "'Laboratory Maintenance Report' is now 2 days overdue.",
    time: "2 hours ago",
    read: false,
    icon: AlertCircle,
    color: "text-rose-500",
  },
  {
    id: 3,
    type: "assigned",
    title: "Task Assigned",
    message: "You assigned 'NAAC Criteria 4 Documentation' to Prof. Rajesh Patil",
    time: "5 hours ago",
    read: true,
    icon: Clock,
    color: "text-blue-500",
  },
  {
    id: 4,
    type: "update",
    title: "System Update",
    message: "New features added to the staff management module.",
    time: "Yesterday",
    read: true,
    icon: Info,
    color: "text-slate-500",
  },
]

export default function NotificationsPage() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">Stay updated on task status and department alerts.</p>
        </div>

        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={cn(
                "border-none shadow-sm hover:shadow-md transition-all",
                !notif.read && "bg-primary/[0.02] ring-1 ring-primary/10",
              )}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div
                  className={cn(
                    "h-10 w-10 rounded-2xl shrink-0 flex items-center justify-center bg-white shadow-sm",
                    notif.color,
                  )}
                >
                  <notif.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={cn("text-sm font-bold", !notif.read ? "text-primary" : "text-foreground")}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{notif.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                </div>
                {!notif.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
              </CardContent>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center">
              <Bell className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-lg font-bold text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground/70">We'll notify you when something important happens.</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
