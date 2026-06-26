import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { clearCache, initDatabase } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'store.json');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing store.json');
}

clearCache();
initDatabase();
console.log('Demo data seeded successfully.');
