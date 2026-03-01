import { ConvexClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

export const getConvexClient = () => {
  return new ConvexClient(convexUrl);
};

// For server-side usage
export const getConvexServerClient = () => {
  const { ConvexHttpClient } = require("convex/server");
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }
  return new ConvexHttpClient(convexUrl);
};

// For subscription usage
export const getConvexClientWithSubscriptions = () => {
  const { ConvexClient } = require("convex/browser");
  return new ConvexClient(convexUrl);
};
