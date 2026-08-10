import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const productsDb = new Low(new JSONFile(join(__dirname, '../data/products.json')), { products: [] });

// GET /api/products
router.get('/', async (req, res) => {
  try {
    await productsDb.read();
    const { category, active } = req.query;
    let products = productsDb.data.products;
    if (category) products = products.filter(p => p.category === category);
    if (active !== undefined) products = products.filter(p => p.active === (active === 'true'));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    await productsDb.read();
    const product = productsDb.data.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products (admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    await productsDb.read();
    const product = { id: `prod-${uuidv4().slice(0,8)}`, ...req.body, active: true, createdAt: new Date().toISOString() };
    productsDb.data.products.push(product);
    await productsDb.write();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await productsDb.read();
    const idx = productsDb.data.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    productsDb.data.products[idx] = { ...productsDb.data.products[idx], ...req.body, updatedAt: new Date().toISOString() };
    await productsDb.write();
    res.json(productsDb.data.products[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await productsDb.read();
    const idx = productsDb.data.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    productsDb.data.products.splice(idx, 1);
    await productsDb.write();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
