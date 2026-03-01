import { NextRequest, NextResponse } from 'next/server'
import { checkApi, checkAllApis, getStoredHealthResults } from '@/lib/api-checker'

export const runtime = 'nodejs'

// Get tools status for OpenClaw agents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'keyless'
    const apiId = searchParams.get('apiId')

    // Get stored results first (faster)
    const storedResults = await getStoredHealthResults()
    
    if (apiId) {
      // Check specific API
      const result = await checkApi(apiId)
      return NextResponse.json({
        success: true,
        result,
        timestamp: new Date().toISOString()
      })
    }

    if (mode === 'live') {
      // Live check all APIs
      const results = await checkAllApis(mode as any)
      return NextResponse.json({
        success: true,
        results,
        mode: 'live',
        timestamp: new Date().toISOString()
      })
    }

    // Return stored results
    const resultsArray = Array.isArray(storedResults) ? storedResults : []
    
    return NextResponse.json({
      success: true,
      results: resultsArray,
      mode: 'cached',
      count: resultsArray.length,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Trigger new health check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode = 'keyless', apiId } = body

    if (apiId) {
      // Check specific API
      const result = await checkApi(apiId)
      return NextResponse.json({
        success: true,
        result,
        action: 'single_check',
        timestamp: new Date().toISOString()
      })
    }

    // Check all APIs
    const results = await checkAllApis(mode)
    const resultsArray = Array.isArray(results) ? results : []
    
    return NextResponse.json({
      success: true,
      results: resultsArray,
      mode,
      count: resultsArray.length,
      action: 'full_check',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
