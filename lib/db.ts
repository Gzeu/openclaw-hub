/**
 * MongoDB connection singleton for OpenClaw Hub
 * Uses MONGODB_URI from environment variables
 *
 * Local dev:  MONGODB_URI=mongodb://localhost:27017/openclaw
 * Atlas free: MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/openclaw
 *
 * NOTE: No top-level throw — safe for Vercel build even without MONGODB_URI set.
 * The error is thrown lazily at runtime when a DB call is actually made.
 */
import { MongoClient, Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

interface MongoClientCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

const cached: MongoClientCache = { client: null, promise: null };

function buildClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return Promise.reject(
      new Error(
        'MONGODB_URI is not defined.\n' +
        '  Local dev : MONGODB_URI=mongodb://localhost:27017/openclaw\n' +
        '  Atlas free: https://cloud.mongodb.com  (M0 cluster — always free)'
      )
    );
  }

  if (process.env.NODE_ENV === 'development') {
    // Preserve connection across HMR reloads in dev
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }

  // Production: create a new client per cold start
  return new MongoClient(uri).connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  if (cached.client) return cached.client;

  if (!cached.promise) {
    cached.promise = buildClientPromise();
  }

  try {
    cached.client = await cached.promise;
    return cached.client;
  } catch (err) {
    // Reset so the next request retries the connection
    cached.promise = null;
    throw err;
  }
}

export async function getDb(dbName = 'openclaw'): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

export default cached;
