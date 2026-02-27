/**
 * MongoDB connection singleton for OpenClaw Hub
 * Uses MONGODB_URI from environment variables
 */
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

interface MongoClientCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

// In development, use a global variable to preserve the connection across HMR
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let cached: MongoClientCache = { client: null, promise: null };

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  cached.promise = global._mongoClientPromise;
} else {
  const client = new MongoClient(MONGODB_URI);
  cached.promise = client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  if (cached.client) return cached.client;
  if (!cached.promise) throw new Error('MongoDB client promise not initialized');
  cached.client = await cached.promise;
  return cached.client;
}

export async function getDb(dbName = 'openclaw'): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

export default cached;
