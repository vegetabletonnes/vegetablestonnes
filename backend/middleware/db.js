import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dataPath = (file) => join(__dirname, '..', 'data', file);

export const usersDb = new Low(new JSONFile(dataPath('users.json')), { users: [] });
export const productsDb = new Low(new JSONFile(dataPath('products.json')), { products: [] });
export const auctionsDb = new Low(new JSONFile(dataPath('auctions.json')), { auctions: [] });
export const bidsDb = new Low(new JSONFile(dataPath('bids.json')), { bids: [] });
export const ordersDb = new Low(new JSONFile(dataPath('orders.json')), { orders: [] });

export const initDb = async () => {
  await usersDb.read();
  await productsDb.read();
  await auctionsDb.read();
  await bidsDb.read();
  await ordersDb.read();
};
