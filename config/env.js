import { config } from 'dotenv';

config({ path: `.env` });

export const {
  DB_URI,
  NODE_ENV,
  PORT,
  SERVER_URL,
} = process.env