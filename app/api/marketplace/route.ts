/**
 * GET  /api/marketplace                    → browse all active offers
 * GET  /api/marketplace?agentId=&role=     → agent's offers or orders
 * GET  /api/marketplace?stats=true         → platform stats
 * POST /api/marketplace  { action: 'post_offer' | 'buy' | 'deliver' | 'confirm' | 'my_orders' }
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  browseOffers,
  postServiceOffer,
  buyService,
  deliverOrder,
  confirmDelivery,
  getMyOffers,
  getMyOrders,
  getMarketplaceStats,
} from '@/lib/agent-marketplace';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  const role = (searchParams.get('role') ?? 'buyer') as 'buyer' | 'seller';
  const stats = searchParams.get('stats') === 'true';
  const skillId = searchParams.get('skillId') ?? undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;

  if (stats) return NextResponse.json(await getMarketplaceStats());
  if (agentId && role === 'seller') return NextResponse.json({ offers: await getMyOffers(agentId) });
  if (agentId) return NextResponse.json({ orders: await getMyOrders(agentId, role) });

  const offers = await browseOffers({ skillId, maxPriceMvx: maxPrice });
  return NextResponse.json({ offers, total: offers.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case 'post_offer': {
      const { agentId, offer } = body;
      if (!agentId || !offer) return NextResponse.json({ error: 'Missing agentId or offer' }, { status: 400 });
      const id = await postServiceOffer(agentId, offer);
      return NextResponse.json({ success: true, offerId: id });
    }
    case 'buy': {
      const { buyerAgentId, offerId, input } = body;
      if (!buyerAgentId || !offerId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      const result = await buyService(buyerAgentId, offerId, input ?? {});
      if (!result) return NextResponse.json({ error: 'Offer unavailable or at capacity' }, { status: 409 });
      return NextResponse.json({ success: true, ...result });
    }
    case 'deliver': {
      const { sellerAgentId, orderId, output } = body;
      const ok = await deliverOrder(sellerAgentId, orderId, output ?? {});
      return NextResponse.json({ success: ok });
    }
    case 'confirm': {
      const { buyerAgentId, orderId, rating, review } = body;
      const ok = await confirmDelivery(buyerAgentId, orderId, rating ?? 5, review);
      return NextResponse.json({ success: ok });
    }
    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
