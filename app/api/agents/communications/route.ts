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
    const { action, ...data } = body;

    switch (action) {
      case 'createChannel': {
        const { channelName, participants, channelType } = data;
        const channelId = await convex.mutation(api.agentComms.createAgentChannel, {
          channelName,
          participants,
          channelType,
        });
        return NextResponse.json({ success: true, channelId });
      }

      case 'sendMessage': {
        const { channelId, senderId, message, messageType, metadata } = data;
        const messageId = await convex.mutation(api.agentComms.sendAgentMessage, {
          channelId,
          senderId,
          message,
          messageType,
          metadata,
        });
        return NextResponse.json({ success: true, messageId });
      }

      case 'updateHeartbeat': {
        const { agentId, status, currentTask, capabilities } = data;
        await convex.mutation(api.agentComms.updateAgentHeartbeat, {
          agentId,
          status,
          currentTask,
          capabilities,
        });
        return NextResponse.json({ success: true });
      }

      case 'respondToDelegation': {
        const { delegationId, response, responseMessage } = data;
        const result = await convex.mutation(api.agentComms.respondToDelegation, {
          delegationId,
          response,
          responseMessage,
        });
        return NextResponse.json({ success: true, result });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action', availableActions: ['createChannel', 'sendMessage', 'updateHeartbeat', 'respondToDelegation'] },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Agent communications error:', error);
    return NextResponse.json(
      { error: 'Failed to process communication', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'getChannel': {
        const channelId = searchParams.get('channelId');
        if (!channelId) {
          return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });
        }
        const channel = await convex.query(api.agentComms.getAgentChannel, { channelId: channelId as any });
        return NextResponse.json({ success: true, channel });
      }

      case 'getDelegations': {
        const agentId = searchParams.get('agentId');
        const status = searchParams.get('status') as any;
        if (!agentId) {
          return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
        }
        const delegations = await convex.query(api.agentComms.getAgentDelegations, {
          agentId,
          status,
        });
        return NextResponse.json({ success: true, delegations });
      }

      case 'getAgentStatus': {
        const agentIds = searchParams.get('agentIds')?.split(',');
        const status = await convex.query(api.agentComms.getAgentStatus, {
          agentIds: agentIds || undefined,
        });
        return NextResponse.json({ success: true, status });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action', availableActions: ['getChannel', 'getDelegations', 'getAgentStatus'] },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Get agent communications error:', error);
    return NextResponse.json(
      { error: 'Failed to get communications data', details: error.message },
      { status: 500 }
    );
  }
}
