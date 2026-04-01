import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Refresh the entire network of 100+ stores with new stock every day at midnight UTC
crons.cron(
  "refresh-marketplace-inventory",
  "0 0 * * *",
  (api as any).seed.populateMarketplace,
  {}
);

export default crons;
