import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface PasswordProtectionProps {
  onAuthenticated: () => void
}

export default function PasswordProtection({ onAuthenticated }: PasswordProtectionProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        const { token } = await response.json()
        sessionStorage.setItem('authToken', token)
        onAuthenticated()
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Access Required
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Enter password to access Domino's Coupons Finder
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              autoFocus
              autoComplete="new-password"
            />
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <Button 
              type="submit" 
              disabled={loading || !password}
              className="w-full !bg-red-600 hover:!bg-red-700 !text-white"
            >
              {loading ? 'Authenticating...' : 'Access App'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}