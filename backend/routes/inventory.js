import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

const inventoryPath = join(__dirname, '../data/inventory.json');

const readInventory = () => JSON.parse(readFileSync(inventoryPath, 'utf-8'));
const writeInventory = (data) => writeFileSync(inventoryPath, JSON.stringify(data, null, 2));

// GET /api/inventory — public list with filters
router.get('/', (req, res) => {
  try {
    let items = readInventory();
    const { commodity, grade, status, auctionStatus, search } = req.query;

    if (commodity) items = items.filter(i => i.commodity.toLowerCase().includes(commodity.toLowerCase()));
    if (grade) items = items.filter(i => i.grade === grade);
    if (status) items = items.filter(i => i.status === status);
    if (auctionStatus) items = items.filter(i => i.auctionStatus === auctionStatus);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.commodity.toLowerCase().includes(q) ||
        i.variety.toLowerCase().includes(q) ||
        i.warehouse.toLowerCase().includes(q) ||
        i.origin.toLowerCase().includes(q)
      );
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/:id — single item
router.get('/:id', (req, res) => {
  try {
    const items = readInventory();
    const item = items.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory — admin create
router.post('/', verifyToken, requireAdmin, (req, res) => {
  try {
    const items = readInventory();
    const newItem = {
      id: 'INV' + String(Date.now()).slice(-6),
      ...req.body,
      createdAt: new Date().toISOString(),
      status: req.body.status || 'available',
      auctionStatus: req.body.auctionStatus || 'upcoming',
    };
    items.push(newItem);
    writeInventory(items);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/inventory/:id — admin update
router.put('/:id', verifyToken, requireAdmin, (req, res) => {
  try {
    const items = readInventory();
    const idx = items.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    items[idx] = { ...items[idx], ...req.body, id: req.params.id };
    writeInventory(items);
    res.json(items[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inventory/:id — admin delete
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  try {
    let items = readInventory();
    const idx = items.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const [removed] = items.splice(idx, 1);
    writeInventory(items);
    res.json({ message: 'Deleted', item: removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
