"use client"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, Mail, Building, Phone, ShieldCheck, LogOut, Settings, Edit2 } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useMemo } from "react"

export default function ProfilePage() {
  const { data: session } = useSession()

  const user = session?.user

  const initials = useMemo(() => {
    if (!user?.name) return "HK"
    return user.name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [user])

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
        <div className="relative">
          {/* Banner */}
          <div className="h-24 sm:h-32 w-full bg-primary rounded-2xl sm:rounded-3xl shadow-inner opacity-90 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          </div>

          {/* Profile Header */}
          <div className="px-4 sm:px-6 -mt-8 sm:-mt-12 flex flex-col items-center sm:flex-row sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-[4px] sm:border-[8px] border-background shadow-xl">
              <AvatarImage src={(user as any)?.image || "/placeholder-user.jpg"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-4xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-1 sm:pb-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name ?? 'Dr. Hemant Kulkarni'}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 w-4" />
                {user?.role ? `${user.role}` : 'Head of Department (HOD)'}
              </div>
            </div>
            <Button className="w-full sm:w-auto font-bold shadow-md rounded-xl mb-2 py-5 sm:py-2">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="md:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/10 py-4 px-4 sm:px-6">
              <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-primary/80">
                Departmental Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-1.5 group">
                  <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest group-hover:text-primary/60 transition-colors">
                    Department
                  </p>
                  <p className="font-bold text-sm sm:text-base flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center mr-3">
                      <Building className="h-4 w-4 text-primary" />
                    </div>
                    {user?.deptName?? 'Computer Engineering'}
                  </p>
                </div>
                <div className="space-y-1.5 group">
                  <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest group-hover:text-primary/60 transition-colors">
                    Employee ID
                  </p>
                  <p className="font-bold text-sm sm:text-base flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    {user?.empid ?? 'ZES-HOD-CS-01'}
                  </p>
                </div>
                <div className="space-y-1.5 group">
                  <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest group-hover:text-primary/60 transition-colors">
                    Official Email
                  </p>
                  <p className="font-bold text-sm sm:text-base flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center mr-3">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    {user?.email ?? 'hod.computer@zealedu.in'}
                  </p>
                </div>
                {/* <div className="space-y-1.5 group">
                  <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest group-hover:text-primary/60 transition-colors">
                    Contact Number
                  </p>
                  <p className="font-bold text-sm sm:text-base flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center mr-3">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                  
                  </p>
                </div> */}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/10">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Account Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-bold text-destructive hover:bg-destructive/5 rounded-xl"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center space-y-2">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Zeal CTMS</p>
              <p className="text-xs text-muted-foreground font-medium">Version 2.4.0 (Stable)</p>
              <p className="text-[9px] text-muted-foreground font-bold">© 2026 Zeal Education Society</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
