'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function SettingsPage() {
  const [gatewayToken, setGatewayToken] = useState('')
  const [gatewayUrl, setGatewayUrl] = useState('ws://localhost:18789')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  useEffect(() => {
    // Load current settings from environment
    setGatewayToken(process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_TOKEN || '')
    setGatewayUrl(process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL || 'ws://localhost:18789')
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gatewayToken,
          gatewayUrl,
        }),
      })

      if (response.ok) {
        setMessage('Gateway settings saved successfully!')
        setMessageType('success')
        
        // Update OpenClaw config
        await updateOpenClawConfig(gatewayToken, gatewayUrl)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      setMessage(`Error saving settings: ${error}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const updateOpenClawConfig = async (token: string, url: string) => {
    try {
      // This would need to be implemented server-side
      // For now, just show success message
      console.log('Updating OpenClaw config with:', { token, url })
    } catch (error) {
      console.error('Failed to update OpenClaw config:', error)
    }
  }

  const testConnection = async () => {
    setIsLoading(true)
    setMessage('Testing connection...')

    try {
      const response = await fetch('/api/test-gateway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gatewayUrl,
          gatewayToken,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage('Connection test successful!')
        setMessageType('success')
      } else {
        setMessage(`Connection test failed: ${result.error}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage(`Connection test failed: ${error}`)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Badge variant="outline">OpenClaw Gateway</Badge>
        </div>

        {message && (
          <Alert className={messageType === 'error' ? 'border-red-500' : messageType === 'success' ? 'border-green-500' : 'border-blue-500'}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>OpenClaw Gateway Configuration</CardTitle>
            <CardDescription>
              Configure your OpenClaw Gateway connection settings. The Gateway token is used for authentication with your local OpenClaw instance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gateway-url">Gateway URL</Label>
              <Input
                id="gateway-url"
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="ws://localhost:18789"
              />
              <p className="text-sm text-muted-foreground">
                WebSocket URL for your OpenClaw Gateway instance
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gateway-token">Gateway Token</Label>
              <Input
                id="gateway-token"
                type="password"
                value={gatewayToken}
                onChange={(e) => setGatewayToken(e.target.value)}
                placeholder="oc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-sm text-muted-foreground">
                Authentication token for OpenClaw Gateway. Generate with: <code>npx openclaw config set gateway.auth.token "your-token"</code>
              </p>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button 
                variant="outline" 
                onClick={testConnection}
                disabled={isLoading}
              >
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Get Gateway Token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Method 1: Generate New Token</h4>
              <div className="space-y-2">
                <p>Run this command in your terminal:</p>
                <code className="block bg-background p-2 rounded text-sm">
                  npx openclaw config set gateway.auth.token "oc-$(node -e 'console.log(require('crypto').randomBytes(24).toString('hex'))')"
                </code>
                <p className="text-sm text-muted-foreground">
                  This generates a new random token and sets it in your OpenClaw configuration.
                </p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Method 2: Use Existing Token</h4>
              <div className="space-y-2">
                <p>Check your current token:</p>
                <code className="block bg-background p-2 rounded text-sm">
                  npx openclaw config get gateway.auth.token
                </code>
                <p className="text-sm text-muted-foreground">
                  Copy the token and paste it above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
