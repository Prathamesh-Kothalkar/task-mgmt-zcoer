'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('ref')?.toString();

  const [loading, setLoading] = useState(false)
  const [valid, setValid] = useState<boolean | null>(null)
  const [staffInfo, setStaffInfo] = useState<{ empid?: string; name?: string } | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setValid(false)
      setError('Missing reset token.')
      return
    }

    console.log(token)

    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/staff/reset-password?ref=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (!mounted) return
        if (res.ok && data.valid) {
          setValid(true)
          setStaffInfo({ empid: data.empid, name: data.name })
        } else {
          setValid(false)
          setError(data?.message || 'Invalid or expired token')
        }
      } catch (err) {
        setValid(false)
        setError('Failed to validate token')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!token) return setError('Missing reset token')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (password !== confirmPassword) return setError('Passwords do not match')

    try {
      setLoading(true)
      const res = await fetch('/api/staff/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      console.log('Reset response', res)
      const data = await res.json()
      if (res.ok) {
        setSuccess(data?.message || 'Password reset successful')
        setTimeout(() => router.push(`${process.env.STAFF_URL}/login`), 1800)
      } else {
        setError(data?.message || 'Failed to reset password')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto', padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Reset Password</h2>

      {loading && <p>Loading…</p>}

      {valid === false && (
        <div style={{ color: 'crimson' }}>
          <p>{error || 'Invalid or expired reset token.'}</p>
        </div>
      )}

      {valid && staffInfo && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 8 }}>
            <strong>Account:</strong> {staffInfo.name} ({staffInfo.empid})
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}

          <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
            {loading ? 'Working…' : 'Reset Password'}
          </button>
        </form>
      )}

      {valid === null && !loading && <p>Preparing…</p>}
    </div>
  )
}