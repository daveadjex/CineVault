import { PrismaClient } from "../prisma/generated/client/client.js"; // Adjust relative path to match your folder
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// Setup the PostgreSQL driver connection pooling mechanism
const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);

// Export a single client instance shared globally across your API endpoints
export const prisma = new PrismaClient({ adapter });
