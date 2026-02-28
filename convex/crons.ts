import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Verifică tranzacțiile pending o dată pe minut
crons.interval(
  "check-pending-deposits",
  { minutes: 1 },
  internal.blockchain.verifyPendingDeposits
);

export default crons;
