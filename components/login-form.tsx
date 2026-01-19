"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [empId, setEmpId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await signIn('credentials', {
        redirect: false,
        empid: empId,
        password,
      })

      // signIn returns undefined in some environments; guard accordingly
      if (!res) {
        setError('Authentication failed. Please try again.')
        setIsLoading(false)
        return
      }

      if ((res as any).error) {
        setError((res as any).error || 'Invalid Employee ID or password')
        setIsLoading(false)
        return
      }

      // Success
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-500">
      <CardHeader className="flex flex-col items-center space-y-4 pt-8">
        <div className="relative w-32 h-32">
          <Image src="/images/images.png" alt="Zeal Education Society Logo" fill className="object-contain" priority />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-primary">HOD Portal</h1>
          <p className="text-sm text-muted-foreground">College Task Management System</p>
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2 animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="empId">Employee ID</Label>
            <Input
              id="empId"
              placeholder="e.g. ZES-12345"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              required
              className="bg-muted/30 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-muted/30 focus-visible:ring-primary"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-semibold h-11 text-base shadow-md hover:shadow-lg transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Login"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">Authorized Personnel Only</p>
        </form>
      </CardContent>
    </Card>
  )
}
