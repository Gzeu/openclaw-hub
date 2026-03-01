import { NextRequest, NextResponse } from 'next/server'
import { checkAllApis, getStoredHealthResults } from '@/lib/api-checker'

export const runtime = 'nodejs'

// Get list of all available tools and their status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'cached'
    const category = searchParams.get('category')
    const status = searchParams.get('status') // 'ok', 'error', 'degraded'

    // Get stored results
    const storedResults = await getStoredHealthResults()
    
    // If no cached results, run fresh check
    let results = Array.isArray(storedResults) ? storedResults : []
    
    if (results.length === 0) {
      // Run fresh check if no cached data
      const freshResults = await checkAllApis({ keylessOnly: true })
      results = Array.isArray(freshResults) ? freshResults : []
    }

    // Filter results if requested
    let filteredResults = results
    
    if (category) {
      filteredResults = filteredResults.filter((result: any) => 
        result.category === category
      )
    }

    if (status) {
      filteredResults = filteredResults.filter((result: any) => 
        result.status === status
      )
    }

    // Group by category
    const groupedResults = filteredResults.reduce((acc: any, result: any) => {
      const category = result.category || 'unknown'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(result)
      return acc
    }, {})

    // Generate summary
    const summary = {
      total: results.length,
      ok: results.filter((r: any) => r.status === 'ok').length,
      error: results.filter((r: any) => r.status === 'error').length,
      degraded: results.filter((r: any) => r.status === 'degraded').length,
      unconfigured: results.filter((r: any) => r.status === 'unconfigured').length,
      categories: Object.keys(groupedResults),
      keyless: results.filter((r: any) => r.keyless).length,
      configured: results.filter((r: any) => r.keyConfigured).length
    }

    return NextResponse.json({
      success: true,
      mode,
      summary,
      results: filteredResults,
      grouped: groupedResults,
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

// Trigger fresh check of all tools
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode = 'keyless' } = body

    // Run fresh check
    const freshResults = await checkAllApis({ keylessOnly: true })
    const resultsArray = Array.isArray(freshResults.results) ? freshResults.results : []

    // Group by category
    const groupedResults = resultsArray.reduce((acc: any, result: any) => {
      const category = result.category || 'unknown'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(result)
      return acc
    }, {})

    // Generate summary
    const summary = {
      total: resultsArray.length,
      ok: resultsArray.filter((r: any) => r.status === 'ok').length,
      error: resultsArray.filter((r: any) => r.status === 'error').length,
      degraded: resultsArray.filter((r: any) => r.status === 'degraded').length,
      unconfigured: resultsArray.filter((r: any) => r.status === 'unconfigured').length,
      categories: Object.keys(groupedResults),
      keyless: resultsArray.filter((r: any) => r.keyless).length,
      configured: resultsArray.filter((r: any) => r.keyConfigured).length
    }

    return NextResponse.json({
      success: true,
      action: 'fresh_check',
      mode,
      summary,
      results: resultsArray,
      grouped: groupedResults,
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
