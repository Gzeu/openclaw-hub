import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL');
}

const convex = new ConvexHttpClient(convexUrl);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fromAgent, toAgent, task, priority = 'medium', context } = body;

    // Validate required fields
    if (!fromAgent || !toAgent || !task) {
      return NextResponse.json(
        { error: 'Missing required fields: fromAgent, toAgent, task' },
        { status: 400 }
      );
    }

    // Create delegation via Convex
    const delegationId = await convex.mutation(api.agentComms.delegateTaskToAgent, {
      fromAgent,
      toAgent,
      task,
      priority,
      context,
    });

    return NextResponse.json({ 
      success: true, 
      delegationId,
      message: 'Task delegated successfully'
    });
  } catch (error) {
    console.error('Delegation error:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status') as any;

    if (!agentId) {
      return NextResponse.json(
        { error: 'Missing agentId parameter' },
        { status: 400 }
      );
    }

    // Get delegations for agent
    const delegations = await convex.query(api.agentComms.getAgentDelegations, {
      agentId,
      status,
    });

    return NextResponse.json({
      success: true,
      delegations,
    });
  } catch (error) {
    console.error('Get delegations error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
