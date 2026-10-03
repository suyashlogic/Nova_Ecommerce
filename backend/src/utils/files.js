import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// backend/uploads and backend/uploads/products
export const UPLOADS_ROOT = path.resolve(__dirname, '..', '..', 'uploads');
export const PRODUCT_UPLOAD_DIR = path.join(UPLOADS_ROOT, 'products');
export const PRODUCT_URL_PREFIX = '/uploads/products/';

// The folder is git-ignored, so create it on startup if it's missing
fsSync.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });

export async function deleteFileAtPath(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // already gone: nothing to do
  }
}

// Turns "/uploads/products/abc.png" into a real file path and deletes it.
// path.basename() strips any "../" so a bad URL can never escape the folder.
export async function deleteProductImageByUrl(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith(PRODUCT_URL_PREFIX)) return;
  await deleteFileAtPath(path.join(PRODUCT_UPLOAD_DIR, path.basename(imageUrl)));
}
