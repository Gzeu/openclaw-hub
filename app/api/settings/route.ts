import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { gatewayToken, gatewayUrl } = await request.json()

    // Update .env file
    const envPath = join(process.cwd(), '.env')
    let envContent = readFileSync(envPath, 'utf-8')
    
    // Update or add OPENCLAW_GATEWAY_TOKEN
    const tokenRegex = /^OPENCLAW_GATEWAY_TOKEN=.*$/m
    if (tokenRegex.test(envContent)) {
      envContent = envContent.replace(tokenRegex, `OPENCLAW_GATEWAY_TOKEN=${gatewayToken}`)
    } else {
      envContent += `\nOPENCLAW_GATEWAY_TOKEN=${gatewayToken}`
    }
    
    // Update or add OPENCLAW_GATEWAY_URL
    const urlRegex = /^OPENCLAW_GATEWAY_URL=.*$/m
    if (urlRegex.test(envContent)) {
      envContent = envContent.replace(urlRegex, `OPENCLAW_GATEWAY_URL=${gatewayUrl}`)
    } else {
      envContent += `\nOPENCLAW_GATEWAY_URL=${gatewayUrl}`
    }
    
    writeFileSync(envPath, envContent)
    
    // Update OpenClaw config
    const { spawn } = require('child_process')
    
    return new Promise((resolve) => {
      const child = spawn('npx', ['openclaw', 'config', 'set', 'gateway.auth.token', gatewayToken], {
        cwd: 'C:\\Users\\el\\.openclaw',
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      child.on('close', (code: number) => {
        if (code === 0) {
          resolve(NextResponse.json({ 
            success: true, 
            message: 'Settings saved successfully' 
          }))
        } else {
          resolve(NextResponse.json({ 
            success: false, 
            error: 'Failed to update OpenClaw config' 
          }))
        }
      })
      
      child.on('error', () => {
        resolve(NextResponse.json({ 
          success: true, 
          message: 'Settings saved (OpenClaw config update failed - please run manually)' 
        }))
      })
    })
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
