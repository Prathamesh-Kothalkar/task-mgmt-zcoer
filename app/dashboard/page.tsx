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
  const stats = [
    { label: "Total Staff", value: "24", icon: Users, color: "bg-blue-500", trend: "+2 this month", trendUp: true },
    { label: "Total Tasks", value: "156", icon: CheckSquare, color: "bg-indigo-500", trend: "+12 week", trendUp: true },
    { label: "Completed", value: "89", icon: CheckCircle2, color: "bg-emerald-500", trend: "57% rate", trendUp: true },
    {
      label: "In Progress",
      value: "42",
      icon: TrendingUp,
      color: "bg-amber-500",
      trend: "High priority",
      trendUp: false,
    },
    { label: "Pending", value: "18", icon: Clock, color: "bg-slate-500", trend: "Needs review", trendUp: false },
    {
      label: "Overdue",
      value: "7",
      icon: AlertCircle,
      color: "bg-rose-500",
      trend: "-3 from last month",
      trendUp: true,
    },
  ]

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome, Dr. Hemant</h2>
          <p className="text-muted-foreground">Here's what's happening in Computer Engineering today.</p>
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

        {/* Visual Insights Placeholders */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-base font-bold text-primary">Task Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center p-6">
              <div className="w-full h-full flex items-end justify-around gap-2 pb-2">
                {[45, 75, 55, 90, 40, 65, 80].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                      className="w-full bg-primary/20 rounded-t-lg transition-all duration-1000 group-hover:bg-primary/40 relative"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white px-1.5 py-0.5 rounded">
                        {h}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                      Staff {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-base font-bold text-primary">Department Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center h-64 space-y-6">
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
                    strokeDashoffset={440 - (440 * 78) / 100}
                    className="text-primary transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-primary">78%</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Efficiency
                  </span>
                </div>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-muted"></span>
                  <span>Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
