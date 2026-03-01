import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { gatewayUrl, gatewayToken } = await request.json()
    
    if (!gatewayUrl || !gatewayToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gateway URL and token are required' 
      }, { status: 400 })
    }
    
    // Test connection by trying to connect to Gateway
    const WebSocket = require('ws')
    
    return new Promise<NextResponse>((resolve) => {
      const ws = new WebSocket(gatewayUrl, {
        headers: {
          'Authorization': gatewayToken,
          'X-Device-Token': gatewayToken
        },
        handshakeTimeout: 5000
      })
      
      let connected = false
      let receivedChallenge = false
      
      ws.on('open', () => {
        connected = true
        console.log('Gateway connection test: Connected')
      })
      
      ws.on('message', (data: any) => {
        try {
          const message = JSON.parse(data.toString())
          if (message.type === 'event' && message.event === 'connect.challenge') {
            receivedChallenge = true
            console.log('Gateway connection test: Received challenge')
          }
        } catch (err) {
          // Ignore JSON parse errors
        }
      })
      
      ws.on('error', (error: any) => {
        console.log('Gateway connection test: Error', error)
        resolve(NextResponse.json({ 
          success: false, 
          error: `Connection failed: ${error.message || 'Unknown error'}` 
        }))
      })
      
      ws.on('close', (code: number, reason: Buffer) => {
        console.log(`Gateway connection test: Closed with code ${code}`)
        
        if (connected) {
          if (receivedChallenge) {
            resolve(NextResponse.json({ 
              success: true, 
              message: 'Gateway is reachable and responding correctly' 
            }))
          } else {
            resolve(NextResponse.json({ 
              success: true, 
              message: 'Gateway is reachable (no challenge received - may be already authenticated)' 
            }))
          }
        } else {
          resolve(NextResponse.json({ 
            success: false, 
            error: `Connection failed with code ${code}: ${reason.toString()}` 
          }))
        }
      })
      
      // Timeout
      setTimeout(() => {
        if (!connected) {
          ws.close()
          resolve(NextResponse.json({ 
            success: false, 
            error: 'Connection timeout' 
          }))
        }
      }, 5000)
    })
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
