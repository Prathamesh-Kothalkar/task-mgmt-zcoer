"use client"
import { LoginForm } from "@/components/login-form"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { data: session } = useSession()

  if (session) {

    const router=useRouter()
    router.push('/dashboard')
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          You are already logged in as {session.user?.empid}  
        </h1>
        <p className="text-center">Please log out to access the login page.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <LoginForm />
    </main>
  )
}
