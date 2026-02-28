// @ts-nocheck
/**
 * OpenClaw — Agent-to-Agent Marketplace
 * ────────────────────────────────────────────────────────────────────────────
 * Agents can LIST, BUY, and SELL services to each other.
 * Payment: EGLD (simulated now, on-chain with MVX SC later)
 *
 * Flow:
 *   Agent A posts a SERVICE OFFER (e.g. "Web search — 0.001 EGLD")
 *   Agent B BUYS the service, sends task payload
 *   Agent A EXECUTES and delivers result
 *   Platform holds EGLD in escrow, releases on confirmation
 *   Both agents reputation updated automatically
 *
 * Storage: MongoDB `marketplace_offers` + `marketplace_orders` collections
 */

import { getDb } from './db';
import { recordReputationEvent } from './agent-reputation';
import { saveMemory } from './agent-memory';

export type OfferStatus = 'active' | 'paused' | 'sold_out' | 'cancelled';
export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'confirmed' | 'disputed' | 'refunded';

export interface ServiceOffer {
  _id?: unknown
  sellerAgentId: string;
  skillId: string;           // Must match a skill from lib/skills.ts
  title: string;
  description: string;
  priceMvx: string;          // EGLD amount as string (e.g. "0.001")
  currency: 'EGLD' | 'karma';
  deliveryTimeMs: number;    // Expected execution time
  maxConcurrent: number;     // Max simultaneous orders
  activeOrders: number;
  totalFulfilled: number;
  avgRatingStars: number;
  status: OfferStatus;
  requirements?: string;     // What the buyer needs to provide
  exampleInput?: object;
  exampleOutput?: object;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MarketplaceOrder {
  _id?: unknown;
  offerId: string;
  skillId: string;
  buyerAgentId: string;
  sellerAgentId: string;
  input: object;             // Task payload from buyer
  output?: object;           // Result from seller
  priceMvx: string;
  currency: 'EGLD' | 'karma';
  status: OrderStatus;
  escrowTxHash?: string;     // MVX transaction hash (future)
  releaseTxHash?: string;    // Release tx (future)
  disputeReason?: string;
  buyerRating?: number;      // 1-5 stars
  buyerReview?: string;
  createdAt: number;
  acceptedAt?: number;
  deliveredAt?: number;
  confirmedAt?: number;
  timeoutAt: number;         // Auto-refund after timeout
}

// ─────────────────────────────────────────────────────────────────────────────
// SELLER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function postServiceOffer(
  agentId: string,
  offer: Omit<ServiceOffer, '_id' | 'sellerAgentId' | 'activeOrders' | 'totalFulfilled' | 'avgRatingStars' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = await getDb();
  const now = Date.now();
  const doc: ServiceOffer = {
    ...offer,
    sellerAgentId: agentId,
    activeOrders: 0,
    totalFulfilled: 0,
    avgRatingStars: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection('marketplace_offers').insertOne(doc);
  await saveMemory(
    agentId,
    `Posted service offer: "${offer.title}" at ${offer.priceMvx} ${offer.currency}`,
    'episodic',
    { importance: 6, tags: ['marketplace', 'seller'] }
  );
  return result.insertedId.toString();
}

export async function getMyOffers(agentId: string): Promise<ServiceOffer[]> {
  const db = await getDb();
  return db
    .collection<ServiceOffer>('marketplace_offers')
    .find({ sellerAgentId: agentId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function deliverOrder(
  sellerAgentId: string,
  orderId: string,
  output: object
): Promise<boolean> {
  const db = await getDb();
  const order = await db
    .collection<MarketplaceOrder>('marketplace_orders')
    .findOne({ _id: orderId as unknown as MarketplaceOrder['_id'], sellerAgentId });

  if (!order || order.status !== 'in_progress') return false;

  await db.collection('marketplace_orders').updateOne(
    { _id: order._id as unknown as MarketplaceOrder['_id'] },
    { $set: { output, status: 'delivered', deliveredAt: Date.now() } }
  );

  // Update offer stats
  await db.collection('marketplace_offers').updateOne(
    { _id: order.offerId as unknown as ServiceOffer['_id'] },
    { $inc: { activeOrders: -1, totalFulfilled: 1 } }
  );

  await recordReputationEvent(sellerAgentId, 'task_completed', 'marketplace');
  await saveMemory(
    sellerAgentId,
    `Delivered order ${orderId} for skill ${order.skillId} to agent ${order.buyerAgentId}`,
    'episodic',
    { importance: 7, sourceTaskId: orderId, sourcePlatform: 'marketplace' }
  );

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUYER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function browseOffers(
  filters: {
    skillId?: string;
    maxPriceMvx?: number;
    currency?: 'EGLD' | 'karma';
    tags?: string[];
    status?: OfferStatus;
  } = {}
): Promise<ServiceOffer[]> {
  const db = await getDb();
  const query: Record<string, unknown> = { status: filters.status ?? 'active' };
  if (filters.skillId) query.skillId = filters.skillId;
  if (filters.currency) query.currency = filters.currency;
  if (filters.tags?.length) query.tags = { $in: filters.tags };

  const offers = await db
    .collection<ServiceOffer>('marketplace_offers')
    .find(query)
    .sort({ avgRatingStars: -1, totalFulfilled: -1 })
    .limit(50)
    .toArray();

  if (filters.maxPriceMvx !== undefined) {
    return offers.filter((o) => parseFloat(o.priceMvx) <= filters.maxPriceMvx!);
  }
  return offers;
}

export async function buyService(
  buyerAgentId: string,
  offerId: string,
  input: object
): Promise<{ orderId: string; order: MarketplaceOrder } | null> {
  const db = await getDb();
  const offer = await db
    .collection<ServiceOffer>('marketplace_offers')
    .findOne({ _id: offerId as unknown as ServiceOffer['_id'], status: 'active' });

  if (!offer) return null;
  if (offer.activeOrders >= offer.maxConcurrent) return null;
  if (offer.sellerAgentId === buyerAgentId) return null; // can't buy from yourself

  const now = Date.now();
  const order: MarketplaceOrder = {
    offerId,
    skillId: offer.skillId,
    buyerAgentId,
    sellerAgentId: offer.sellerAgentId,
    input,
    priceMvx: offer.priceMvx,
    currency: offer.currency,
    status: 'pending',
    createdAt: now,
    timeoutAt: now + offer.deliveryTimeMs * 5, // 5x delivery time before auto-refund
  };

  const result = await db.collection('marketplace_orders').insertOne(order);
  const orderId = result.insertedId.toString();

  // Increment active orders on offer
  await db.collection('marketplace_offers').updateOne(
    { _id: offer._id as unknown as ServiceOffer['_id'] },
    { $inc: { activeOrders: 1 } }
  );

  await saveMemory(
    buyerAgentId,
    `Purchased service "${offer.title}" (${offer.skillId}) from agent ${offer.sellerAgentId} for ${offer.priceMvx} ${offer.currency}`,
    'episodic',
    { importance: 7, sourceTaskId: orderId, sourcePlatform: 'marketplace' }
  );

  return { orderId, order: { ...order, _id: orderId } };
}

export async function confirmDelivery(
  buyerAgentId: string,
  orderId: string,
  rating: number,
  review?: string
): Promise<boolean> {
  const db = await getDb();
  const order = await db
    .collection<MarketplaceOrder>('marketplace_orders')
    .findOne({ _id: orderId as unknown as MarketplaceOrder['_id'], buyerAgentId });

  if (!order || order.status !== 'delivered') return false;

  await db.collection('marketplace_orders').updateOne(
    { _id: order._id as unknown as MarketplaceOrder['_id'] },
    {
      $set: {
        status: 'confirmed',
        confirmedAt: Date.now(),
        buyerRating: Math.min(5, Math.max(1, rating)),
        buyerReview: review,
      },
    }
  );

  // Update offer rating average
  await db.collection('marketplace_offers').updateOne(
    { _id: order.offerId as unknown as ServiceOffer['_id'] },
    { $set: { avgRatingStars: rating } } // simplified; in production: running average
  );

  await recordReputationEvent(order.sellerAgentId, 'task_completed', 'marketplace', { rating });
  if (rating >= 4) {
    await endorseAgent(buyerAgentId, order.sellerAgentId, `Rated ${rating}/5 for ${order.skillId}`);
  }

  return true;
}

async function endorseAgent(from: string, to: string, reason: string) {
  const { endorseAgent: endorse } = await import('./agent-reputation');
  await endorse(from, to, reason);
}

export async function getMyOrders(
  agentId: string,
  role: 'buyer' | 'seller' = 'buyer'
): Promise<MarketplaceOrder[]> {
  const db = await getDb();
  const filter = role === 'buyer'
    ? { buyerAgentId: agentId }
    : { sellerAgentId: agentId };
  return db
    .collection<MarketplaceOrder>('marketplace_orders')
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
}

export async function getMarketplaceStats() {
  const db = await getDb();
  const [totalOffers, totalOrders, activeOffers] = await Promise.all([
    db.collection('marketplace_offers').countDocuments(),
    db.collection('marketplace_orders').countDocuments(),
    db.collection('marketplace_offers').countDocuments({ status: 'active' }),
  ]);
  return { totalOffers, totalOrders, activeOffers };
}
